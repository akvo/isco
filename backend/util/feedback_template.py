from io import BytesIO
from typing import List, Dict, Any, Optional
import pandas as pd
import xlsxwriter
from sqlalchemy.orm import Session
from models.organisation import Organisation
from models.member_message import MemberMessage


def generate_protected_feedback_template(
    organisations: List[Organisation],
    year: int
) -> BytesIO:
    """
    Generates a protected Excel (.xlsx) workbook for annual feedback import.
    - Sheet 1 ('Member Feedback'): Protected worksheet.
      Columns A-C (organisation_id, code, name) are locked.
      Column D (year) is unlocked and pre-filled with the target year.
      Columns E-H (achievements, growth_areas, general, lang) are unlocked.
    - Sheet 2 ('Instructions & Examples'): Reference guidelines and examples.
    """
    output = BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})

    # Formats
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#1e293b',
        'font_color': '#ffffff',
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
    })

    locked_cell_format = workbook.add_format({
        'locked': True,
        'bg_color': '#f1f5f9',
        'font_color': '#475569',
        'border': 1,
        'valign': 'top',
    })

    unlocked_cell_format = workbook.add_format({
        'locked': False,
        'bg_color': '#ffffff',
        'font_color': '#0f172a',
        'border': 1,
        'valign': 'top',
    })

    unlocked_year_format = workbook.add_format({
        'locked': False,
        'bg_color': '#ffffff',
        'font_color': '#0f172a',
        'border': 1,
        'align': 'center',
        'valign': 'top',
    })

    # Sheet 1: Member Feedback
    ws_feedback = workbook.add_worksheet('Member Feedback')
    ws_feedback.protect('', {
        'select_locked_cells': True,
        'select_unlocked_cells': True,
        'format_cells': False,
        'format_columns': False,
        'format_rows': False,
        'insert_columns': False,
        'insert_rows': False,
        'insert_hyperlinks': False,
        'delete_columns': False,
        'delete_rows': False,
        'sort': True,
        'autofilter': True,
        'pivot_tables': False,
    })

    headers = [
        'organisation_id',
        'organisation_name',
        'year',
        'achievements',
        'growth_areas',
        'general_message',
        'language',
    ]

    for col_idx, header in enumerate(headers):
        ws_feedback.write(0, col_idx, header, header_format)

    # Column widths
    ws_feedback.set_column('A:A', 16)  # organisation_id
    ws_feedback.set_column('B:B', 36)  # organisation_name
    ws_feedback.set_column('C:C', 12)  # year
    ws_feedback.set_column('D:D', 45)  # achievements
    ws_feedback.set_column('E:E', 45)  # growth_areas
    ws_feedback.set_column('F:F', 45)  # general_message
    ws_feedback.set_column('G:G', 12)  # language

    row = 1
    for org in organisations:
        ws_feedback.write(row, 0, org.id, locked_cell_format)
        ws_feedback.write(row, 1, org.name or '', locked_cell_format)
        ws_feedback.write(row, 2, year, unlocked_year_format)
        ws_feedback.write(row, 3, '', unlocked_cell_format)
        ws_feedback.write(row, 4, '', unlocked_cell_format)
        ws_feedback.write(row, 5, '', unlocked_cell_format)
        ws_feedback.write(row, 6, 'en', unlocked_cell_format)
        row += 1

    # Sheet 2: Instructions & Examples
    ws_instructions = workbook.add_worksheet('Instructions & Examples')
    instr_header_format = workbook.add_format({
        'bold': True,
        'font_size': 14,
        'font_color': '#0f172a',
    })
    instr_sub_format = workbook.add_format({
        'bold': True,
        'font_size': 11,
        'font_color': '#334155',
    })
    instr_text_format = workbook.add_format({
        'font_size': 10,
        'font_color': '#475569',
        'text_wrap': True,
    })
    code_format = workbook.add_format({
        'font_name': 'Courier New',
        'font_size': 10,
        'bg_color': '#f8fafc',
        'border': 1,
    })

    ws_instructions.set_column('A:A', 25)
    ws_instructions.set_column('B:B', 70)

    ws_instructions.write(
        'A1',
        'ISCO Annual Member Feedback Import Guidelines',
        instr_header_format,
    )
    ws_instructions.write('A3', 'Column', header_format)
    ws_instructions.write('B3', 'Description & Rules', header_format)

    rules = [
        (
            'organisation_id',
            'LOCKED. Unique numerical ID of member in ISCO. Do not edit.',
        ),
        (
            'organisation_name',
            'LOCKED. Full legal name of member organisation. Do not edit.',
        ),
        (
            'year',
            'EDITABLE. Target survey year. Defaults to template year.',
        ),
        (
            'achievements',
            'EDITABLE. Milestones summary, combined into achievements.',
        ),
        (
            'growth_areas',
            'EDITABLE. Focus areas summary, combined into growth areas.',
        ),
        (
            'general_message',
            'EDITABLE (Optional). General message fallback.',
        ),
        (
            'language',
            'EDITABLE. ISO 2-letter language code (e.g. "en"). Default "en".',
        ),
    ]

    for idx, (col_name, desc) in enumerate(rules, start=4):
        ws_instructions.write(f'A{idx}', col_name, code_format)
        ws_instructions.write(f'B{idx}', desc, instr_text_format)

    ws_instructions.write('A14', 'Example Synthesis Output', instr_sub_format)
    sample_text = (
        'When achievements and growth areas are provided:\n\n'
        '**Achievements:**\n'
        'Progress in direct cocoa sourcing reaching 85% traceability.\n\n'
        '**Growth area:**\n'
        'Child labour monitoring and remediation coverage needs expansion.'
    )
    ws_instructions.write('B14', sample_text, instr_text_format)

    workbook.close()
    output.seek(0)
    return output


def synthesize_feedback_message(
    achievements: Optional[str] = None,
    growth_areas: Optional[str] = None,
    general_message: Optional[str] = None,
) -> str:
    """
    Synthesizes feedback fields into standard markdown format:
    If achievements or growth_areas are present, formats as:
    **Achievements:**
    {achievements}

    **Growth area:**
    {growth_areas}

    Otherwise falls back to general_message.
    """
    achieve_clean = (achievements or '').strip()
    growth_clean = (growth_areas or '').strip()
    general_clean = (general_message or '').strip()

    parts = []
    if achieve_clean:
        parts.append(f"**Achievements:**\n{achieve_clean}")
    if growth_clean:
        parts.append(f"**Growth area:**\n{growth_clean}")

    if parts:
        return "\n\n".join(parts)
    return general_clean


def _clean_str(val: Any) -> Optional[str]:
    if pd.isna(val) or val is None:
        return None
    s = str(val).strip()
    return s if s else None


def _clean_int(val: Any) -> Optional[int]:
    if pd.isna(val) or val is None:
        return None
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None


def parse_and_import_feedback_file(
    file_contents: bytes,
    filename: str,
    session: Session,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """
    Parses an uploaded .xlsx or .csv feedback spreadsheet, resolves
    member organisations, synthesizes markdown messages, and upserts
    into member_message table.
    """
    stream = BytesIO(file_contents)
    is_csv = filename.lower().endswith(".csv")

    if is_csv:
        df = pd.read_csv(stream)
    else:
        xls = pd.ExcelFile(stream)
        target_sheet = (
            "Member Feedback" if "Member Feedback" in xls.sheet_names else 0
        )
        df = pd.read_excel(xls, sheet_name=target_sheet)

    # Standardize column headers (lowercased, stripped)
    df.columns = [str(c).strip().lower() for c in df.columns]

    errors: List[str] = []
    imported = 0
    total_rows = 0

    for idx, row in df.iterrows():
        row_num = idx + 2  # 1-based, accounting for header row
        org_id = _clean_int(row.get("organisation_id"))
        org_code = _clean_str(row.get("organisation_code"))
        org_name = _clean_str(row.get("organisation_name"))
        year = _clean_int(row.get("year"))
        achievements = _clean_str(row.get("achievements"))
        growth_areas = _clean_str(row.get("growth_areas"))
        general_message = _clean_str(row.get("general_message"))
        language = (_clean_str(row.get("language")) or "en").lower()

        # If row has no message content whatsoever, skip it
        if not achievements and not growth_areas and not general_message:
            continue

        total_rows += 1

        # Resolve organisation
        org = None
        if org_id is not None:
            org = session.query(Organisation).filter(
                Organisation.id == org_id
            ).first()

        if not org and org_code:
            org = session.query(Organisation).filter(
                Organisation.code == org_code
            ).first()

        if not org and org_name:
            org = session.query(Organisation).filter(
                Organisation.name.ilike(org_name)
            ).first()

        if not org:
            errors.append(
                f"Row {row_num}: Could not resolve organisation "
                f"(id={org_id}, code={org_code}, name='{org_name}')"
            )
            continue

        if not year or year < 2000 or year > 2100:
            errors.append(
                f"Row {row_num}: Invalid or missing monitoring year ({year})"
            )
            continue

        message_content = synthesize_feedback_message(
            achievements=achievements,
            growth_areas=growth_areas,
            general_message=general_message,
        )

        if not message_content:
            continue

        translations: List[dict] = []
        if language != "en":
            translations = [
                {"language": language, "message": message_content}
            ]

        if not dry_run:
            existing_msg = session.query(MemberMessage).filter(
                MemberMessage.organisation == org.id,
                MemberMessage.year == year,
            ).first()

            if existing_msg:
                existing_msg.message = message_content
                if translations:
                    existing_msg.translations = translations
            else:
                new_msg = MemberMessage(
                    organisation=org.id,
                    year=year,
                    message=message_content,
                    translations=translations,
                )
                session.add(new_msg)

        imported += 1

    if not dry_run and imported > 0:
        session.commit()

    return {
        "status": "success",
        "dry_run": dry_run,
        "total_rows": total_rows,
        "imported": imported,
        "errors": errors,
    }
