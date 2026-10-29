#!/usr/bin/env python3
"""
Synthetic Visualization Answer Seeder CLI & Module

Seeds realistic 2022–2024 survey answers for local developers and QA testers.
Translates canonical indicator Question IDs using SurveyIdResolver.
"""

import os
import sys
import argparse
from datetime import datetime
from typing import List, Optional, Dict, Any

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Initialize all models in SQLAlchemy registry
from db.connection import SessionLocal  # noqa: E402
import models.member_type  # noqa: F401, E402
import models.isco_type  # noqa: F401, E402
import models.organisation  # noqa: F401, E402
import models.user  # noqa: F401, E402
import models.form  # noqa: F401, E402
import models.question_group  # noqa: F401, E402
import models.question  # noqa: F401, E402
import models.cascade  # noqa: F401, E402
import models.cascade_list  # noqa: F401, E402
import models.option  # noqa: F401, E402
import models.skip_logic  # noqa: F401, E402
import models.question_group_member_access  # noqa: F401, E402
import models.question_group_isco_access  # noqa: F401, E402
import models.question_member_access  # noqa: F401, E402
import models.question_isco_access  # noqa: F401, E402
import models.answer  # noqa: F401, E402
import models.data  # noqa: F401, E402

from models.form import Form  # noqa: E402
from models.question import Question, QuestionType  # noqa: E402
from models.organisation import Organisation  # noqa: E402
from models.user import User, UserRole  # noqa: E402
from models.data import Data  # noqa: E402
from models.answer import Answer  # noqa: E402
from services.survey_id_resolver import SurveyIdResolver  # noqa: E402


# Canonical benchmark indicators across reporting years
BENCHMARK_VALUES: Dict[int, Dict[int, Any]] = {
    86: {2022: 65.0, 2023: 72.5, 2024: 81.0},     # Share sourced directly
    840: {2022: 35.0, 2023: 27.5, 2024: 19.0},    # Share sourced indirectly
    841: {2022: 100.0, 2023: 100.0, 2024: 100.0},  # Total sourcing
    851: {2022: 45.0, 2023: 58.0, 2024: 70.0},    # Farm-level polygon
    1216: {2022: 40.0, 2023: 52.0, 2024: 65.0},   # Traceability to community
    842: {2022: 150000.0, 2023: 165000.0, 2024: 180000.0},  # Sourced volume
    847: {2022: 120000.0, 2023: 135000.0, 2024: 155000.0},  # Deforestation
    575: {2022: ["Yes"], 2023: ["Yes"], 2024: ["Yes"]},      # CLMRS covered
    577: {2022: 25000.0, 2023: 32000.0, 2024: 41000.0},     # Farmers in CLMRS
    873: {2022: 30.0, 2023: 42.0, 2024: 55.0},    # Access to living income
    579: {2022: 1200.0, 2023: 1800.0, 2024: 2500.0},       # Child labour rem
    874: {2022: 20.0, 2023: 35.0, 2024: 48.0},    # Living income strategies
}


def seed_mock_visualization_data(
    session,
    form_id: Optional[int] = None,
    org_id: Optional[int] = None,
    user_id: Optional[int] = None,
    years: Optional[List[int]] = None,
    ledger_file: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Seeds mock survey submissions and indicator answers for 2022–2024.
    """
    if years is None:
        years = [2022, 2023, 2024]

    resolver = SurveyIdResolver(mapping_path=ledger_file)
    resolver.load_mapping()

    # 1. Resolve target Form
    if form_id:
        target_form_id = form_id
    else:
        target_form_id = resolver.resolve_form_id(7)

    form_rec = session.query(Form).filter_by(id=target_form_id).first()
    if not form_rec:
        # Fallback to any member form
        form_rec = session.query(Form).filter(Form.id.in_([1, 7])).first()
    if not form_rec:
        raise ValueError(f"Form ID {target_form_id} not found in database.")

    # 2. Resolve Organisation & User
    if org_id:
        org_rec = session.query(Organisation).filter_by(id=org_id).first()
    else:
        org_rec = session.query(Organisation).filter_by(active=True).first()
    if not org_rec:
        org_rec = Organisation(
            name="Mock DISCO Member Org",
            code="MOCK_DISCO",
            active=True,
        )
        session.add(org_rec)
        session.flush()

    if user_id:
        user_rec = session.query(User).filter_by(id=user_id).first()
    else:
        user_rec = session.query(User).filter_by(
            organisation=org_rec.id
        ).first()
    if not user_rec:
        user_rec = session.query(User).first()
    if not user_rec:
        user_rec = User(
            email="mock.seeder@akvo.org",
            password="mockpassword",
            name="Mock Seeder Admin",
            phone_number="123456",
            role=UserRole.secretariat_admin,
            organisation=org_rec.id,
        )
        session.add(user_rec)
        session.flush()

    # Gather available questions in target form
    available_qs = (
        session.query(Question)
        .filter_by(form=form_rec.id)
        .all()
    )
    q_by_id = {q.id: q for q in available_qs}

    created_submissions = []

    # 3. Insert / update submission for each year
    for yr in sorted(years):
        sub_name = f"Mock Reporting {yr} - {org_rec.name}"
        sub_date = datetime(yr, 12, 15, 12, 0, 0)

        data_rec = (
            session.query(Data)
            .filter_by(
                form=form_rec.id,
                organisation=org_rec.id,
                name=sub_name,
            )
            .first()
        )
        if not data_rec:
            data_rec = Data(
                name=sub_name,
                form=form_rec.id,
                geo=[5.55, -0.20],
                locked_by=None,
                created_by=user_rec.id,
                organisation=org_rec.id,
                submitted_by=user_rec.id,
                updated=datetime.utcnow(),
                created=sub_date,
                submitted=sub_date,
            )
            session.add(data_rec)
            session.flush()
        else:
            data_rec.updated = datetime.utcnow()
            data_rec.submitted = sub_date

        answers_count = 0

        # Seed benchmark values
        for canonical_qid, yr_values in BENCHMARK_VALUES.items():
            local_qid = resolver.resolve_question_id(canonical_qid)
            q_model = q_by_id.get(local_qid)
            if not q_model:
                continue

            val = yr_values.get(yr)
            if val is None:
                continue

            ans_rec = (
                session.query(Answer)
                .filter_by(data=data_rec.id, question=local_qid)
                .first()
            )

            numeric_val = None
            text_val = None
            options_val = None

            if isinstance(val, (int, float)):
                numeric_val = float(val)
            elif isinstance(val, list):
                options_val = val
            else:
                text_val = str(val)

            if not ans_rec:
                ans_rec = Answer(
                    question=local_qid,
                    created=sub_date,
                    data=data_rec.id,
                    text=text_val,
                    value=numeric_val,
                    options=options_val,
                    updated=datetime.utcnow(),
                )
                session.add(ans_rec)
            else:
                ans_rec.value = numeric_val
                ans_rec.text = text_val
                ans_rec.options = options_val
                ans_rec.updated = datetime.utcnow()

            answers_count += 1

        # Also populate default answers for remaining mandatory questions
        for q_model in available_qs:
            ans_exists = (
                session.query(Answer)
                .filter_by(data=data_rec.id, question=q_model.id)
                .first()
            )
            if ans_exists:
                continue

            # Populate reasonable default
            default_num = None
            default_text = None
            default_opts = None

            if q_model.type == QuestionType.number:
                default_num = 50.0
            elif q_model.type in (
                QuestionType.option, QuestionType.multiple_option
            ):
                if q_model.option:
                    default_opts = [q_model.option[0].name]
            elif q_model.type in (QuestionType.input, QuestionType.text):
                default_text = f"Synthetic response {yr}"

            if default_num is not None or default_text or default_opts:
                session.add(
                    Answer(
                        question=q_model.id,
                        created=sub_date,
                        data=data_rec.id,
                        text=default_text,
                        value=default_num,
                        options=default_opts,
                        updated=datetime.utcnow(),
                    )
                )
                answers_count += 1

        created_submissions.append({
            "data_id": data_rec.id,
            "year": yr,
            "name": sub_name,
            "answers_seeded": answers_count,
        })

    session.commit()

    total_answers = sum(s["answers_seeded"] for s in created_submissions)
    return {
        "form_id": form_rec.id,
        "organisation_id": org_rec.id,
        "submissions": created_submissions,
        "answers_seeded": total_answers,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Seed synthetic survey answers for 2022–2024."
    )
    parser.add_argument(
        "--form-id",
        type=int,
        default=None,
        help="Target form ID (default: resolved form 7).",
    )
    parser.add_argument(
        "--org-id",
        type=int,
        default=None,
        help="Target organisation ID.",
    )
    parser.add_argument(
        "--years",
        type=int,
        nargs="+",
        default=[2022, 2023, 2024],
        help="Years to generate submissions for (default: 2022 2023 2024).",
    )
    parser.add_argument(
        "--ledger",
        type=str,
        default=None,
        help="Mapping ledger path.",
    )
    args = parser.parse_args()

    session = SessionLocal()
    try:
        print(f"Seeding synthetic answers for years: {args.years}...")
        result = seed_mock_visualization_data(
            session=session,
            form_id=args.form_id,
            org_id=args.org_id,
            years=args.years,
            ledger_file=args.ledger,
        )
        sub_count = len(result["submissions"])
        print(
            f"Successfully seeded {sub_count} submission(s) for "
            f"Organisation {result['organisation_id']} "
            f"(Form {result['form_id']})."
        )
        for sub in result["submissions"]:
            print(
                f"  - Year {sub['year']}: Data ID {sub['data_id']} "
                f"({sub['answers_seeded']} answers)"
            )
    except Exception as e:
        session.rollback()
        print(f"Seeding failed: {e}")
        raise e
    finally:
        session.close()


if __name__ == "__main__":
    main()
