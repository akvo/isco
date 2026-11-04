"""
Safe AST Formula Evaluator Engine

Evaluates mathematical formulas dynamically across survey question answers
using Python's native abstract syntax tree (`ast`) module with a strict
node-type and function whitelist.

Enforces zero code injection, division-by-zero protection, and missing data.
"""

import ast
from typing import Any, Dict, List, Optional, Set


class FormulaSecurityError(ValueError):
    """Raised when an expression contains unapproved AST nodes or calls."""
    pass


# Strict whitelist of permitted AST node types (TAC-02.2)
ALLOWED_NODE_TYPES = (
    ast.Expression,
    ast.BinOp,
    ast.UnaryOp,
    ast.Call,
    ast.Name,
    ast.Constant,
    ast.Num,
    ast.Load,
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.USub,
    ast.UAdd,
)

# Permitted statistical and helper functions
ALLOWED_FUNCTIONS: Set[str] = {"SUM", "AVG", "MIN", "MAX", "COALESCE"}


def _safe_float(val: Any) -> Optional[float]:
    """Safely converts a value to float, returning None on failure."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, (list, tuple)):
        return None
    try:
        return float(str(val).strip())
    except (ValueError, TypeError):
        return None


def _flatten_values(args: List[Any]) -> List[float]:
    """Flattens a list of scalar numbers and nested lists, discarding None."""
    result: List[float] = []
    for arg in args:
        if arg is None:
            continue
        if isinstance(arg, (list, tuple)):
            for item in arg:
                flt = _safe_float(item)
                if flt is not None:
                    result.append(flt)
        else:
            flt = _safe_float(arg)
            if flt is not None:
                result.append(flt)
    return result


class FormulaEvaluator:
    """
    Parses and evaluates arithmetic and statistical expressions over answers.
    Caches parsed AST trees in memory for high-throughput evaluation.
    """

    def __init__(self):
        self._cache: Dict[str, ast.Expression] = {}

    def parse_and_validate(self, formula: str) -> ast.Expression:
        """
        Parses a formula string into an AST Expression and verifies that all
        nodes strictly conform to the security whitelist.

        Raises:
            FormulaSecurityError: If unapproved node or function is used.
            ValueError: If formula is empty or has invalid syntax.
        """
        if not formula or not formula.strip():
            raise ValueError("Formula expression cannot be empty.")

        formula = formula.strip()
        if formula in self._cache:
            return self._cache[formula]

        try:
            tree = ast.parse(formula, mode="eval")
        except SyntaxError as e:
            raise ValueError(
                f"Syntax error in formula '{formula}': {e}"
            ) from e

        # Validate every AST node against whitelist
        for node in ast.walk(tree):
            if not isinstance(node, ALLOWED_NODE_TYPES):
                raise FormulaSecurityError(
                    f"Forbidden expression node: {type(node).__name__}. "
                    "Only safe arithmetic operations and whitelisted "
                    "functions are permitted."
                )

            # Extra checks on function calls
            if isinstance(node, ast.Call):
                if not isinstance(node.func, ast.Name):
                    raise FormulaSecurityError(
                        "Dynamic or indirect calls are strictly forbidden."
                    )
                func_name = node.func.id.upper()
                if func_name not in ALLOWED_FUNCTIONS:
                    allowed_sorted = sorted(list(ALLOWED_FUNCTIONS))
                    raise FormulaSecurityError(
                        f"Unapproved function '{node.func.id}'. "
                        f"Allowed functions: {allowed_sorted}."
                    )
                if node.keywords:
                    raise FormulaSecurityError(
                        "Keyword arguments are not allowed in formulas."
                    )

            # Extra check on variable access
            if isinstance(node, ast.Name):
                if not isinstance(node.ctx, ast.Load):
                    raise FormulaSecurityError(
                        "Variable modification is strictly forbidden."
                    )

        self._cache[formula] = tree
        return tree

    def evaluate(
        self,
        formula: str,
        answers: Dict[Any, Any],
    ) -> Optional[float]:
        """
        Evaluates a formula against a dictionary of answers.

        Args:
            formula: Arithmetic string e.g. 'ID840 + ID841'.
            answers: Dict mapping question IDs to values or repeat rows.

        Returns:
            Computed float value, or None if data is missing or invalid.
        """
        tree = self.parse_and_validate(formula)
        result = self._eval_node(tree.body, answers)

        if isinstance(result, list):
            if len(result) == 1:
                return _safe_float(result[0])
            return None

        return _safe_float(result)

    def _lookup_variable(self, name: str, answers: Dict[Any, Any]) -> Any:
        """
        Resolves variable token (e.g. 'ID840') into question answer value.
        Supports:
          - Pure integer question ID: answers[840]
          - String integer key: answers["840"]
          - Prefixed string key: answers["ID840"]
        """
        # If token starts with ID<digits>, resolve pure int ID
        if name.upper().startswith("ID") and name[2:].isdigit():
            qid = int(name[2:])
            if qid in answers:
                val = answers[qid]
            elif str(qid) in answers:
                val = answers[str(qid)]
            elif name in answers:
                val = answers[name]
            else:
                return None
        else:
            if name in answers:
                val = answers[name]
            elif name.isdigit() and int(name) in answers:
                val = answers[int(name)]
            else:
                return None

        if val is None:
            return None

        if isinstance(val, (list, tuple)):
            # Retain repeat group list for aggregation functions
            return [
                _safe_float(item)
                for item in val
                if _safe_float(item) is not None
            ]

        return _safe_float(val)

    def _eval_node(self, node: ast.AST, answers: Dict[Any, Any]) -> Any:
        """Recursively evaluates an AST node."""
        if isinstance(node, ast.Constant):
            return _safe_float(node.value)

        if isinstance(node, ast.Num):  # Python 3.8 backward compatibility
            return _safe_float(node.n)

        if isinstance(node, ast.Name):
            return self._lookup_variable(node.id, answers)

        if isinstance(node, ast.UnaryOp):
            operand = self._eval_node(node.operand, answers)
            if operand is None:
                return None
            val = _safe_float(operand)
            if val is None:
                return None
            if isinstance(node.op, ast.USub):
                return -val
            if isinstance(node.op, ast.UAdd):
                return +val
            return None

        if isinstance(node, ast.BinOp):
            left = self._eval_node(node.left, answers)
            right = self._eval_node(node.right, answers)

            # Auto-flatten single-item lists if operand wasn't wrapped in SUM
            if isinstance(left, list):
                left = left[0] if len(left) == 1 else None
            if isinstance(right, list):
                right = right[0] if len(right) == 1 else None

            f_left = _safe_float(left)
            f_right = _safe_float(right)

            if f_left is None or f_right is None:
                return None

            if isinstance(node.op, ast.Add):
                return f_left + f_right
            if isinstance(node.op, ast.Sub):
                return f_left - f_right
            if isinstance(node.op, ast.Mult):
                return f_left * f_right
            if isinstance(node.op, ast.Div):
                # Division-by-zero safeguard (TAC-02.4)
                if f_right == 0.0:
                    return None
                return f_left / f_right

            return None

        if isinstance(node, ast.Call):
            func_name = node.func.id.upper()  # type: ignore[attr-defined]

            if func_name == "COALESCE":
                # Short-circuit COALESCE evaluation
                for arg_node in node.args:
                    val = self._eval_node(arg_node, answers)
                    if isinstance(val, list):
                        val = val[0] if len(val) > 0 else None
                    flt = _safe_float(val)
                    if flt is not None:
                        return flt
                return None

            # Evaluate arguments for arithmetic/statistical functions
            arg_values = [
                self._eval_node(arg_node, answers)
                for arg_node in node.args
            ]
            flat_nums = _flatten_values(arg_values)

            if not flat_nums:
                return None

            if func_name == "SUM":
                return sum(flat_nums)
            if func_name == "AVG":
                return sum(flat_nums) / len(flat_nums)
            if func_name == "MIN":
                return min(flat_nums)
            if func_name == "MAX":
                return max(flat_nums)

            return None

        raise FormulaSecurityError(
            f"Unsupported AST node: {type(node).__name__}"
        )


# Singleton evaluator instance
default_evaluator = FormulaEvaluator()


def evaluate_formula(
    formula: str,
    answers: Dict[Any, Any],
    evaluator: Optional[FormulaEvaluator] = None,
) -> Optional[float]:
    """Convenience helper to evaluate a formula."""
    active_evaluator = evaluator or default_evaluator
    return active_evaluator.evaluate(formula, answers)


def validate_formula(
    formula: str,
    evaluator: Optional[FormulaEvaluator] = None,
) -> bool:
    """Convenience helper to validate formula syntax and security whitelist."""
    active_evaluator = evaluator or default_evaluator
    try:
        active_evaluator.parse_and_validate(formula)
        return True
    except (ValueError, FormulaSecurityError):
        return False
