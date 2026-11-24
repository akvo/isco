#!/usr/bin/env python3
"""
CLI Script to batch import or update annual partner feedback messages
from Excel (.xlsx) or CSV files into the ISCO member_message table.

Usage:
    # Run with default file location (source/member_feedback.xlsx):
    python -m scripts.import_member_messages [--dry-run]

    # Or specify a custom file path:
    python -m scripts.import_member_messages -f path/to/file.xlsx [--dry-run]
"""

import os
import sys
import argparse

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from db.connection import SessionLocal  # noqa: E402
from util.feedback_template import parse_and_import_feedback_file  # noqa: E402

DEFAULT_LOCATIONS = [
    os.path.join(BASE_DIR, "source", "member_feedback.xlsx"),
    os.path.join(BASE_DIR, "source", "member_feedback.csv"),
    os.path.join(BASE_DIR, "tmp", "member_feedback.xlsx"),
    os.path.join(BASE_DIR, "tmp", "sample_member_feedback.xlsx"),
]


def resolve_input_file(custom_path: str = None) -> str:
    """
    Resolves the input spreadsheet path:
    1. Uses custom_path if provided.
    2. Otherwise searches default candidate locations in order.
    """
    if custom_path:
        resolved = os.path.abspath(custom_path)
        if not os.path.exists(resolved):
            print(
                f"Error: Specified file not found: {resolved}",
                file=sys.stderr,
            )
            sys.exit(1)
        return resolved

    for candidate in DEFAULT_LOCATIONS:
        if os.path.exists(candidate):
            return candidate

    print(
        "Error: No feedback file specified and no default file found.\n"
        "Default search paths:\n"
        "  - source/member_feedback.xlsx (recommended)\n"
        "  - source/member_feedback.csv\n"
        "  - tmp/member_feedback.xlsx\n\n"
        "Please place your feedback file at "
        "'source/member_feedback.xlsx' or run:\n"
        "  python -m scripts.import_member_messages --file path/to/file.xlsx",
        file=sys.stderr,
    )
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Import member feedback messages into ISCO database."
    )
    parser.add_argument(
        "-f",
        "--file",
        required=False,
        default=None,
        help=(
            "Optional path to .xlsx or .csv feedback file. "
            "Defaults to 'source/member_feedback.xlsx' if omitted."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate spreadsheet structure without committing changes",
    )

    args = parser.parse_args()
    file_path = resolve_input_file(args.file)

    mode_str = (
        "DRY RUN (no database changes)"
        if args.dry_run
        else "LIVE COMMIT"
    )
    print("=== ISCO Member Feedback Importer ===")
    print(f"File: {file_path}")
    print(f"Mode: {mode_str}")

    with open(file_path, "rb") as f:
        file_contents = f.read()

    filename = os.path.basename(file_path)
    session = SessionLocal()
    try:
        result = parse_and_import_feedback_file(
            file_contents=file_contents,
            filename=filename,
            session=session,
            dry_run=args.dry_run,
        )

        print("\n--- Summary ---")
        print(f"Total Rows Processed : {result['total_rows']}")
        print(f"Successfully Imported: {result['imported']}")

        if result["errors"]:
            print(f"\nEncountered {len(result['errors'])} warnings/errors:")
            for err in result["errors"]:
                print(f"  [!] {err}")

        if not args.dry_run:
            print("\n[SUCCESS] Member messages updated in database.")
        else:
            print(
                "\n[DRY RUN COMPLETE] Validation finished. "
                "Run without --dry-run to commit."
            )

    finally:
        session.close()


if __name__ == "__main__":
    main()
