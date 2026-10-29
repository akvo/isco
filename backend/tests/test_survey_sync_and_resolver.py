import os
import json
import pytest
import models.member_type  # noqa: F401
import models.isco_type  # noqa: F401
import models.organisation  # noqa: F401
import models.user  # noqa: F401
import models.form
import models.question_group  # noqa: F401
import models.question  # noqa: F401
import models.cascade  # noqa: F401
import models.cascade_list  # noqa: F401
import models.option  # noqa: F401
import models.skip_logic  # noqa: F401
import models.question_group_member_access  # noqa: F401
import models.question_group_isco_access  # noqa: F401
import models.question_member_access  # noqa: F401
import models.question_isco_access  # noqa: F401
import models.answer  # noqa: F401
import models.data  # noqa: F401

from scripts.dump_survey_schema import dump_survey_schema


def test_dump_survey_schema_zero_sensitive_data(session):
    """
    UAC-SYNC.1 & TAC-SYNC.1: Strict Privacy & Zero Data Leakage.
    Verifies that exported survey schema contains zero rows/keys
    of member answers, submitted data, user credentials, or org identities.
    """
    form_7 = (
        session.query(models.form.Form)
        .filter(models.form.Form.id == 7)
        .first()
    )
    if not form_7:
        pytest.skip("Form 7 not present in test database")

    schema = dump_survey_schema(session=session, form_ids=[7])

    assert schema["schema_version"] == "1.0"
    assert "exported_at" in schema
    assert "forms" in schema
    assert len(schema["forms"]) == 1

    form_data = schema["forms"][0]
    assert form_data["canonical_form_id"] == 7
    assert form_data["name"] == form_7.name

    # Recursive check: forbidden keys never appear anywhere in the export
    forbidden_keys = {
        "answer", "answers", "data", "datapoint",
        "user", "users", "password", "email", "secret"
    }

    def check_no_forbidden(obj, path=""):
        if isinstance(obj, dict):
            for k, v in obj.items():
                msg = f"Forbidden key '{k}' found at path: {path}.{k}"
                assert k.lower() not in forbidden_keys, msg
                check_no_forbidden(v, f"{path}.{k}")
        elif isinstance(obj, list):
            for idx, item in enumerate(obj):
                check_no_forbidden(item, f"{path}[{idx}]")

    check_no_forbidden(schema)


def test_dump_survey_schema_full_8_layers(session):
    """
    UAC-SYNC.2: Full 8-layer survey structure coverage.
    Verifies Form, QuestionGroup, Question, Option, Cascade, CascadeList,
    SkipLogic, and Member/ISCO access matrices are captured.
    """
    form_7 = (
        session.query(models.form.Form)
        .filter(models.form.Form.id == 7)
        .first()
    )
    if not form_7:
        pytest.skip("Form 7 not present in test database")

    schema = dump_survey_schema(session=session, form_ids=[7])
    form_data = schema["forms"][0]

    assert "question_groups" in form_data
    assert len(form_data["question_groups"]) > 0

    first_group = form_data["question_groups"][0]
    assert "canonical_group_id" in first_group
    assert "name" in first_group
    assert "order" in first_group
    assert "repeatable" in first_group
    assert "member_access" in first_group
    assert "isco_access" in first_group
    assert "questions" in first_group
    assert len(first_group["questions"]) > 0

    all_questions = [
        q for g in form_data["question_groups"] for q in g["questions"]
    ]
    assert len(all_questions) > 0

    question_with_options = next(
        (q for q in all_questions if q["options"]), None
    )
    if question_with_options:
        first_opt = question_with_options["options"][0]
        assert "canonical_option_id" in first_opt
        assert "name" in first_opt

    assert "cascades" in form_data
    if form_data["cascades"]:
        first_cascade = form_data["cascades"][0]
        assert "canonical_cascade_id" in first_cascade
        assert "name" in first_cascade
        assert "items" in first_cascade


def test_dump_survey_schema_file_export(tmp_path, session):
    """
    Tests saving dump output to a file and reading back valid JSON.
    """
    form_7 = (
        session.query(models.form.Form)
        .filter(models.form.Form.id == 7)
        .first()
    )
    if not form_7:
        pytest.skip("Form 7 not present in test database")

    out_file = str(tmp_path / "test_dump.json")
    dump_survey_schema(session=session, form_ids=[7], output_file=out_file)

    assert os.path.exists(out_file)
    with open(out_file, "r") as f:
        loaded = json.load(f)

    assert loaded["schema_version"] == "1.0"
    assert len(loaded["forms"]) == 1
    assert loaded["forms"][0]["canonical_form_id"] == 7


def test_dump_survey_schema_cli_main(tmp_path, monkeypatch, session):
    """
    Tests invoking main() directly with CLI arguments.
    """
    import sys
    from scripts.dump_survey_schema import main

    form_7 = (
        session.query(models.form.Form)
        .filter(models.form.Form.id == 7)
        .first()
    )
    if not form_7:
        pytest.skip("Form 7 not present in test database")

    out_file = str(tmp_path / "cli_dump.json")
    monkeypatch.setattr(
        sys,
        "argv",
        ["dump_survey_schema.py", "--form-id", "7", "--output", out_file],
    )

    main()
    assert os.path.exists(out_file)
    with open(out_file, "r") as f:
        loaded = json.load(f)
    assert loaded["schema_version"] == "1.0"
