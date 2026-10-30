"""
Peer Group Benchmark Aggregation Engine & In-Memory TTLCache Service

Computes multi-year (2022 to current monitoring year) ISCO and GISCO
cohort averages for harmonized peer groups from submitted member answers.
Supports configurable member self-exclusion (O(1) subtraction),
cohort anonymity threshold gates (N >= 3), and in-memory TTL caching (< 50ms).
"""

import os
import json
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Tuple
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from models.data import Data
from models.answer import Answer
from models.peer_group import PeerGroupMemberType
from models.organisation_member import OrganisationMember
from models.organisation_isco import OrganisationIsco
from models.isco_type import IscoType
from services.formula_evaluator import FormulaEvaluator
from services.survey_id_resolver import SurveyIdResolver
from util.ttl_cache import TTLCache


DEFAULT_CONFIG_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "source",
    "config",
    "visualization_mapping.json",
)


class BenchmarkService:
    """
    High-performance cohort aggregation and peer group benchmark service.
    """

    def __init__(
        self,
        cache: Optional[TTLCache] = None,
        config: Optional[Dict[str, Any]] = None,
        config_path: Optional[str] = None,
        evaluator: Optional[FormulaEvaluator] = None,
        resolver: Optional[SurveyIdResolver] = None,
    ):
        self.cache = (
            cache if cache is not None else TTLCache(maxsize=128, ttl=3600.0)
        )
        self.config_path = config_path or os.environ.get(
            "VISUALIZATION_MAPPING_PATH", DEFAULT_CONFIG_PATH
        )
        self._config = config
        self.evaluator = evaluator or FormulaEvaluator()
        self.resolver = resolver or SurveyIdResolver()

    @property
    def config(self) -> Dict[str, Any]:
        """Lazy-loads declarative visualization configuration."""
        if self._config is not None:
            return self._config

        candidates = [
            self.config_path,
            "source/config/visualization_mapping.json",
            "backend/source/config/visualization_mapping.json",
            os.path.abspath(self.config_path),
        ]
        for path in candidates:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    self._config = json.load(f)
                    return self._config

        # Fallback default configuration
        self._config = {
            "start_year": 2022,
            "end_year": None,
            "exclude_current_member_from_average": False,
            "challenges": [],
        }
        return self._config

    def resolve_years(self, years: Optional[List[int]] = None) -> List[int]:
        """
        Resolves monitoring years:
          - If explicitly provided, returns sorted unique years.
          - Otherwise, dynamically generates years from start_year
            through end_year (or datetime.now().year if end_year is null).
        """
        if years:
            return sorted(list(set(years)))

        start_year = self.config.get("start_year", 2022)
        end_year = self.config.get("end_year") or datetime.now().year
        return list(range(start_year, end_year + 1))

    def should_exclude_current_member(self) -> bool:
        """Checks whether member self-exclusion from averages is enabled."""
        env_toggle = os.environ.get("VISUALIZATION_EXCLUDE_CURRENT_MEMBER")
        if env_toggle is not None:
            return env_toggle.strip().lower() in ("true", "1", "yes")
        return bool(
            self.config.get("exclude_current_member_from_average", False)
        )

    def get_peer_group_organisations(
        self, session: Session, peer_group_id: int
    ) -> Tuple[List[int], Set[int]]:
        """
        Queries all organisations mapped to the peer group and identifies
        which among them belong to the GISCO platform.
        """
        member_type_rows = (
            session.query(PeerGroupMemberType.member_type_id)
            .filter(PeerGroupMemberType.peer_group_id == peer_group_id)
            .all()
        )
        member_type_ids = [r[0] for r in member_type_rows]
        if not member_type_ids:
            return [], set()

        org_rows = (
            session.query(OrganisationMember.organisation)
            .filter(OrganisationMember.member_type.in_(member_type_ids))
            .distinct()
            .all()
        )
        all_peer_org_ids = [r[0] for r in org_rows]
        if not all_peer_org_ids:
            return [], set()

        gisco_rows = (
            session.query(OrganisationIsco.organisation)
            .join(IscoType, IscoType.id == OrganisationIsco.isco_type)
            .filter(
                OrganisationIsco.organisation.in_(all_peer_org_ids),
                func.lower(IscoType.name) == "gisco",
            )
            .distinct()
            .all()
        )
        gisco_org_ids = {r[0] for r in gisco_rows}

        return all_peer_org_ids, gisco_org_ids

    def get_all_indicators(self) -> List[Dict[str, Any]]:
        """Extracts flat list of all indicators defined in configuration."""
        indicators = []
        for challenge in self.config.get("challenges", []):
            for ind in challenge.get("indicators", []):
                indicators.append(ind)
        return indicators

    def extract_raw_cohort_submissions(
        self,
        session: Session,
        peer_org_ids: List[int],
        gisco_org_ids: Set[int],
        years: List[int],
    ) -> Dict[str, Dict[int, Dict[int, float]]]:
        """
        Bulk queries submitted Data and Answer records for peer organisations
        across the requested years in 0 N+1 queries.

        Returns:
            Dict mapping indicator_id -> year -> org_id -> computed_value
        """
        if not peer_org_ids or not years:
            return {}

        # 1. Query submitted data rows
        data_rows = (
            session.query(
                Data.id,
                Data.organisation,
                Data.form,
                extract("year", Data.submitted).label("sub_year"),
                Data.submitted,
            )
            .filter(
                Data.organisation.in_(peer_org_ids),
                Data.submitted.isnot(None),
                extract("year", Data.submitted).in_(years),
            )
            .order_by(Data.submitted.desc())
            .all()
        )

        # De-duplicate to latest submission per (organisation, year, form)
        latest_submissions: Dict[Tuple[int, int, int], int] = {}
        data_to_org_year: Dict[int, Tuple[int, int]] = {}

        for row in data_rows:
            year = int(row.sub_year)
            key = (row.organisation, year, row.form)
            if key not in latest_submissions:
                latest_submissions[key] = row.id
                data_to_org_year[row.id] = (row.organisation, year)

        selected_data_ids = list(latest_submissions.values())
        if not selected_data_ids:
            return {}

        # 2. Bulk query answers for all selected data IDs
        answer_rows = (
            session.query(
                Answer.data,
                Answer.question,
                Answer.value,
                Answer.repeat_index,
            )
            .filter(Answer.data.in_(selected_data_ids))
            .all()
        )

        # 3. Assemble answers mapping: org -> year -> question -> value/list
        org_year_answers: Dict[int, Dict[int, Dict[int, Any]]] = {}
        for a_row in answer_rows:
            if a_row.data not in data_to_org_year:
                continue
            org_id, year = data_to_org_year[a_row.data]
            if org_id not in org_year_answers:
                org_year_answers[org_id] = {}
            if year not in org_year_answers[org_id]:
                org_year_answers[org_id][year] = {}

            qid = a_row.question
            val = a_row.value
            current = org_year_answers[org_id][year].get(qid)
            if current is None:
                org_year_answers[org_id][year][qid] = val
            elif isinstance(current, list):
                current.append(val)
            else:
                org_year_answers[org_id][year][qid] = [current, val]

        # 4. Evaluate all 9 indicators for each organisation and year
        indicators = self.get_all_indicators()
        cohort_results: Dict[str, Dict[int, Dict[int, float]]] = {}

        for ind in indicators:
            ind_id = ind["id"]
            formula = ind["formula"]
            resolved_formula = self.resolver.resolve_formula(formula)
            cohort_results[ind_id] = {}

            for year in years:
                cohort_results[ind_id][year] = {}
                for org_id in peer_org_ids:
                    answers = org_year_answers.get(org_id, {}).get(year, {})
                    if not answers:
                        continue
                    calc_val = self.evaluator.evaluate(
                        resolved_formula, answers
                    )
                    if calc_val is not None:
                        cohort_results[ind_id][year][org_id] = float(calc_val)

        return cohort_results

    def compute_average(
        self,
        cohort_values: Dict[int, float],
        current_org_id: Optional[int] = None,
        exclude_current_member: bool = False,
        min_cohort_size: int = 3,
    ) -> Optional[float]:
        """
        Computes arithmetic cohort average with anonymity gate (N >= 3)
        and O(1) self-exclusion subtraction.
        """
        if not cohort_values:
            return None

        total_sum = sum(cohort_values.values())
        total_count = len(cohort_values)

        if exclude_current_member and current_org_id in cohort_values:
            total_sum -= cohort_values[current_org_id]
            total_count -= 1

        if total_count < min_cohort_size:
            return None

        return round(total_sum / total_count, 4)

    def get_peer_group_benchmarks(
        self,
        session: Session,
        peer_group_id: int,
        current_org_id: Optional[int] = None,
        years: Optional[List[int]] = None,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Retrieves cached cohort aggregates or calculates them from database.
        Returns indicator series containing isco_avg and gisco_avg per year.
        """
        resolved_years = self.resolve_years(years)
        exclude_self = self.should_exclude_current_member()

        cache_key = (
            f"benchmarks_pg_{peer_group_id}_years_"
            f"{'_'.join(str(y) for y in resolved_years)}"
        )

        cached_data = self.cache.get(cache_key)
        if cached_data is not None:
            raw_cohorts, gisco_org_ids = cached_data
        else:
            peer_org_ids, gisco_org_ids = self.get_peer_group_organisations(
                session, peer_group_id
            )
            raw_cohorts = self.extract_raw_cohort_submissions(
                session, peer_org_ids, gisco_org_ids, resolved_years
            )
            self.cache.set(cache_key, (raw_cohorts, gisco_org_ids))

        # Generate benchmarks from cohort aggregates
        result: Dict[str, List[Dict[str, Any]]] = {}
        for ind in self.get_all_indicators():
            ind_id = ind["id"]
            ind_series = []
            ind_cohort = raw_cohorts.get(ind_id, {})

            for y in resolved_years:
                isco_vals = ind_cohort.get(y, {})
                gisco_vals = {
                    org: val
                    for org, val in isco_vals.items()
                    if org in gisco_org_ids
                }

                isco_avg = self.compute_average(
                    cohort_values=isco_vals,
                    current_org_id=current_org_id,
                    exclude_current_member=exclude_self,
                )
                gisco_avg = self.compute_average(
                    cohort_values=gisco_vals,
                    current_org_id=current_org_id,
                    exclude_current_member=exclude_self,
                )

                ind_series.append(
                    {
                        "year": y,
                        "isco_avg": isco_avg,
                        "gisco_avg": gisco_avg,
                    }
                )

            result[ind_id] = ind_series

        return result

    def invalidate_cache(self, peer_group_id: Optional[int] = None) -> None:
        """Invalidates cache for a peer group or clears all entries."""
        if peer_group_id is None:
            self.cache.clear()
            return

        with self.cache._lock:
            prefix = f"benchmarks_pg_{peer_group_id}_"
            keys_to_delete = [
                k for k in self.cache._store.keys()
                if str(k).startswith(prefix)
            ]
            for k in keys_to_delete:
                del self.cache._store[k]


# Singleton service instance
_benchmark_service_instance: Optional[BenchmarkService] = None


def get_benchmark_service() -> BenchmarkService:
    """Returns the singleton BenchmarkService instance."""
    global _benchmark_service_instance
    if _benchmark_service_instance is None:
        _benchmark_service_instance = BenchmarkService()
    return _benchmark_service_instance
