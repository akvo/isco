import os
import json
import pytest
from services.formula_evaluator import (
    FormulaEvaluator,
    FormulaSecurityError,
    evaluate_formula,
    validate_formula,
)


def get_config_path():
    """Locate visualization_mapping.json across test environments."""
    candidates = [
        "source/config/visualization_mapping.json",
        "backend/source/config/visualization_mapping.json",
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "source",
            "config",
            "visualization_mapping.json",
        ),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return candidates[0]


class TestVisualizationMappingConfig:
    """Verifies schema and integrity of visualization_mapping.json."""

    def test_visualization_mapping_json_exists_and_valid(self):
        config_path = get_config_path()
        assert os.path.exists(config_path), f"Missing: {config_path}"

        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        assert "challenges" in data, "Missing 'challenges' key"
        assert "exclude_current_member_from_average" in data
        assert isinstance(data["exclude_current_member_from_average"], bool)

        challenges = data["challenges"]
        assert len(challenges) == 4, f"Expected 4, got {len(challenges)}"

        expected_challenge_ids = {
            "transparency_and_traceability",
            "deforestation",
            "living_income",
            "child_labour",
        }
        actual_challenge_ids = {c["id"] for c in challenges}
        assert actual_challenge_ids == expected_challenge_ids

        expected_indicator_ids = {
            "sourced_directly",
            "sourced_traceable",
            "deforestation_free",
            "li_gap_measured",
            "li_strategy_implemented",
            "clmrs_covered",
            "child_labour_identified",
            "support_received",
            "follow_up_visits",
        }

        all_indicators = []
        for c in challenges:
            assert "name" in c
            assert "indicators" in c
            for ind in c["indicators"]:
                all_indicators.append(ind)
                # TAC-02.1 schema validation
                assert "id" in ind
                assert "name" in ind
                assert "form_id" in ind
                assert ind["form_id"] == 7
                assert "chart_type" in ind
                assert ind["chart_type"] == "line"
                assert "formula" in ind
                assert "numerator_ids" in ind
                assert isinstance(ind["numerator_ids"], list)
                assert "denominator_ids" in ind
                assert isinstance(ind["denominator_ids"], list)
                assert "type" in ind
                assert ind["type"] in ("percentage", "ratio")
                assert "higher_is_better" in ind
                assert isinstance(ind["higher_is_better"], bool)

                # Validate formula syntax and AST security
                assert validate_formula(ind["formula"]) is True

        found_indicator_ids = {ind["id"] for ind in all_indicators}
        assert found_indicator_ids == expected_indicator_ids
        assert len(all_indicators) == 9

        # Inverted polarity check
        cl_identified = next(
            i for i in all_indicators if i["id"] == "child_labour_identified"
        )
        assert cl_identified["higher_is_better"] is False


class TestFormulaEvaluatorArithmetic:
    """Verifies basic arithmetic, grouping, and variable resolution."""

    def test_single_variable_lookup_with_int_keys(self):
        evaluator = FormulaEvaluator()
        answers = {86: 65.5}
        result = evaluator.evaluate("ID86", answers)
        assert result == 65.5

    def test_single_variable_lookup_with_string_keys(self):
        evaluator = FormulaEvaluator()
        # Should gracefully support "86" or "ID86"
        assert evaluator.evaluate("ID86", {"86": 42.0}) == 42.0
        assert evaluator.evaluate("ID86", {"ID86": 42.0}) == 42.0

    def test_addition_two_questions(self):
        evaluator = FormulaEvaluator()
        answers = {840: 35.0, 841: 65.0}
        result = evaluator.evaluate("ID840 + ID841", answers)
        assert result == 100.0

    def test_division_ratio(self):
        evaluator = FormulaEvaluator()
        answers = {575: 120.0, 842: 240.0}
        result = evaluator.evaluate("ID575 / ID842", answers)
        assert result == 0.5

    def test_nested_parentheses_and_arithmetic(self):
        evaluator = FormulaEvaluator()
        answers = {840: 10.0, 841: 20.0, 842: 60.0}
        # (10 + 20) / 60 = 0.5
        assert evaluator.evaluate("(ID840 + ID841) / ID842", answers) == 0.5
        # 100 * (1 - (30 / 60)) = 50.0
        expr = "100 * (1 - (ID840 + ID841) / ID842)"
        assert evaluator.evaluate(expr, answers) == 50.0

    def test_unary_operations(self):
        evaluator = FormulaEvaluator()
        answers = {86: 25.0}
        assert evaluator.evaluate("-ID86 + 100", answers) == 75.0
        assert evaluator.evaluate("+ID86 + 25", answers) == 50.0

    def test_subtraction_and_multiplication(self):
        evaluator = FormulaEvaluator()
        answers = {840: 100.0, 841: 20.0}
        assert evaluator.evaluate("ID840 - ID841", answers) == 80.0
        assert evaluator.evaluate("ID840 * 2", answers) == 200.0

    def test_convenience_evaluate_formula_helper(self):
        assert evaluate_formula("ID86 + 10", {86: 5.0}) == 15.0

    def test_empty_or_whitespace_formula_raises_value_error(self):
        evaluator = FormulaEvaluator()
        with pytest.raises(ValueError, match="cannot be empty"):
            evaluator.evaluate("", {})
        with pytest.raises(ValueError, match="cannot be empty"):
            evaluator.evaluate("   ", {})

    def test_syntax_error_in_formula_raises_value_error(self):
        evaluator = FormulaEvaluator()
        with pytest.raises(ValueError, match="Syntax error"):
            evaluator.evaluate("ID86 + + + *", {})

    def test_arbitrary_variable_name_without_id_prefix(self):
        evaluator = FormulaEvaluator()
        res = evaluator.evaluate("custom_var + 10", {"custom_var": 5.0})
        assert res == 15.0
        assert evaluator.evaluate("custom_var + 10", {}) is None


class TestFormulaEvaluatorSafeguards:
    """Verifies division-by-zero, missing answers, and type handling."""

    def test_division_by_zero_returns_none(self):
        evaluator = FormulaEvaluator()
        answers = {575: 100.0, 842: 0}
        result = evaluator.evaluate("ID575 / ID842", answers)
        assert result is None

    def test_division_by_zero_float_returns_none(self):
        evaluator = FormulaEvaluator()
        answers = {575: 100.0, 842: 0.0}
        result = evaluator.evaluate("ID575 / ID842", answers)
        assert result is None

    def test_missing_question_returns_none(self):
        evaluator = FormulaEvaluator()
        answers = {840: 35.0}
        result = evaluator.evaluate("ID840 + ID841", answers)
        assert result is None

    def test_none_value_in_answers_returns_none(self):
        evaluator = FormulaEvaluator()
        answers = {840: 35.0, 841: None}
        result = evaluator.evaluate("ID840 + ID841", answers)
        assert result is None

    def test_empty_answers_dict_returns_none(self):
        evaluator = FormulaEvaluator()
        assert evaluator.evaluate("ID86", {}) is None

    def test_invalid_string_in_answer_returns_none(self):
        evaluator = FormulaEvaluator()
        answers = {840: "not-a-number", 841: 10.0}
        assert evaluator.evaluate("ID840 + ID841", answers) is None

    def test_numeric_string_in_answer_coerced_safely(self):
        evaluator = FormulaEvaluator()
        answers = {840: "35.5", 841: 64.5}
        assert evaluator.evaluate("ID840 + ID841", answers) == 100.0


class TestFormulaEvaluatorFunctions:
    """Verifies SUM, AVG, MIN, MAX, COALESCE and repeat group aggregations."""

    def test_sum_multiple_scalars(self):
        evaluator = FormulaEvaluator()
        answers = {840: 10.0, 841: 20.0, 842: 30.0}
        assert evaluator.evaluate("SUM(ID840, ID841, ID842)", answers) == 60.0

    def test_sum_repeat_group_list(self):
        evaluator = FormulaEvaluator()
        # Question 1216 answered in repeat group rows [100, 200, 300]
        answers = {1216: [100.0, 200.0, 300.0], 842: 1200.0}
        result = evaluator.evaluate("SUM(ID1216) / ID842", answers)
        assert result == 0.5

    def test_sum_with_mixed_scalars_and_lists(self):
        evaluator = FormulaEvaluator()
        answers = {10: [5.0, 15.0], 20: 30.0}
        assert evaluator.evaluate("SUM(ID10, ID20, 10)", answers) == 60.0

    def test_sum_empty_or_all_none_returns_none(self):
        evaluator = FormulaEvaluator()
        assert evaluator.evaluate("SUM(ID999)", {}) is None
        assert evaluator.evaluate("SUM(ID999)", {999: []}) is None
        assert evaluator.evaluate("SUM(ID999)", {999: [None, None]}) is None

    def test_avg_scalars_and_list(self):
        evaluator = FormulaEvaluator()
        answers = {1216: [10.0, 20.0, 30.0]}
        assert evaluator.evaluate("AVG(ID1216)", answers) == 20.0
        assert evaluator.evaluate("AVG(10, 20, 30)", {}) == 20.0

    def test_min_and_max(self):
        evaluator = FormulaEvaluator()
        answers = {10: 15.0, 20: 85.0}
        assert evaluator.evaluate("MIN(ID10, ID20)", answers) == 15.0
        assert evaluator.evaluate("MAX(ID10, ID20)", answers) == 85.0
        assert evaluator.evaluate("MIN(ID10, 50, 100)", answers) == 15.0

    def test_coalesce_prioritization(self):
        evaluator = FormulaEvaluator()
        answers = {1: None, 2: 75.0, 3: 100.0}
        assert evaluator.evaluate("COALESCE(ID1, ID2, ID3)", answers) == 75.0
        assert evaluator.evaluate("COALESCE(ID1, 0)", answers) == 0.0
        assert evaluator.evaluate("COALESCE(ID1, ID999)", answers) is None


class TestFormulaEvaluatorSecurity:
    """Verifies strict AST whitelist and injection rejection (TAC-02.2)."""

    def test_reject_import_attempt(self):
        evaluator = FormulaEvaluator()
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("__import__('os').system('ls')", {})

    def test_reject_dunder_attributes(self):
        evaluator = FormulaEvaluator()
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("''.__class__.__bases__[0]", {})

    def test_reject_arbitrary_method_calls(self):
        evaluator = FormulaEvaluator()
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("ID86.upper()", {86: "test"})

    def test_reject_unapproved_functions(self):
        evaluator = FormulaEvaluator()
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("eval('1+1')", {})
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("open('/etc/passwd')", {})
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("exec('x = 1')", {})

    def test_reject_lambda_and_comprehensions(self):
        evaluator = FormulaEvaluator()
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("(lambda x: x)(ID86)", {86: 10})
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("[x for x in [1, 2]]", {})

    def test_reject_indexing_subscript(self):
        evaluator = FormulaEvaluator()
        with pytest.raises(FormulaSecurityError):
            evaluator.evaluate("ID86[0]", {86: [1, 2]})

    def test_validate_formula_helper_for_malicious_code(self):
        assert validate_formula("__import__('sys').exit(0)") is False
        assert validate_formula("ID840 + ID841") is True
        assert validate_formula("SUM(ID1216) / ID842") is True


class TestAllNineDashboardIndicators:
    """Verifies all 9 member dashboard indicators with realistic answers."""

    def test_evaluate_all_nine_indicators(self):
        config_path = get_config_path()
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)

        answers = {
            86: 65.0,                         # Sourced directly
            840: 35.0,                        # Sourced indirectly
            841: 65.0,                        # Sourced certified
            851: 72.0,                        # Deforestation free
            1216: [400.0, 500.0, 300.0],      # LI gap measured
            842: 2400.0,                      # Total households
            847: [200.0, 400.0, 600.0],       # Strategy implemented
            575: 1800.0,                      # Households in CLMRS
            577: 250.0,                       # Child labour cases identified
            873: 5000.0,                      # Children covered
            579: 200.0,                       # Children received support
            874: 150.0,                       # Children with 2 visits
        }

        evaluator = FormulaEvaluator()

        expected_results = {
            "sourced_directly": 65.0,
            "sourced_traceable": 100.0,       # 35.0 + 65.0
            "deforestation_free": 72.0,
            "li_gap_measured": 0.5,           # 1200 / 2400
            "li_strategy_implemented": 0.5,   # 1200 / 2400
            "clmrs_covered": 0.75,            # 1800 / 2400
            "child_labour_identified": 0.05,  # 250 / 5000
            "support_received": 0.8,          # 200 / 250
            "follow_up_visits": 0.6,          # 150 / 250
        }

        for challenge in config["challenges"]:
            for ind in challenge["indicators"]:
                val = evaluator.evaluate(ind["formula"], answers)
                assert val is not None, f"Indicator {ind['id']} is None"
                exp = expected_results[ind["id"]]
                assert round(val, 4) == round(exp, 4), (
                    f"Mismatch on {ind['id']}: got {val}, expected {exp}"
                )
