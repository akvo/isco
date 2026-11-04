#!/usr/bin/env python3
"""
Dump Survey Schema CLI & Exporter

Extracts sanitized survey schema structures (Form, QuestionGroup, Question,
Option, Cascade, CascadeList, SkipLogic, Member/ISCO Access) strictly omitting
any sensitive member answers, submissions, organizations, or users.
"""

import os
import sys
import json
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
from models.cascade import Cascade  # noqa: E402
from models.cascade_list import CascadeList  # noqa: E402


def _enum_value(val: Any) -> Any:
    if hasattr(val, "value"):
        return val.value
    return val


def dump_survey_schema(
    session,
    form_ids: Optional[List[int]] = None,
    source_environment: Optional[str] = None,
    output_file: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Exports survey definitions for specified form IDs (or all member forms).
    Strictly queries structural definition tables only.
    """
    if source_environment is None:
        source_environment = os.environ.get("BUCKET_FOLDER", "local")

    query = session.query(Form)
    if form_ids:
        query = query.filter(Form.id.in_(form_ids))
    else:
        # Default to canonical member survey IDs
        query = query.filter(Form.id.in_([1, 7]))

    forms = query.order_by(Form.id.asc()).all()

    exported_forms = []
    referenced_cascade_ids = set()

    for form in forms:
        groups_data = []
        sorted_groups = sorted(
            form.question_group,
            key=lambda g: g.order if g.order is not None else 0,
        )

        for group in sorted_groups:
            questions_data = []
            sorted_questions = sorted(
                group.question,
                key=lambda q: q.order if q.order is not None else 0,
            )

            for q in sorted_questions:
                if q.cascade:
                    referenced_cascade_ids.add(q.cascade)

                options_data = []
                sorted_options = sorted(
                    q.option,
                    key=lambda opt: opt.order if opt.order is not None else 0,
                )
                for opt in sorted_options:
                    options_data.append(
                        {
                            "canonical_option_id": opt.id,
                            "code": opt.code,
                            "name": opt.name,
                            "order": opt.order,
                            "translations": opt.translations or [],
                        }
                    )

                skip_logics_data = []
                for s in q.skip_logic:
                    skip_logics_data.append(
                        {
                            "canonical_skip_id": s.id,
                            "dependent_to_canonical_question_id": (
                                s.dependent_to
                            ),
                            "operator": _enum_value(s.operator),
                            "value": s.value,
                            "type": _enum_value(s.type),
                        }
                    )

                questions_data.append(
                    {
                        "canonical_question_id": q.id,
                        "name": q.name,
                        "translations": q.translations or [],
                        "mandatory": bool(q.mandatory),
                        "datapoint_name": bool(q.datapoint_name),
                        "variable_name": q.variable_name,
                        "type": _enum_value(q.type),
                        "personal_data": bool(q.personal_data),
                        "rule": q.rule,
                        "tooltip": q.tooltip,
                        "tooltip_translations": q.tooltip_translations or [],
                        "cascade": q.cascade,
                        "repeating_objects": q.repeating_objects or [],
                        "order": q.order,
                        "core_mandatory": bool(q.core_mandatory),
                        "deactivate": bool(q.deactivate),
                        "autofield": q.autofield,
                        "is_repeat_identifier": bool(q.is_repeat_identifier),
                        "show_as_textarea": bool(q.show_as_textarea),
                        "member_access": [
                            ma.member_type for ma in q.member_access
                        ],
                        "isco_access": [ia.isco_type for ia in q.isco_access],
                        "options": options_data,
                        "skip_logic": skip_logics_data,
                    }
                )

            groups_data.append(
                {
                    "canonical_group_id": group.id,
                    "name": group.name,
                    "description": group.description,
                    "translations": group.translations or [],
                    "order": group.order,
                    "repeatable": bool(group.repeat),
                    "repeat_text": group.repeat_text,
                    "leading_question": group.leading_question,
                    "show_repeat_in_question_level": bool(
                        group.show_repeat_in_question_level
                    ),
                    "member_access": [
                        ma.member_type for ma in group.member_access
                    ],
                    "isco_access": [ia.isco_type for ia in group.isco_access],
                    "questions": questions_data,
                }
            )

        # Fetch cascades referenced by this form
        form_cascades = []
        if referenced_cascade_ids:
            cascades = (
                session.query(Cascade)
                .filter(Cascade.id.in_(referenced_cascade_ids))
                .order_by(Cascade.id.asc())
                .all()
            )
            for cascade in cascades:
                items = (
                    session.query(CascadeList)
                    .filter(CascadeList.cascade == cascade.id)
                    .order_by(CascadeList.level.asc(), CascadeList.id.asc())
                    .all()
                )
                form_cascades.append(
                    {
                        "canonical_cascade_id": cascade.id,
                        "name": cascade.name,
                        "type": _enum_value(cascade.type),
                        "items": [
                            {
                                "canonical_item_id": item.id,
                                "parent_id": item.parent,
                                "code": item.code,
                                "name": item.name,
                                "path": item.path,
                                "level": item.level,
                            }
                            for item in items
                        ],
                    }
                )

        exported_forms.append(
            {
                "canonical_form_id": form.id,
                "name": form.name,
                "description": form.description,
                "languages": form.languages or [],
                "version": form.version,
                "url": form.url,
                "enable_prefilled_value": bool(form.enable_prefilled_value),
                "question_groups": groups_data,
                "cascades": form_cascades,
            }
        )

    payload = {
        "schema_version": "1.0",
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "source_environment": source_environment,
        "forms": exported_forms,
    }

    if output_file:
        out_dir = os.path.dirname(output_file)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

    return payload


def main():
    parser = argparse.ArgumentParser(
        description="Dump sanitized survey schema definitions into JSON."
    )
    parser.add_argument(
        "--form-id",
        type=int,
        nargs="+",
        dest="form_ids",
        help="One or more form IDs to export (default: [1, 7]).",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="source/config/local/survey_schema_export.json",
        help="Target output file path.",
    )
    parser.add_argument(
        "--env",
        type=str,
        default=None,
        help="Source environment name (default: BUCKET_FOLDER).",
    )
    args = parser.parse_args()

    session = SessionLocal()
    try:
        f_ids = args.form_ids or [1, 7]
        print(f"Exporting survey schema for forms: {f_ids}...")
        payload = dump_survey_schema(
            session=session,
            form_ids=args.form_ids,
            source_environment=args.env,
            output_file=args.output,
        )
        form_count = len(payload["forms"])
        total_questions = sum(
            len(q)
            for f in payload["forms"]
            for g in f["question_groups"]
            for q in [g["questions"]]
        )
        print(
            f"Successfully exported {form_count} form(s) "
            f"({total_questions} total questions) to {args.output}"
        )
    finally:
        session.close()


if __name__ == "__main__":
    main()
