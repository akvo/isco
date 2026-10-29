#!/usr/bin/env python3
"""
Synthetic Visualization Answer Seeder CLI & Module

Seeds realistic 2022–2024 survey answers for local developers and QA testers.
Translates canonical indicator Question IDs using SurveyIdResolver.
"""

import os
import sys
import random
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
from models.cascade_list import CascadeList  # noqa: E402
from models.skip_logic import SkipLogic  # noqa: E402
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


def evaluate_skip_logic_condition(
    operator: Any,
    expected_val: str,
    actual_ans: Optional[Dict[str, Any]],
) -> bool:
    """
    Evaluates whether a single SkipLogic rule is satisfied based on the
    parent question's existing answer in the current submission.
    """
    if actual_ans is None:
        return False

    num_val = actual_ans.get("value")
    opts_val = actual_ans.get("options") or []
    text_val = actual_ans.get("text")

    op_str = str(operator).lower()
    if "." in op_str:
        op_str = op_str.split(".")[-1]

    if op_str == "equal":
        if expected_val in opts_val:
            return True
        if text_val and text_val.strip() == expected_val.strip():
            return True
        if num_val is not None:
            try:
                return float(num_val) == float(expected_val)
            except (ValueError, TypeError):
                pass
        return False

    elif op_str == "not_equal":
        return not evaluate_skip_logic_condition(
            "equal", expected_val, actual_ans
        )

    elif op_str in (
        "greater_than",
        "greater_than_or_equal",
        "less_than",
        "less_than_or_equal",
    ):
        if num_val is None:
            return False
        try:
            exp_float = float(expected_val)
            act_float = float(num_val)
            if op_str == "greater_than":
                return act_float > exp_float
            if op_str == "greater_than_or_equal":
                return act_float >= exp_float
            if op_str == "less_than":
                return act_float < exp_float
            if op_str == "less_than_or_equal":
                return act_float <= exp_float
        except (ValueError, TypeError):
            return False

    return True


def should_skip_question(
    skip_rules: List[SkipLogic],
    submission_answers: Dict[int, Dict[str, Any]],
) -> bool:
    """
    Evaluates whether a question should be skipped by SkipLogic rules.
    If a question has skip rules, it must satisfy at least one condition.
    """
    if not skip_rules:
        return False

    for rule in skip_rules:
        parent_ans = submission_answers.get(rule.dependent_to)
        if evaluate_skip_logic_condition(
            rule.operator, rule.value, parent_ans
        ):
            return False  # Condition met -> visible!

    return True  # None met -> skip


def _apply_jitter(val: Any, jitter_rate: float) -> Any:
    """
    Applies small random variance (+- jitter_rate) to numeric values.
    """
    if not isinstance(val, (int, float)) or jitter_rate <= 0:
        return val

    variance = 1.0 + random.uniform(-jitter_rate, jitter_rate)
    result = round(val * variance, 2)
    return max(0.0, result)


def seed_mock_visualization_data(
    session,
    form_id: Optional[int] = None,
    org_id: Optional[int] = None,
    user_id: Optional[int] = None,
    years: Optional[List[int]] = None,
    num_orgs: int = 1,
    jitter: float = 0.05,
    skip_logic_check: bool = True,
    ledger_file: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Seeds mock survey submissions and indicator answers for 2022–2024.
    Supports multi-organisation seeding and SkipLogic awareness.
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
        form_rec = session.query(Form).filter(Form.id.in_([1, 7])).first()
    if not form_rec:
        raise ValueError(f"Form ID {target_form_id} not found in database.")

    # 2. Resolve Target Organisations
    target_orgs = []
    if org_id:
        single_org = session.query(Organisation).filter_by(id=org_id).first()
        if single_org:
            target_orgs.append(single_org)
    else:
        # Query active organisations
        active_orgs = (
            session.query(Organisation)
            .filter_by(active=True)
            .limit(num_orgs)
            .all()
        )
        target_orgs.extend(active_orgs)

    if not target_orgs:
        default_org = Organisation(
            name="Mock DISCO Member Org",
            code="MOCK_DISCO",
            active=True,
        )
        session.add(default_org)
        session.flush()
        target_orgs.append(default_org)

    # 3. Gather questions & SkipLogic in target form ordered by hierarchy
    available_qs = (
        session.query(Question)
        .filter_by(form=form_rec.id)
        .order_by(Question.question_group, Question.order)
        .all()
    )
    q_by_id = {q.id: q for q in available_qs}
    q_ids = [q.id for q in available_qs]

    # Pre-cache SkipLogic rules grouped by question ID
    skip_rules_by_qid: Dict[int, List[SkipLogic]] = {}
    if skip_logic_check:
        all_skips = (
            session.query(SkipLogic)
            .filter(SkipLogic.question.in_(q_ids))
            .all()
        )
        for s in all_skips:
            skip_rules_by_qid.setdefault(s.question, []).append(s)

    # Pre-cache Cascade & NestedList leaf options grouped by cascade ID
    cascade_leaves_by_id: Dict[int, List[str]] = {}
    all_cascade_items = session.query(CascadeList).all()
    cascade_items_by_cid: Dict[int, List[CascadeList]] = {}
    for ci in all_cascade_items:
        cascade_items_by_cid.setdefault(ci.cascade, []).append(ci)

    for cid, citems in cascade_items_by_cid.items():
        parent_ids = {i.parent for i in citems if i.parent is not None}
        item_by_id = {i.id: i for i in citems}
        leaves = [i for i in citems if i.id not in parent_ids]
        leaf_paths = []
        for leaf in leaves:
            curr = leaf
            chain = []
            while curr:
                chain.append(curr.name)
                curr = item_by_id.get(curr.parent)
            leaf_paths.append("|".join(reversed(chain)))
        cascade_leaves_by_id[cid] = leaf_paths

    all_created_submissions = []

    # 4. Iterate through Organisations and Years
    for org_rec in target_orgs:
        # Resolve user for this organisation
        user_rec = None
        if user_id:
            user_rec = session.query(User).filter_by(id=user_id).first()
        if not user_rec:
            user_rec = (
                session.query(User)
                .filter_by(organisation=org_rec.id)
                .first()
            )
        if not user_rec:
            user_rec = session.query(User).first()
        if not user_rec:
            user_rec = User(
                email=f"mock.seeder.{org_rec.id}@akvo.org",
                password="mockpassword",
                name=f"Mock Seeder Org {org_rec.id}",
                phone_number="123456",
                role=UserRole.secretariat_admin,
                organisation=org_rec.id,
            )
            session.add(user_rec)
            session.flush()

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
            submission_answers: Dict[int, Dict[str, Any]] = {}

            # Load existing answers for this submission to support idempotency
            existing_answers = (
                session.query(Answer)
                .filter_by(data=data_rec.id)
                .all()
            )
            for ea in existing_answers:
                submission_answers[ea.question] = {
                    "value": ea.value,
                    "text": ea.text,
                    "options": ea.options,
                }

            # Seed benchmark indicator values first (with optional jitter)
            for canonical_qid, yr_values in BENCHMARK_VALUES.items():
                local_qid = resolver.resolve_question_id(canonical_qid)
                q_model = q_by_id.get(local_qid)
                if not q_model:
                    continue

                val = yr_values.get(yr)
                if val is None:
                    continue

                val = _apply_jitter(val, jitter)

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

                submission_answers[local_qid] = {
                    "value": numeric_val,
                    "text": text_val,
                    "options": options_val,
                }
                answers_count += 1

            # Populate answers for remaining if not skipped by SkipLogic
            for q_model in available_qs:
                if q_model.id in submission_answers:
                    continue

                # Skip Logic Evaluation
                if skip_logic_check:
                    rules = skip_rules_by_qid.get(q_model.id, [])
                    if should_skip_question(rules, submission_answers):
                        continue

                # Populate randomized answer based on question type
                default_num = None
                default_text = None
                default_opts = None

                if q_model.type == QuestionType.number:
                    # Random numeric value (10 - 250) with jitter
                    base_random_num = float(random.randint(10, 250))
                    default_num = _apply_jitter(base_random_num, jitter)
                elif q_model.type == QuestionType.option:
                    # Pick a single random option from available choices
                    if q_model.option:
                        chosen_opt = random.choice(q_model.option)
                        default_opts = [chosen_opt.name]
                elif q_model.type == QuestionType.multiple_option:
                    # Pick 1 to N random distinct options
                    if q_model.option:
                        k = random.randint(1, min(3, len(q_model.option)))
                        sampled = random.sample(q_model.option, k)
                        default_opts = [opt.name for opt in sampled]
                elif q_model.type in (
                    QuestionType.cascade,
                    QuestionType.nested_list,
                ):
                    # Pick random leaf path from cascade tree
                    cid = q_model.cascade
                    if cid and cid in cascade_leaves_by_id:
                        c_leaves = cascade_leaves_by_id[cid]
                        if c_leaves:
                            if q_model.type == QuestionType.nested_list:
                                k = random.randint(1, min(2, len(c_leaves)))
                                default_opts = random.sample(c_leaves, k)
                            else:
                                default_opts = [random.choice(c_leaves)]
                elif q_model.type == QuestionType.date:
                    d = random.randint(1, 28)
                    m = random.randint(1, 12)
                    default_text = f"{yr:04d}-{m:02d}-{d:02d}T09:00:00.000Z"
                elif q_model.type in (QuestionType.input, QuestionType.text):
                    synthetic_phrases = [
                        f"Detailed feedback for cycle {yr}.",
                        f"Action plan in cooperation with partners ({yr}).",
                        f"Annual sustainability verification done for {yr}.",
                        f"Field observations and monitoring notes in {yr}.",
                        f"Capacity building assistance deployed in {yr}.",
                        f"SOP conducted according to guidelines ({yr}).",
                    ]
                    default_text = random.choice(synthetic_phrases)

                if default_num is not None or default_text or default_opts:
                    ans_rec = Answer(
                        question=q_model.id,
                        created=sub_date,
                        data=data_rec.id,
                        text=default_text,
                        value=default_num,
                        options=default_opts,
                        updated=datetime.utcnow(),
                    )
                    session.add(ans_rec)
                    submission_answers[q_model.id] = {
                        "value": default_num,
                        "text": default_text,
                        "options": default_opts,
                    }
                    answers_count += 1

            all_created_submissions.append({
                "data_id": data_rec.id,
                "organisation_id": org_rec.id,
                "organisation_name": org_rec.name,
                "year": yr,
                "name": sub_name,
                "answers_seeded": answers_count,
            })

    session.commit()

    total_answers = sum(s["answers_seeded"] for s in all_created_submissions)
    first_org_id = target_orgs[0].id if target_orgs else None

    return {
        "form_id": form_rec.id,
        "organisation_id": first_org_id,
        "organisations_seeded": len(target_orgs),
        "submissions": all_created_submissions,
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
        "--num-orgs",
        type=int,
        default=1,
        help="Number of active organisations to seed data for.",
    )
    parser.add_argument(
        "--jitter",
        type=float,
        default=0.05,
        help="Variance rate (+- jitter) for metric values (default: 0.05).",
    )
    parser.add_argument(
        "--no-skip-logic",
        action="store_true",
        help="Disable SkipLogic check (seeds fields unconditionally).",
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
        skip_check = not args.no_skip_logic
        print(
            f"Seeding synthetic answers for {args.num_orgs} org(s), "
            f"years: {args.years} (skip_logic_check: {skip_check})..."
        )
        result = seed_mock_visualization_data(
            session=session,
            form_id=args.form_id,
            org_id=args.org_id,
            years=args.years,
            num_orgs=args.num_orgs,
            jitter=args.jitter,
            skip_logic_check=not args.no_skip_logic,
            ledger_file=args.ledger,
        )
        sub_count = len(result["submissions"])
        org_count = result["organisations_seeded"]
        print(
            f"Successfully seeded {sub_count} submission(s) across "
            f"{org_count} organisation(s) (Form {result['form_id']})."
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
