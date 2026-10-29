#!/usr/bin/env python3
"""
Import Survey Schema CLI & Importer

Imports sanitized survey schema definitions into the target database.
Executes an idempotent two-pass algorithm:
  - Pass 1: Core entities upsert (Forms, Groups, Cascades, Questions).
  - Pass 2: Dependency re-linking (Cascades, SkipLogic, Autofields).
Outputs an environment ID mapping ledger (id_mapping.json).
"""

import os
import sys
import re
import json
import argparse
from datetime import datetime
from typing import Dict, Any, Optional

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
from models.question_group import QuestionGroup  # noqa: E402
from models.question import Question, QuestionType  # noqa: E402
from models.option import Option  # noqa: E402
from models.cascade import Cascade, CascadeType  # noqa: E402
from models.cascade_list import CascadeList  # noqa: E402
from models.skip_logic import (  # noqa: E402
    SkipLogic,
    OperatorType,
    QuestionType as SkipQuestionType,
)
from models.question_group_member_access import (  # noqa: E402
    QuestionGroupMemberAccess,
)
from models.question_group_isco_access import (  # noqa: E402
    QuestionGroupIscoAccess,
)
from models.question_member_access import (  # noqa: E402
    QuestionMemberAccess,
)
from models.question_isco_access import (  # noqa: E402
    QuestionIscoAccess,
)


def _to_enum(enum_cls, val):
    if val is None:
        return None
    if isinstance(val, enum_cls):
        return val
    try:
        return enum_cls(val)
    except Exception:
        return val


def normalize_schema_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes schema data from either canonical export format
    ({"schema_version": ..., "forms": [...]}) or published webform JSON
    ({"id": ..., "name": ..., "question_group": [...], "tree": ...}).
    """
    if "forms" in data:
        return data

    canonical_form_id = data.get("id", 1)
    form_entry = {
        "canonical_form_id": canonical_form_id,
        "name": data.get("name", f"Form {canonical_form_id}"),
        "description": data.get("description"),
        "version": data.get("version", 1.0),
        "url": data.get("url"),
        "languages": data.get("languages", ["en"]),
        "cascades": [],
        "question_groups": [],
    }

    # Extract cascades from tree dict
    trees = data.get("tree", {})
    tree_idx = 1
    for tree_key, root_items in trees.items():
        casc_entry = {
            "canonical_cascade_id": tree_idx,
            "name": tree_key,
            "type": "cascade",
            "items": [],
        }
        item_counter = [1]

        def traverse(items, parent_id=None, level=1):
            for it in items:
                cur_id = item_counter[0]
                item_counter[0] += 1
                casc_entry["items"].append({
                    "canonical_item_id": cur_id,
                    "parent_id": parent_id,
                    "name": it.get("title") or it.get("value") or "",
                    "level": level,
                })
                if it.get("children"):
                    traverse(it["children"], parent_id=cur_id, level=level + 1)

        if isinstance(root_items, list):
            traverse(root_items)
        form_entry["cascades"].append(casc_entry)
        tree_idx += 1

    # Extract question groups
    for g in data.get("question_group", []):
        g_entry = {
            "canonical_group_id": g.get("id"),
            "name": g.get("name", "Group"),
            "description": g.get("description"),
            "order": g.get("order", 1),
            "repeatable": g.get("repeatable", False),
            "repeat_text": g.get("repeat_text"),
            "leading_question": g.get("leading_question"),
            "show_repeat_in_question_level": g.get(
                "show_repeat_in_question_level", False
            ),
            "translations": g.get("translations", []),
            "member_access": g.get("member_access", []),
            "isco_access": g.get("isco_access", []),
            "questions": [],
        }
        for q in g.get("question", []):
            raw_type = q.get("type", "input")
            if raw_type == "tree":
                q_type = "nested_list"
            else:
                q_type = raw_type

            casc_id = (
                1
                if raw_type == "tree" and len(form_entry["cascades"]) > 0
                else q.get("cascade")
            )

            # Map webform dependencies to SkipLogic format
            skip_logics = []
            for dep in q.get("dependency", []):
                dep_q_id = dep.get("id")
                if not dep_q_id:
                    continue
                if "options" in dep:
                    for opt_val in dep["options"]:
                        skip_logics.append({
                            "dependent_to_canonical_question_id": dep_q_id,
                            "operator": "equal",
                            "value": opt_val,
                            "type": "option",
                        })
                elif "min" in dep:
                    skip_logics.append({
                        "dependent_to_canonical_question_id": dep_q_id,
                        "operator": "greater_than_or_equal",
                        "value": str(dep["min"]),
                        "type": "number",
                    })

            q_entry = {
                "canonical_question_id": q.get("id"),
                "name": q.get("name", ""),
                "translations": q.get("translations", []),
                "mandatory": q.get("required", False),
                "datapoint_name": q.get("datapoint_name", False),
                "variable_name": q.get("variable_name"),
                "type": q_type,
                "personal_data": q.get("personal_data", False),
                "rule": q.get("rule"),
                "tooltip": q.get("tooltip"),
                "tooltip_translations": q.get("tooltip_translations", []),
                "cascade": casc_id,
                "repeating_objects": q.get("repeating_objects", []),
                "order": q.get("order", 1),
                "core_mandatory": q.get("coreMandatory", False),
                "deactivate": q.get("deactivate", False),
                "autofield": q.get("fn"),
                "is_repeat_identifier": q.get("is_repeat_identifier", False),
                "show_as_textarea": q.get("show_as_textarea", False),
                "member_access": q.get("member_access", []),
                "isco_access": q.get("isco_access", []),
                "options": q.get("option", []),
                "skip_logic": skip_logics,
            }
            g_entry["questions"].append(q_entry)
        form_entry["question_groups"].append(g_entry)

    return {
        "schema_version": "1.0",
        "exported_at": "normalized",
        "source_environment": "webform",
        "forms": [form_entry],
    }


def import_survey_schema(
    session,
    schema_data: Dict[str, Any],
    mode: str = "update",
    target_form_id: Optional[int] = None,
    ledger_file: Optional[str] = None,
    target_environment: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Two-pass idempotent survey schema importer.
    """
    if target_environment is None:
        target_environment = os.environ.get("BUCKET_FOLDER", "local")

    schema_data = normalize_schema_data(schema_data)

    form_mapping: Dict[int, int] = {}
    group_mapping: Dict[int, int] = {}
    question_mapping: Dict[int, int] = {}
    cascade_mapping: Dict[int, int] = {}
    cascade_item_mapping: Dict[int, int] = {}

    forms_data = schema_data.get("forms", [])

    # =========================================================================
    # PASS 1: Core Entities Upsert
    # =========================================================================
    for f_data in forms_data:
        c_form_id = f_data["canonical_form_id"]

        # 1. Upsert Cascades & CascadeLists for this form
        for c_data in f_data.get("cascades", []):
            c_casc_id = c_data["canonical_cascade_id"]
            cascade_name = c_data["name"]
            c_type = _to_enum(CascadeType, c_data.get("type", "cascade"))

            cascade_rec = (
                session.query(Cascade).filter_by(name=cascade_name).first()
            )
            if not cascade_rec:
                cascade_rec = Cascade(id=None, name=cascade_name, type=c_type)
                session.add(cascade_rec)
                session.flush()

            cascade_mapping[c_casc_id] = cascade_rec.id

            # Sort items by level ASC to ensure parents are inserted first
            sorted_items = sorted(
                c_data.get("items", []),
                key=lambda it: it.get("level", 1)
            )

            for item in sorted_items:
                c_item_id = item["canonical_item_id"]
                parent_c_id = item.get("parent_id")
                local_parent_id = None
                if parent_c_id:
                    local_parent_id = cascade_item_mapping.get(parent_c_id)

                item_rec = (
                    session.query(CascadeList)
                    .filter_by(
                        cascade=cascade_rec.id,
                        name=item["name"],
                        parent=local_parent_id,
                    )
                    .first()
                )
                if not item_rec:
                    item_rec = CascadeList(
                        cascade=cascade_rec.id,
                        parent=local_parent_id,
                        code=item.get("code"),
                        name=item["name"],
                        path=item.get("path"),
                        level=item.get("level", 1),
                    )
                    session.add(item_rec)
                    session.flush()
                else:
                    item_rec.code = item.get("code")
                    item_rec.path = item.get("path")
                    item_rec.level = item.get("level", 1)

                cascade_item_mapping[c_item_id] = item_rec.id

        # 2. Match or create target Form
        form_rec = None
        if target_form_id:
            form_rec = session.query(Form).filter_by(id=target_form_id).first()
        else:
            # Match by canonical ID or name
            form_rec = session.query(Form).filter_by(id=c_form_id).first()
            if not form_rec:
                form_rec = (
                    session.query(Form).filter_by(name=f_data["name"]).first()
                )

        if not form_rec:
            form_rec = Form(
                id=c_form_id if mode == "clean" else None,
                name=f_data["name"],
                description=f_data.get("description"),
                enable_prefilled_value=f_data.get(
                    "enable_prefilled_value", False
                ),
                languages=f_data.get("languages", ["en"]),
            )
            form_rec.version = f_data.get("version", 1.0)
            form_rec.url = f_data.get("url")
            session.add(form_rec)
            session.flush()
        else:
            form_rec.name = f_data["name"]
            form_rec.description = f_data.get("description")
            form_rec.enable_prefilled_value = f_data.get(
                "enable_prefilled_value", False
            )
            form_rec.languages = f_data.get("languages", ["en"])
            form_rec.version = f_data.get("version", 1.0)
            form_rec.url = f_data.get("url")

        form_mapping[c_form_id] = form_rec.id

        # 3. Upsert Question Groups
        for g_data in f_data.get("question_groups", []):
            c_group_id = g_data["canonical_group_id"]
            group_name = g_data["name"]
            group_order = g_data.get("order")

            group_rec = (
                session.query(QuestionGroup)
                .filter_by(form=form_rec.id, order=group_order)
                .first()
            )
            if not group_rec:
                group_rec = (
                    session.query(QuestionGroup)
                    .filter_by(form=form_rec.id, name=group_name)
                    .first()
                )

            if not group_rec:
                group_rec = QuestionGroup(
                    id=None,
                    form=form_rec.id,
                    name=group_name,
                    description=g_data.get("description"),
                    translations=g_data.get("translations", []),
                    order=group_order,
                    repeat=g_data.get("repeatable", False),
                    repeat_text=g_data.get("repeat_text"),
                    leading_question=g_data.get("leading_question"),
                    show_repeat_in_question_level=bool(
                        g_data.get("show_repeat_in_question_level", False)
                    ),
                )
                session.add(group_rec)
                session.flush()
            else:
                group_rec.name = group_name
                group_rec.description = g_data.get("description")
                group_rec.translations = g_data.get("translations", [])
                group_rec.order = group_order
                group_rec.repeat = g_data.get("repeatable", False)
                group_rec.repeat_text = g_data.get("repeat_text")
                group_rec.leading_question = g_data.get("leading_question")
                group_rec.show_repeat_in_question_level = bool(
                    g_data.get("show_repeat_in_question_level", False)
                )

            group_mapping[c_group_id] = group_rec.id

            # Sync Group Access
            existing_m_access = {
                ma.member_type for ma in group_rec.member_access
            }
            target_m_access = set(g_data.get("member_access", []))
            for m_type in target_m_access - existing_m_access:
                session.add(
                    QuestionGroupMemberAccess(
                        id=None,
                        question_group=group_rec.id,
                        member_type=m_type,
                    )
                )

            existing_i_access = {
                ia.isco_type for ia in group_rec.isco_access
            }
            target_i_access = set(g_data.get("isco_access", []))
            for i_type in target_i_access - existing_i_access:
                session.add(
                    QuestionGroupIscoAccess(
                        id=None,
                        question_group=group_rec.id,
                        isco_type=i_type,
                    )
                )
            session.flush()

            # 4. Upsert Questions & Options
            for q_data in g_data.get("questions", []):
                c_q_id = q_data["canonical_question_id"]
                var_name = q_data.get("variable_name")
                q_name = q_data["name"]
                q_order = q_data.get("order")

                q_rec = None
                if var_name:
                    q_rec = (
                        session.query(Question)
                        .filter_by(form=form_rec.id, variable_name=var_name)
                        .first()
                    )
                if not q_rec:
                    q_rec = (
                        session.query(Question)
                        .filter_by(
                            form=form_rec.id,
                            question_group=group_rec.id,
                            order=q_order,
                        )
                        .first()
                    )

                q_type = _to_enum(QuestionType, q_data.get("type"))

                if not q_rec:
                    q_rec = Question(
                        id=None,
                        name=q_name,
                        form=form_rec.id,
                        question_group=group_rec.id,
                        translations=q_data.get("translations", []),
                        mandatory=q_data.get("mandatory", False),
                        datapoint_name=q_data.get("datapoint_name", False),
                        variable_name=var_name,
                        type=q_type,
                        personal_data=q_data.get("personal_data", False),
                        rule=q_data.get("rule"),
                        tooltip=q_data.get("tooltip"),
                        tooltip_translations=q_data.get(
                            "tooltip_translations", []
                        ),
                        cascade=None,  # re-linked in Pass 2
                        repeating_objects=q_data.get("repeating_objects", []),
                        order=q_order,
                        core_mandatory=q_data.get("core_mandatory", False),
                        deactivate=q_data.get("deactivate", False),
                        autofield=q_data.get("autofield"),
                        is_repeat_identifier=q_data.get(
                            "is_repeat_identifier", False
                        ),
                        show_as_textarea=q_data.get(
                            "show_as_textarea", False
                        ),
                    )
                    session.add(q_rec)
                    session.flush()
                else:
                    q_rec.name = q_name
                    q_rec.question_group = group_rec.id
                    q_rec.translations = q_data.get("translations", [])
                    q_rec.mandatory = q_data.get("mandatory", False)
                    q_rec.datapoint_name = q_data.get("datapoint_name", False)
                    q_rec.type = q_type
                    q_rec.personal_data = q_data.get("personal_data", False)
                    q_rec.rule = q_data.get("rule")
                    q_rec.tooltip = q_data.get("tooltip")
                    q_rec.tooltip_translations = q_data.get(
                        "tooltip_translations", []
                    )
                    q_rec.order = q_order
                    q_rec.core_mandatory = q_data.get("core_mandatory", False)
                    q_rec.deactivate = q_data.get("deactivate", False)
                    q_rec.autofield = q_data.get("autofield")
                    q_rec.is_repeat_identifier = q_data.get(
                        "is_repeat_identifier", False
                    )
                    q_rec.show_as_textarea = q_data.get(
                        "show_as_textarea", False
                    )

                question_mapping[c_q_id] = q_rec.id

                # Sync Question Access
                existing_qm = {
                    ma.member_type for ma in q_rec.member_access
                }
                qm_target = set(q_data.get("member_access", []))
                for m_type in qm_target - existing_qm:
                    session.add(
                        QuestionMemberAccess(
                            id=None,
                            question=q_rec.id,
                            member_type=m_type,
                        )
                    )

                existing_qi = {
                    ia.isco_type for ia in q_rec.isco_access
                }
                for i_type in set(q_data.get("isco_access", [])) - existing_qi:
                    session.add(
                        QuestionIscoAccess(
                            id=None,
                            question=q_rec.id,
                            isco_type=i_type,
                        )
                    )

                # Upsert Options
                for opt_data in q_data.get("options", []):
                    opt_code = opt_data.get("code")
                    opt_name = opt_data["name"]
                    opt_order = opt_data.get("order")

                    opt_rec = None
                    if opt_code:
                        opt_rec = (
                            session.query(Option)
                            .filter_by(question=q_rec.id, code=opt_code)
                            .first()
                        )
                    if not opt_rec:
                        opt_rec = (
                            session.query(Option)
                            .filter_by(question=q_rec.id, name=opt_name)
                            .first()
                        )

                    if not opt_rec:
                        opt_rec = Option(
                            id=None,
                            code=opt_code,
                            name=opt_name,
                            question=q_rec.id,
                            translations=opt_data.get("translations", []),
                            order=opt_order,
                        )
                        session.add(opt_rec)
                    else:
                        opt_rec.name = opt_name
                        opt_rec.order = opt_order
                        opt_rec.translations = opt_data.get(
                            "translations", []
                        )

    session.flush()

    # =========================================================================
    # PASS 2: Dependency Re-linking
    # =========================================================================
    for f_data in forms_data:
        for g_data in f_data.get("question_groups", []):
            for q_data in g_data.get("questions", []):
                c_q_id = q_data["canonical_question_id"]
                local_q_id = question_mapping.get(c_q_id)
                if not local_q_id:
                    continue

                q_rec = (
                    session.query(Question)
                    .filter_by(id=local_q_id)
                    .first()
                )
                if not q_rec:
                    continue

                # 1. Re-link Cascade ID
                if q_data.get("cascade"):
                    local_casc = cascade_mapping.get(q_data["cascade"])
                    if local_casc:
                        q_rec.cascade = local_casc

                # 2. Re-link Autofield fnString #{old_id} -> #{new_id}
                if (
                    q_data.get("autofield")
                    and q_data["autofield"].get("fnString")
                ):
                    fn_str = q_data["autofield"]["fnString"]

                    def _replace_token(match):
                        old_tok = int(match.group(1))
                        new_tok = question_mapping.get(old_tok, old_tok)
                        return f"#{new_tok}"

                    new_fn = re.sub(r"#(\d+)", _replace_token, fn_str)
                    q_rec.autofield = {
                        "fnString": new_fn,
                        "multiline": q_data["autofield"].get(
                            "multiline", False
                        ),
                    }

                # 3. Re-link Skip Logic
                session.query(SkipLogic).filter_by(
                    question=local_q_id
                ).delete()
                for s_data in q_data.get("skip_logic", []):
                    c_dep_id = s_data.get(
                        "dependent_to_canonical_question_id"
                    )
                    local_dep_id = question_mapping.get(c_dep_id)
                    if local_dep_id:
                        skip_rec = SkipLogic(
                            id=None,
                            question=local_q_id,
                            dependent_to=local_dep_id,
                            operator=_to_enum(
                                OperatorType, s_data["operator"]
                            ),
                            value=str(s_data["value"]),
                            type=_to_enum(SkipQuestionType, s_data["type"]),
                        )
                        session.add(skip_rec)

    session.commit()

    ledger = {
        "target_environment": target_environment,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "form_mapping": {str(k): v for k, v in form_mapping.items()},
        "question_group_mapping": {
            str(k): v for k, v in group_mapping.items()
        },
        "question_mapping": {
            str(k): v for k, v in question_mapping.items()
        },
    }

    if ledger_file:
        ledger_dir = os.path.dirname(ledger_file)
        if ledger_dir:
            os.makedirs(ledger_dir, exist_ok=True)
        with open(ledger_file, "w", encoding="utf-8") as f:
            json.dump(ledger, f, indent=2, ensure_ascii=False)

    return ledger


def main():
    parser = argparse.ArgumentParser(
        description="Import sanitized survey schema JSON into target database."
    )
    parser.add_argument(
        "--input",
        "-i",
        type=str,
        default="source/config/local/survey_schema_export.json",
        help="Path to survey schema export JSON file.",
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["update", "clean"],
        default="update",
        help="Import mode: 'update' (in-place) or 'clean'.",
    )
    parser.add_argument(
        "--target-form-id",
        type=int,
        default=None,
        help="Optional specific form ID to update in-place.",
    )
    parser.add_argument(
        "--ledger",
        type=str,
        default=None,
        help="Path for output ledger file.",
    )
    parser.add_argument(
        "--env",
        type=str,
        default=None,
        help="Target environment name (default: BUCKET_FOLDER).",
    )
    args = parser.parse_args()

    env_name = args.env or os.environ.get("BUCKET_FOLDER", "local")
    ledger_path = args.ledger or f"source/config/{env_name}/id_mapping.json"

    if not os.path.exists(args.input):
        print(f"Error: Input schema file '{args.input}' not found.")
        sys.exit(1)

    with open(args.input, "r", encoding="utf-8") as f:
        schema_data = json.load(f)

    session = SessionLocal()
    try:
        print(f"Importing schema from '{args.input}' (mode: {args.mode})...")
        ledger = import_survey_schema(
            session=session,
            schema_data=schema_data,
            mode=args.mode,
            target_form_id=args.target_form_id,
            ledger_file=ledger_path,
            target_environment=env_name,
        )
        q_count = len(ledger["question_mapping"])
        print(
            f"Successfully imported survey schema: mapped {q_count} questions."
        )
        print(f"Mapping ledger written to: {ledger_path}")
    except Exception as e:
        session.rollback()
        print(f"Import failed: {e}")
        raise e
    finally:
        session.close()


if __name__ == "__main__":
    main()
