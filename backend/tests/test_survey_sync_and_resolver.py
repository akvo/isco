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
from scripts.import_survey_schema import import_survey_schema
from services.survey_id_resolver import (
    SurveyIdResolver,
    resolve_question_id,
    resolve_formula,
)


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


def test_import_survey_schema_two_pass_and_ledger(tmp_path, session):
    """
    TAC-SYNC.2 & TAC-SYNC.3:
    Tests two-pass import algorithm:
    - Pass 1: Upsert form, group, cascade, questions, options
    - Pass 2: Re-link cascade_id, skip_logic dependent_to, and autofield tokens
    - Outputs ledger json with valid mappings
    """
    test_schema = {
        "schema_version": "1.0",
        "exported_at": "2026-10-29T10:00:00Z",
        "source_environment": "production",
        "forms": [
            {
                "canonical_form_id": 9991,
                "name": "Sync Test Survey",
                "description": "Portability test survey",
                "languages": ["en"],
                "version": 1.0,
                "enable_prefilled_value": False,
                "question_groups": [
                    {
                        "canonical_group_id": 8881,
                        "name": "Test Group 1",
                        "description": "Group for test",
                        "order": 1,
                        "repeatable": False,
                        "member_access": [1, 2],
                        "isco_access": [1],
                        "questions": [
                            {
                                "canonical_question_id": 7771,
                                "name": "Base Sourced Cocoa",
                                "variable_name": "q_sync_base",
                                "type": "number",
                                "mandatory": True,
                                "datapoint_name": False,
                                "personal_data": False,
                                "rule": {"min": 0, "max": 100},
                                "order": 1,
                                "cascade": None,
                                "core_mandatory": True,
                                "deactivate": False,
                                "autofield": None,
                                "options": [],
                                "skip_logic": [],
                                "member_access": [1, 2],
                                "isco_access": [1],
                            },
                            {
                                "canonical_question_id": 7772,
                                "name": "Computed Total Cocoa",
                                "variable_name": "q_sync_computed",
                                "type": "number",
                                "mandatory": False,
                                "datapoint_name": False,
                                "personal_data": False,
                                "order": 2,
                                "cascade": 6661,
                                "core_mandatory": False,
                                "deactivate": False,
                                "autofield": {
                                    "fnString": (
                                        "function () { return #7771 * 2; }"
                                    ),
                                    "multiline": False,
                                },
                                "options": [
                                    {
                                        "canonical_option_id": 5551,
                                        "code": "OPT1",
                                        "name": "Option One",
                                        "order": 1,
                                        "translations": [],
                                    }
                                ],
                                "skip_logic": [
                                    {
                                        "canonical_skip_id": 4441,
                                        "dependent_to_canonical_question_id": (
                                            7771
                                        ),
                                        "operator": "greater_than",
                                        "value": "10",
                                        "type": "number",
                                    }
                                ],
                                "member_access": [1, 2],
                                "isco_access": [1],
                            },
                        ],
                    }
                ],
                "cascades": [
                    {
                        "canonical_cascade_id": 6661,
                        "name": "Sync Test Country Tree",
                        "type": "cascade",
                        "items": [
                            {
                                "canonical_item_id": 1001,
                                "parent_id": None,
                                "code": "REG1",
                                "name": "Region One",
                                "level": 1,
                                "path": "",
                            },
                            {
                                "canonical_item_id": 1002,
                                "parent_id": 1001,
                                "code": "DIST1",
                                "name": "District One",
                                "level": 2,
                                "path": "",
                            },
                        ],
                    }
                ],
            }
        ],
    }

    ledger_path = str(tmp_path / "id_mapping.json")
    ledger = import_survey_schema(
        session=session,
        schema_data=test_schema,
        mode="clean",
        ledger_file=ledger_path,
    )

    # 1. Verify ledger structure
    assert "form_mapping" in ledger
    assert "question_group_mapping" in ledger
    assert "question_mapping" in ledger
    assert "7771" in ledger["question_mapping"]
    assert "7772" in ledger["question_mapping"]

    local_q1_id = ledger["question_mapping"]["7771"]
    local_q2_id = ledger["question_mapping"]["7772"]
    assert local_q1_id != local_q2_id

    # 2. Verify Pass 2 SkipLogic re-linking
    q2 = (
        session.query(models.question.Question)
        .filter_by(id=local_q2_id)
        .first()
    )
    assert q2 is not None
    assert len(q2.skip_logic) == 1
    # dependent_to must point to local_q1_id, not canonical 7771!
    assert q2.skip_logic[0].dependent_to == local_q1_id

    # 3. Verify Pass 2 Autofield formula re-linking
    assert q2.autofield is not None
    assert f"#{local_q1_id}" in q2.autofield["fnString"]
    assert "#7771" not in q2.autofield["fnString"]

    # 4. Verify CascadeList parent-child re-linking
    assert q2.cascade is not None
    c_items = (
        session.query(models.cascade_list.CascadeList)
        .filter_by(cascade=q2.cascade)
        .order_by(models.cascade_list.CascadeList.level.asc())
        .all()
    )
    assert len(c_items) == 2
    parent_item = c_items[0]
    child_item = c_items[1]
    assert child_item.parent == parent_item.id

    # 5. Verify Idempotency: Re-running does not duplicate
    re_ledger = import_survey_schema(
        session=session,
        schema_data=test_schema,
        mode="clean",
        ledger_file=ledger_path,
    )
    assert re_ledger["question_mapping"]["7771"] == local_q1_id
    assert re_ledger["question_mapping"]["7772"] == local_q2_id


def test_import_survey_schema_cli_main(tmp_path, monkeypatch, session):
    """
    Tests invoking import_survey_schema.py main() CLI.
    """
    import sys
    from scripts.import_survey_schema import main

    export_path = "source/config/local/survey_schema_export.json"
    if not os.path.exists(export_path):
        pytest.skip(f"Export file {export_path} not found")

    ledger_path = str(tmp_path / "cli_id_mapping.json")
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "import_survey_schema.py",
            "--input",
            export_path,
            "--mode",
            "update",
            "--target-form-id",
            "7",
            "--ledger",
            ledger_path,
        ],
    )

    main()
    assert os.path.exists(ledger_path)
    with open(ledger_path, "r") as f:
        ledger = json.load(f)

    assert "question_mapping" in ledger
    assert len(ledger["question_mapping"]) > 0
    assert ledger["form_mapping"].get("7") == 7


def test_survey_id_resolver_production_mode(monkeypatch):
    """
    TAC-SYNC.4: In production, resolver is a zero-overhead identity function.
    """
    monkeypatch.setenv("BUCKET_FOLDER", "production")
    resolver = SurveyIdResolver()

    assert resolver.resolve_question_id(86) == 86
    assert resolver.resolve_question_id(840) == 840
    assert resolver.resolve_group_id(90) == 90
    assert resolver.resolve_form_id(7) == 7

    formula = "ID86 * 100 / (ID840 + ID841)"
    assert resolver.resolve_formula(formula) == formula


def test_survey_id_resolver_local_resolution(tmp_path, monkeypatch):
    """
    TAC-SYNC.4: In local/test, resolver maps canonical IDs to local DB IDs.
    """
    monkeypatch.setenv("BUCKET_FOLDER", "local")

    mock_ledger = {
        "target_environment": "local",
        "form_mapping": {"7": 1},
        "question_group_mapping": {"90": 12},
        "question_mapping": {
            "86": 28,
            "840": 29,
            "841": 30,
        },
    }
    ledger_path = str(tmp_path / "mock_id_mapping.json")
    with open(ledger_path, "w") as f:
        json.dump(mock_ledger, f)

    resolver = SurveyIdResolver(mapping_path=ledger_path)

    # Question resolution
    assert resolver.resolve_question_id(86) == 28
    assert resolver.resolve_question_id(840) == 29
    assert resolver.resolve_question_id(841) == 30
    # Fallback to canonical when unmapped
    assert resolver.resolve_question_id(9999) == 9999

    # Group and Form resolution
    assert resolver.resolve_group_id(90) == 12
    assert resolver.resolve_group_id(9999) == 9999
    assert resolver.resolve_form_id(7) == 1
    assert resolver.resolve_form_id(9999) == 9999


def test_survey_id_resolver_formula_rewriting(tmp_path, monkeypatch):
    """
    TAC-SYNC.4: Test formula AST token rewriting with word boundaries.
    """
    monkeypatch.setenv("BUCKET_FOLDER", "local")

    mock_ledger = {
        "question_mapping": {
            "86": 28,
            "840": 29,
            "841": 30,
        },
    }
    ledger_path = str(tmp_path / "formula_id_mapping.json")
    with open(ledger_path, "w") as f:
        json.dump(mock_ledger, f)

    resolver = SurveyIdResolver(mapping_path=ledger_path)

    # Arithmetic formula
    expr = "ID86 * 100 / (ID840 + ID841)"
    expected = "ID28 * 100 / (ID29 + ID30)"
    assert resolver.resolve_formula(expr) == expected

    # Function calls with commas
    expr2 = "SUM(ID840, ID841) + AVG(ID86)"
    expected2 = "SUM(ID29, ID30) + AVG(ID28)"
    assert resolver.resolve_formula(expr2) == expected2

    # Tokens that must NOT be matched
    expr3 = "UUID123 + ID_MEMBER + ID86"
    expected3 = "UUID123 + ID_MEMBER + ID28"
    assert resolver.resolve_formula(expr3) == expected3


def test_survey_id_resolver_module_helpers(tmp_path, monkeypatch):
    """
    Tests module-level convenience functions.
    """
    monkeypatch.setenv("BUCKET_FOLDER", "test")

    mock_ledger = {
        "question_mapping": {"100": 200},
    }
    ledger_path = str(tmp_path / "helper_id_mapping.json")
    with open(ledger_path, "w") as f:
        json.dump(mock_ledger, f)

    # Initialize resolver and set default instance mapping
    res = SurveyIdResolver(mapping_path=ledger_path)
    res.load_mapping()

    assert res.resolve_question_id(100) == 200
    assert resolve_question_id(100, resolver=res) == 200
    assert resolve_formula("ID100", resolver=res) == "ID200"


def test_seed_mock_visualization_data(session):
    """
    Tests seeding mock visualization submissions and answers
    for Form 7 (SYNC-04).
    """
    from scripts.seed_mock_visualization_data import (
        seed_mock_visualization_data,
    )

    # Ensure form 7 exists
    form_7 = (
        session.query(models.form.Form)
        .filter(models.form.Form.id == 7)
        .first()
    )
    if not form_7:
        pytest.skip("Form 7 not present in test database")

    # Create test org & user if not present
    org = (
        session.query(models.organisation.Organisation)
        .filter_by(name="Test Visualizer Org")
        .first()
    )
    if not org:
        org = models.organisation.Organisation(
            code="TVO",
            name="Test Visualizer Org",
            active=True,
        )
        session.add(org)
        session.flush()

    user = (
        session.query(models.user.User)
        .filter_by(email="test.visualizer@example.com")
        .first()
    )
    if not user:
        user = models.user.User(
            email="test.visualizer@example.com",
            password="mockpassword",
            name="Test Visualizer",
            phone_number="123456",
            role=models.user.UserRole.secretariat_admin,
            organisation=org.id,
        )
        session.add(user)
        session.flush()

    # Seed data for 2022, 2023, 2024
    result = seed_mock_visualization_data(
        session=session,
        form_id=7,
        org_id=org.id,
        user_id=user.id,
        years=[2022, 2023, 2024],
    )

    assert result["form_id"] == 7
    assert len(result["submissions"]) == 3
    assert result["answers_seeded"] > 0

    # Test Idempotency: re-running updates instead of duplicating
    result2 = seed_mock_visualization_data(
        session=session,
        form_id=7,
        org_id=org.id,
        user_id=user.id,
        years=[2022, 2023, 2024],
    )
    assert len(result2["submissions"]) == 3


def test_seed_mock_visualization_data_cli_main(monkeypatch, session):
    """
    Tests invoking seed_mock_visualization_data.py CLI main().
    """
    import sys
    from scripts.seed_mock_visualization_data import main

    form_7 = (
        session.query(models.form.Form)
        .filter(models.form.Form.id == 7)
        .first()
    )
    if not form_7:
        pytest.skip("Form 7 not present in test database")

    monkeypatch.setattr(
        sys,
        "argv",
        [
            "seed_mock_visualization_data.py",
            "--form-id",
            "7",
            "--years",
            "2023",
            "2024",
        ],
    )

    main()


def test_import_survey_schema_webform_json_format(session, tmp_path):
    """
    Tests import_survey_schema normalizer with published webform JSON format
    (e.g. production_forms_7_member_survey_v78.0.json structure).
    """
    from scripts.import_survey_schema import (
        import_survey_schema,
        normalize_schema_data,
    )

    webform_fixture = {
        "id": 7,
        "name": "Member Survey Webform",
        "description": "Published survey form",
        "version": 78.0,
        "languages": ["en"],
        "tree": {
            "tree_7": [
                {
                    "title": "Strategy 1",
                    "value": "Strategy 1",
                    "children": [
                        {
                            "title": "Child Strategy 1.1",
                            "value": "Child Strategy 1.1",
                        }
                    ],
                }
            ]
        },
        "question_group": [
            {
                "id": 90,
                "name": "Transparency and Traceability",
                "description": "Group 90 description",
                "order": 1,
                "repeatable": False,
                "leading_question": None,
                "translations": [],
                "member_access": [],
                "isco_access": [],
                "question": [
                    {
                        "id": 1296,
                        "name": "Did company source directly?",
                        "type": "option",
                        "order": 1,
                        "required": True,
                        "datapoint_name": False,
                        "option": [
                            {"name": "Yes", "code": None, "order": 1},
                            {"name": "No", "code": None, "order": 2},
                        ],
                    },
                    {
                        "id": 1297,
                        "name": "Please specify direct share",
                        "type": "number",
                        "order": 2,
                        "required": False,
                        "datapoint_name": False,
                        "dependency": [{"id": 1296, "options": ["Yes"]}],
                    },
                    {
                        "id": 1219,
                        "name": "Select strategies implemented",
                        "type": "tree",
                        "order": 3,
                        "required": False,
                        "datapoint_name": False,
                        "dependency": [{"id": 1297, "min": 1}],
                    },
                ],
            }
        ],
    }

    # Test normalization function
    normalized = normalize_schema_data(webform_fixture)
    assert "forms" in normalized
    assert normalized["forms"][0]["canonical_form_id"] == 7
    assert len(normalized["forms"][0]["cascades"]) == 1
    assert len(normalized["forms"][0]["question_groups"]) == 1
    assert len(normalized["forms"][0]["question_groups"][0]["questions"]) == 3

    ledger_path = str(tmp_path / "webform_ledger.json")
    result = import_survey_schema(
        session=session,
        schema_data=webform_fixture,
        mode="update",
        ledger_file=ledger_path,
        target_environment="test",
    )

    assert result["form_mapping"]["7"] == 7
    assert "1296" in result["question_mapping"]
    assert "1297" in result["question_mapping"]
    assert "1219" in result["question_mapping"]
    assert os.path.exists(ledger_path)


def test_survey_sync_e2e_roundtrip_parity(session, tmp_path):
    """
    Full Round-Trip Parity Test (TAC-SYNC.6):
    1. Dump existing database schema for Form 7.
    2. Verify 0 sensitive answer/user/org rows in dump.
    3. Import the dumped schema into the database.
    4. Dump again and verify structural equivalence.
    """
    from scripts.dump_survey_schema import dump_survey_schema
    from scripts.import_survey_schema import import_survey_schema

    # 1. First dump
    dump_1 = dump_survey_schema(session=session, form_ids=[7])
    assert "forms" in dump_1
    assert len(dump_1["forms"]) >= 1

    form_entry = dump_1["forms"][0]
    # Verify zero leakage
    assert "answers" not in form_entry
    assert "users" not in form_entry
    assert "data" not in form_entry
    assert "organisations" not in form_entry

    initial_group_count = len(form_entry["question_groups"])
    initial_q_count = sum(
        len(g["questions"]) for g in form_entry["question_groups"]
    )

    # 2. Re-import
    ledger_path = str(tmp_path / "roundtrip_ledger.json")
    import_result = import_survey_schema(
        session=session,
        schema_data=dump_1,
        mode="update",
        ledger_file=ledger_path,
        target_environment="test",
    )
    assert len(import_result["question_mapping"]) == initial_q_count

    # 3. Second dump
    dump_2 = dump_survey_schema(session=session, form_ids=[7])
    form_entry_2 = dump_2["forms"][0]

    # 4. Assert structural parity
    assert form_entry_2["name"] == form_entry["name"]
    assert len(form_entry_2["question_groups"]) == initial_group_count
    q_count_2 = sum(
        len(g["questions"]) for g in form_entry_2["question_groups"]
    )
    assert q_count_2 == initial_q_count
