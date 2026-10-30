import time
from datetime import datetime
from unittest.mock import MagicMock

import models.member_type  # noqa: F401
import models.isco_type  # noqa: F401
import models.organisation  # noqa: F401
import models.user  # noqa: F401
import models.form  # noqa: F401
import models.question_group  # noqa: F401
import models.question  # noqa: F401
import models.question_member_access  # noqa: F401
import models.question_isco_access  # noqa: F401
import models.question_group_member_access  # noqa: F401
import models.question_group_isco_access  # noqa: F401
import models.cascade  # noqa: F401
import models.cascade_list  # noqa: F401
import models.option  # noqa: F401
import models.skip_logic  # noqa: F401

from services.benchmark_service import (
    BenchmarkService,
    get_benchmark_service,
)
from util.ttl_cache import TTLCache


class TestBenchmarkServiceYearsResolution:
    """Verifies dynamic and bounded monitoring year resolution."""

    def test_explicit_years_parameter_respected(self):
        service = BenchmarkService()
        years = service.resolve_years([2022, 2023, 2024])
        assert years == [2022, 2023, 2024]

    def test_dynamic_years_resolution_defaults_to_current_year(self):
        cfg = {"start_year": 2022, "end_year": None}
        service = BenchmarkService(config=cfg)
        years = service.resolve_years()
        current_year = datetime.now().year
        assert years[0] == 2022
        assert years[-1] == current_year
        assert len(years) == (current_year - 2022 + 1)

    def test_bounded_end_year_in_config(self):
        cfg = {"start_year": 2022, "end_year": 2024}
        service = BenchmarkService(config=cfg)
        years = service.resolve_years()
        assert years == [2022, 2023, 2024]


class TestBenchmarkCalculationLogic:
    """Verifies cohort averaging, anonymity gates, and self-exclusion."""

    def test_anonymity_gate_masks_when_less_than_3_members(self):
        service = BenchmarkService()

        # Cohort with 2 members
        isco_vals = {101: 0.30, 102: 0.40}
        avg = service.compute_average(
            cohort_values=isco_vals,
            current_org_id=None,
            exclude_current_member=False,
        )
        # Less than 3 reporting members -> None
        assert avg is None

        # Cohort with 3 members
        isco_vals[103] = 0.50
        avg = service.compute_average(
            cohort_values=isco_vals,
            current_org_id=None,
            exclude_current_member=False,
        )
        assert avg == round((0.30 + 0.40 + 0.50) / 3, 4)

    def test_isco_vs_gisco_separate_cohorts(self):
        service = BenchmarkService()

        # 4 ISCO members, 3 of which are GISCO
        member_values = {1: 0.20, 2: 0.40, 3: 0.60, 4: 0.80}
        gisco_org_ids = {1, 2, 3}

        isco_avg = service.compute_average(
            cohort_values=member_values,
            current_org_id=None,
            exclude_current_member=False,
        )
        assert isco_avg == round((0.20 + 0.40 + 0.60 + 0.80) / 4, 4)  # 0.50

        gisco_values = {
            org: val for org, val in member_values.items()
            if org in gisco_org_ids
        }
        gisco_avg = service.compute_average(
            cohort_values=gisco_values,
            current_org_id=None,
            exclude_current_member=False,
        )
        assert gisco_avg == round((0.20 + 0.40 + 0.60) / 3, 4)  # 0.40

    def test_self_exclusion_calculation_and_anonymity(self):
        service = BenchmarkService()

        # Cohort of 4 members: 0.10, 0.20, 0.30, 0.40 (Sum = 1.00)
        cohort = {1: 0.10, 2: 0.20, 3: 0.30, 4: 0.40}

        # Exclude Org 4 (0.40): Remaining 3 members (0.10, 0.20, 0.30)
        # Remaining count = 3 >= 3, Average = 0.60 / 3 = 0.20
        excluded_avg = service.compute_average(
            cohort_values=cohort,
            current_org_id=4,
            exclude_current_member=True,
        )
        assert excluded_avg == 0.20

        # Without exclusion: 1.00 / 4 = 0.25
        included_avg = service.compute_average(
            cohort_values=cohort,
            current_org_id=4,
            exclude_current_member=False,
        )
        assert included_avg == 0.25

        # If cohort originally had 3 members, excluding 1 leaves 2 (< 3)
        cohort_3 = {1: 0.10, 2: 0.20, 3: 0.30}
        masked_avg = service.compute_average(
            cohort_values=cohort_3,
            current_org_id=3,
            exclude_current_member=True,
        )
        assert masked_avg is None


class TestTTLCacheIntegrationAndLatency:
    """Verifies in-memory TTLCache integration, latency, and invalidation."""

    def test_cache_hit_latency_under_50ms(self):
        cache = TTLCache(maxsize=16, ttl=3600)
        service = BenchmarkService(cache=cache)

        mock_session = MagicMock()
        # Mock cohort extraction
        service.get_peer_group_organisations = MagicMock(
            return_value=([1, 2, 3], {1, 2, 3})
        )
        service.extract_raw_cohort_submissions = MagicMock(
            return_value={
                "sourced_directly": {
                    2022: {1: 0.30, 2: 0.40, 3: 0.50},
                    2023: {1: 0.40, 2: 0.50, 3: 0.60},
                    2024: {1: 0.50, 2: 0.60, 3: 0.70},
                }
            }
        )

        # Call 1: Cache Miss
        res1 = service.get_peer_group_benchmarks(
            session=mock_session,
            peer_group_id=1,
            years=[2022, 2023, 2024],
        )
        assert "sourced_directly" in res1

        # Call 2: Cache Hit
        start_t = time.monotonic()
        res2 = service.get_peer_group_benchmarks(
            session=mock_session,
            peer_group_id=1,
            years=[2022, 2023, 2024],
        )
        elapsed_ms = (time.monotonic() - start_t) * 1000.0

        assert res1 == res2
        # Verify sub-50ms performance requirement (TAC-03.2)
        assert elapsed_ms < 50.0

    def test_cache_invalidation(self):
        cache = TTLCache(maxsize=16, ttl=3600)
        service = BenchmarkService(cache=cache)

        cache.set("benchmarks_pg_1_years_2022_2023", {"data": 123})
        cache.set("benchmarks_pg_2_years_2022_2023", {"data": 456})

        # Invalidate specific peer group
        service.invalidate_cache(peer_group_id=1)
        assert cache.get("benchmarks_pg_1_years_2022_2023") is None
        assert cache.get("benchmarks_pg_2_years_2022_2023") == {"data": 456}

        # Invalidate all
        service.invalidate_cache()
        assert len(cache) == 0

    def test_singleton_getter(self):
        s1 = get_benchmark_service()
        s2 = get_benchmark_service()
        assert s1 is s2


class TestBenchmarkDatabaseIntegration:
    """End-to-end integration tests using real PostgreSQL session."""

    def test_database_bulk_query_and_aggregation(self, session):
        from models.peer_group import PeerGroup, PeerGroupMemberType
        from models.member_type import MemberType
        from models.organisation import Organisation
        from models.organisation_member import OrganisationMember
        from models.organisation_isco import OrganisationIsco
        from models.isco_type import IscoType
        from models.data import Data
        from models.answer import Answer
        from models.form import Form
        from models.question_group import QuestionGroup
        from models.question import Question, QuestionType

        # 1. Ensure Form and Question exist
        created_form = False
        created_qg = False
        created_question = False

        form = session.query(Form).filter(Form.id == 7).first()
        if not form:
            form = Form(
                id=7,
                name="Member Survey Webform",
                description="Test",
                enable_prefilled_value=False,
                languages=["en"],
            )
            session.add(form)
            session.flush()
            created_form = True

        qg = (
            session.query(QuestionGroup)
            .filter(QuestionGroup.form == 7)
            .first()
        )
        if not qg:
            qg = QuestionGroup(
                id=7790,
                form=7,
                name="Test Group",
                translations=[],
                repeat=False,
                order=1,
                description=None,
                repeat_text=None,
                leading_question=None,
                show_repeat_in_question_level=False,
            )
            session.add(qg)
            session.flush()
            created_qg = True

        # Check resolved ID for canonical 86
        service = BenchmarkService()
        local_qid = service.resolver.resolve_question_id(86)
        question = (
            session.query(Question)
            .filter(Question.id == local_qid)
            .first()
        )
        if not question:
            question = Question(
                id=local_qid,
                name="Share of cocoa sourced directly",
                form=7,
                question_group=qg.id,
                translations=[],
                mandatory=False,
                datapoint_name=False,
                variable_name="test_direct_share_86",
                type=QuestionType.number,
                personal_data=False,
                rule=None,
                tooltip=None,
                cascade=None,
                tooltip_translations=None,
                repeating_objects=None,
                order=1,
                core_mandatory=False,
                deactivate=False,
                autofield=None,
            )
            session.add(question)
            session.flush()
            created_question = True
        session.commit()

        # 2. Setup Peer Group & Member Type
        pg = PeerGroup(id=7701, name="Integration Test PG", code="int_test_pg")
        session.add(pg)
        mt = MemberType(id=7710, name="Integration Test MT")
        session.add(mt)
        session.commit()

        pg_mt = PeerGroupMemberType(
            id=7720,
            peer_group_id=pg.id,
            member_type_id=mt.id,
            isco_scope="ALL",
        )
        session.add(pg_mt)

        # 3. Setup GISCO IscoType
        gisco_type = (
            session.query(IscoType)
            .filter(IscoType.name.ilike("gisco"))
            .first()
        )
        if not gisco_type:
            gisco_type = IscoType(id=7730, name="GISCO")
            session.add(gisco_type)
            session.commit()

        disco_type = (
            session.query(IscoType)
            .filter(IscoType.name.ilike("disco"))
            .first()
        )
        if not disco_type:
            disco_type = IscoType(id=7731, name="DISCO")
            session.add(disco_type)
            session.commit()

        # 4. Setup 4 Organisations (3 GISCO, 1 DISCO)
        org_ids = [7741, 7742, 7743, 7744]
        for idx, oid in enumerate(org_ids):
            org = Organisation(
                name=f"Test Org {oid}", code=f"ORG{oid}", active=True
            )
            org.id = oid
            session.add(org)
            session.add(
                OrganisationMember(
                    id=None, organisation=oid, member_type=mt.id
                )
            )
            # 7741, 7742, 7744 -> GISCO, 7743 -> DISCO
            assigned_isco = gisco_type.id if oid != 7743 else disco_type.id
            session.add(
                OrganisationIsco(
                    id=None, organisation=oid, isco_type=assigned_isco
                )
            )
        session.commit()

        # 5. Setup Submissions & Answers for 2022
        # Org 7741: 0.30, Org 7742: 0.40, Org 7743: 0.50, Org 7744: 0.20
        # ISCO average = (0.30 + 0.40 + 0.50 + 0.20) / 4 = 0.3500
        # GISCO average (7741, 7742, 7744) = (0.30 + 0.40 + 0.20) / 3 = 0.3000
        values = {7741: 0.30, 7742: 0.40, 7743: 0.50, 7744: 0.20}
        created_data_ids = []

        try:
            for oid, val in values.items():
                data_sub = datetime(2022, 5, 1, 10, 0, 0)
                d = Data(
                    name=f"Sub_{oid}_2022",
                    form=7,
                    geo=[],
                    locked_by=None,
                    created_by=1,
                    organisation=oid,
                    submitted_by=1,
                    created=data_sub,
                    updated=data_sub,
                    submitted=data_sub,
                )
                session.add(d)
                session.flush()
                created_data_ids.append(d.id)

                ans = Answer(
                    question=local_qid,
                    created=data_sub,
                    data=d.id,
                    value=val,
                )
                session.add(ans)
            session.commit()

            # Execute Benchmark Service
            bench_service = BenchmarkService()
            benchmarks = bench_service.get_peer_group_benchmarks(
                session=session,
                peer_group_id=pg.id,
                years=[2022],
            )

            assert "sourced_directly" in benchmarks
            series_2022 = next(
                s for s in benchmarks["sourced_directly"] if s["year"] == 2022
            )
            assert series_2022["isco_avg"] == 0.35
            assert series_2022["gisco_avg"] == 0.30

            # Test self-exclusion of Org 7744 (0.20):
            # ISCO remaining: 7741 (0.30), 7742 (0.40), 7743 (0.50)
            # sum=1.20 / 3 = 0.4000
            # GISCO remaining: 7741 (0.30), 7742 (0.40) -> count=2 < 3 -> None!
            bench_service._config = {
                "start_year": 2022,
                "end_year": 2022,
                "exclude_current_member_from_average": True,
                "challenges": bench_service.config.get("challenges", []),
            }
            # clear cache to force recalculation with exclusion
            bench_service.invalidate_cache()
            excluded_benchmarks = bench_service.get_peer_group_benchmarks(
                session=session,
                peer_group_id=pg.id,
                current_org_id=7744,
                years=[2022],
            )
            ex_series_2022 = next(
                s for s in excluded_benchmarks["sourced_directly"]
                if s["year"] == 2022
            )
            assert ex_series_2022["isco_avg"] == 0.40
            assert ex_series_2022["gisco_avg"] is None

        finally:
            # Clean up test artifacts
            session.query(Answer).filter(
                Answer.data.in_(created_data_ids)
            ).delete(synchronize_session=False)
            session.query(Data).filter(
                Data.id.in_(created_data_ids)
            ).delete(synchronize_session=False)
            session.query(OrganisationIsco).filter(
                OrganisationIsco.organisation.in_(org_ids)
            ).delete(synchronize_session=False)
            session.query(OrganisationMember).filter(
                OrganisationMember.organisation.in_(org_ids)
            ).delete(synchronize_session=False)
            session.query(Organisation).filter(
                Organisation.id.in_(org_ids)
            ).delete(synchronize_session=False)
            session.query(PeerGroupMemberType).filter(
                PeerGroupMemberType.id == 7720
            ).delete(synchronize_session=False)
            session.query(MemberType).filter(
                MemberType.id == 7710
            ).delete(synchronize_session=False)
            session.query(PeerGroup).filter(
                PeerGroup.id == 7701
            ).delete(synchronize_session=False)
            if created_question:
                session.query(Question).filter(
                    Question.id == local_qid
                ).delete(synchronize_session=False)
            if created_qg:
                session.query(QuestionGroup).filter(
                    QuestionGroup.id == 7790
                ).delete(synchronize_session=False)
            if created_form:
                session.query(Form).filter(
                    Form.id == 7
                ).delete(synchronize_session=False)
            session.commit()
