"""
Visualization Service for Individual Member Reporting Back Dashboard.

Coordinates member survey answer extraction, AST formula evaluation,
and peer group benchmark aggregation to deliver time-series comparison curves.
"""

from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import extract
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.organisation import Organisation
from models.organisation_member import OrganisationMember
from models.peer_group import PeerGroup, PeerGroupMemberType
from models.data import Data
from models.answer import Answer
from services.benchmark_service import BenchmarkService, get_benchmark_service
from services.formula_evaluator import FormulaEvaluator
from services.survey_id_resolver import SurveyIdResolver


class VisualizationService:
    """
    Service coordinating individual dashboard data aggregation,
    member formula evaluation, and peer group benchmark integration.
    """

    def __init__(
        self,
        benchmark_service: Optional[BenchmarkService] = None,
        evaluator: Optional[FormulaEvaluator] = None,
        resolver: Optional[SurveyIdResolver] = None,
    ):
        self.benchmark_service = benchmark_service or get_benchmark_service()
        self.evaluator = evaluator or self.benchmark_service.evaluator
        self.resolver = resolver or self.benchmark_service.resolver

    @property
    def config(self) -> Dict[str, Any]:
        """Declarative configuration loaded via benchmark service."""
        return self.benchmark_service.config

    def resolve_organisation_peer_group(
        self, session: Session, organisation_id: int
    ) -> Tuple[Organisation, PeerGroup]:
        """
        Resolves organisation and its mapped peer group from member_type.
        Raises 404 if organisation is not found, or 422 if no peer group.
        """
        org = (
            session.query(Organisation)
            .filter(Organisation.id == organisation_id)
            .first()
        )
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Organisation {organisation_id} not found",
            )

        org_members = (
            session.query(OrganisationMember.member_type)
            .filter(OrganisationMember.organisation == organisation_id)
            .all()
        )
        mt_ids = [m[0] for m in org_members if m[0] is not None]
        if not mt_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Organisation {organisation_id} has no mapped "
                    "member type"
                ),
            )

        mapping = (
            session.query(PeerGroupMemberType)
            .filter(PeerGroupMemberType.member_type_id.in_(mt_ids))
            .first()
        )
        if not mapping or not mapping.peer_group_detail:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Organisation {organisation_id} has no mapped "
                    "peer group"
                ),
            )

        return org, mapping.peer_group_detail

    def extract_member_answers(
        self,
        session: Session,
        organisation_id: int,
        years: List[int],
    ) -> Dict[int, Dict[int, Any]]:
        """
        Extracts submitted survey answers for organisation across target years.
        Selects the latest submission per (year, form).
        Returns a dictionary mapping: year -> question_id -> value/list.
        """
        data_rows = (
            session.query(
                Data.id,
                Data.form,
                extract("year", Data.submitted).label("sub_year"),
                Data.submitted,
            )
            .filter(
                Data.organisation == organisation_id,
                Data.submitted.isnot(None),
                extract("year", Data.submitted).in_(years),
            )
            .order_by(Data.submitted.desc(), Data.id.desc())
            .all()
        )

        latest_submissions: Dict[Tuple[int, int], int] = {}
        data_to_year: Dict[int, int] = {}

        for row in data_rows:
            year = int(row.sub_year)
            key = (year, row.form)
            if key not in latest_submissions:
                latest_submissions[key] = row.id
                data_to_year[row.id] = year

        selected_data_ids = list(latest_submissions.values())
        year_answers: Dict[int, Dict[int, Any]] = {y: {} for y in years}

        if not selected_data_ids:
            return year_answers

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

        for a_row in answer_rows:
            if a_row.data not in data_to_year:
                continue
            y = data_to_year[a_row.data]
            qid = a_row.question
            val = a_row.value
            curr = year_answers[y].get(qid)
            if curr is None:
                year_answers[y][qid] = val
            elif isinstance(curr, list):
                curr.append(val)
            else:
                year_answers[y][qid] = [curr, val]

        return year_answers

    def get_individual_dashboard(
        self,
        session: Session,
        organisation_id: int,
        years: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """
        Main entrypoint generating full individual member dashboard payload.
        Resolves peer group, evaluates member values, merges peer averages.
        """
        org, peer_group = self.resolve_organisation_peer_group(
            session=session, organisation_id=organisation_id
        )
        resolved_years = self.benchmark_service.resolve_years(years)

        # 1. Extract member survey submissions
        year_answers = self.extract_member_answers(
            session=session,
            organisation_id=organisation_id,
            years=resolved_years,
        )

        # 2. Retrieve peer group benchmarks from BenchmarkService
        benchmarks = self.benchmark_service.get_peer_group_benchmarks(
            session=session,
            peer_group_id=peer_group.id,
            current_org_id=organisation_id,
            years=resolved_years,
        )

        # Index benchmarks by (indicator_id, year)
        bench_lookup: Dict[Tuple[str, int], Dict[str, Any]] = {}
        for ind_id, b_list in benchmarks.items():
            for pt in b_list:
                bench_lookup[(ind_id, pt["year"])] = pt

        # 3. Assemble challenges and indicators
        challenges_dto = []
        for ch in self.config.get("challenges", []):
            ch_dto = {
                "id": ch["id"],
                "name": ch["name"],
                "indicators": [],
            }

            for ind in ch.get("indicators", []):
                ind_id = ind["id"]
                formula = ind["formula"]
                resolved_formula = self.resolver.resolve_formula(formula)

                series = []
                for y in resolved_years:
                    answers_for_year = year_answers.get(y, {})
                    calc_val = None
                    if answers_for_year:
                        raw_val = self.evaluator.evaluate(
                            resolved_formula, answers_for_year
                        )
                        if raw_val is not None:
                            calc_val = round(float(raw_val), 4)

                    b_pt = bench_lookup.get((ind_id, y), {})
                    series.append(
                        {
                            "year": y,
                            "member": calc_val,
                            "isco_avg": b_pt.get("isco_avg"),
                            "gisco_avg": b_pt.get("gisco_avg"),
                        }
                    )

                ind_dto = {
                    "id": ind_id,
                    "name": ind["name"],
                    "country": ind.get("country", "Global"),
                    "unit": ind.get("unit", ind.get("type", "percentage")),
                    "chart_type": ind.get("chart_type", "line"),
                    "higher_is_better": ind.get("higher_is_better", True),
                    "series": series,
                }
                ch_dto["indicators"].append(ind_dto)

            challenges_dto.append(ch_dto)

        return {
            "organisation": {
                "id": org.id,
                "name": org.name,
                "peer_group": {
                    "id": peer_group.id,
                    "code": peer_group.code,
                    "name": peer_group.name,
                },
            },
            "years": resolved_years,
            "challenges": challenges_dto,
        }


_visualization_service_instance: Optional[VisualizationService] = None


def get_visualization_service() -> VisualizationService:
    """Dependency provider returning singleton service instance."""
    global _visualization_service_instance
    if _visualization_service_instance is None:
        _visualization_service_instance = VisualizationService()
    return _visualization_service_instance
