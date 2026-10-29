"""
Survey ID Resolver Service

Translates canonical/production Form, QuestionGroup, and Question IDs
into target environment database IDs. Supports arithmetic and AST formula
rewriting (e.g. 'ID840 + ID841' -> 'ID29 + ID30').
"""

import os
import re
import json
from typing import Dict, Optional


class SurveyIdResolver:
    """
    In production: pass-through identity function.
    In local/test: resolves canonical IDs using id_mapping.json ledger with
    in-memory dictionary caching.
    """

    def __init__(self, mapping_path: Optional[str] = None):
        raw_env = (
            (
                os.environ.get("CONFIG_SOURCE_PATH")
                or os.environ.get("BUCKET_FOLDER")
                or "local"
            )
            .strip()
            .strip('"')
            .strip("'")
            .lower()
        )
        self.env = os.path.basename(raw_env.rstrip("/"))

        if mapping_path:
            self.mapping_path = mapping_path
        else:
            self.mapping_path = f"source/config/{self.env}/id_mapping.json"

        self._question_mapping: Dict[int, int] = {}
        self._group_mapping: Dict[int, int] = {}
        self._form_mapping: Dict[int, int] = {}
        self._loaded: bool = False

    def reload(self) -> None:
        """Forces reloading the ledger mappings from disk."""
        self._loaded = False
        self.load_mapping(force_reload=True)

    def load_mapping(self, force_reload: bool = False) -> None:
        """Loads environment ID mapping ledger into in-memory dictionary."""
        if self._loaded and not force_reload:
            return

        if self.env == "production":
            self._loaded = True
            return

        if os.path.exists(self.mapping_path):
            with open(self.mapping_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            self._question_mapping = {
                int(k): int(v)
                for k, v in data.get("question_mapping", {}).items()
            }
            self._group_mapping = {
                int(k): int(v)
                for k, v in data.get("question_group_mapping", {}).items()
            }
            self._form_mapping = {
                int(k): int(v) for k, v in data.get("form_mapping", {}).items()
            }

        self._loaded = True

    def resolve_question_id(self, canonical_id: int) -> int:
        """
        Translates a canonical question ID to the local database ID.
        Falls back to canonical_id if unmapped.
        """
        self.load_mapping()
        if self.env == "production":
            return canonical_id
        return self._question_mapping.get(canonical_id, canonical_id)

    def resolve_group_id(self, canonical_id: int) -> int:
        """
        Translates a canonical question group ID to the local database ID.
        """
        self.load_mapping()
        if self.env == "production":
            return canonical_id
        return self._group_mapping.get(canonical_id, canonical_id)

    def resolve_form_id(self, canonical_id: int) -> int:
        """
        Translates a canonical form ID to the local database ID.
        """
        self.load_mapping()
        if self.env == "production":
            return canonical_id
        return self._form_mapping.get(canonical_id, canonical_id)

    def resolve_formula(self, formula: str) -> str:
        """
        Translates all ID tokens in an indicator formula (e.g. 'ID840 + ID841')
        into target environment IDs (e.g. 'ID29 + ID30').
        Uses word boundaries to preserve function names and operators.
        """
        self.load_mapping()
        if self.env == "production" or not formula:
            return formula

        def _replace_id(match: re.Match) -> str:
            cid = int(match.group(1))
            lid = self.resolve_question_id(cid)
            return f"ID{lid}"

        return re.sub(r"\bID(\d+)\b", _replace_id, formula)


# Default singleton instance
default_resolver = SurveyIdResolver()


def resolve_question_id(
    canonical_id: int,
    resolver: Optional[SurveyIdResolver] = None,
) -> int:
    """Convenience helper to resolve a question ID."""
    active_resolver = resolver or default_resolver
    return active_resolver.resolve_question_id(canonical_id)


def resolve_formula(
    formula: str,
    resolver: Optional[SurveyIdResolver] = None,
) -> str:
    """Convenience helper to resolve formula tokens."""
    active_resolver = resolver or default_resolver
    return active_resolver.resolve_formula(formula)
