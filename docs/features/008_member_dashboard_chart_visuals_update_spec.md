# Feature Specification: Member Dashboard Chart Visuals & Indicators Update

> **Document Type**: Feature Specification (Phase 0: Planning & Estimation)  
> **Feature Number**: `008`  
> **Feature Name**: `member_dashboard_chart_visuals_update`  
> **Status**: `Ready for Review & Approval`  
> **Author**: System Architect (`bmad-architect`) / Developer (`bmad-dev`)  
> **Scope**: Member Reporting Back Dashboard (`/dashboard`)  
> **Source Document**: `agent_docs/tmp/updated_data points individual reporting back.xlsx`  
> **Reference Docs**: [docs/lld/member_dashboard_lld.md](/docs/lld/member_dashboard_lld.md), [docs/features/001_member_dashboard_spec.md](/docs/features/001_member_dashboard_spec.md), [docs/features/007_member_dashboard_chart_info_tooltips_spec.md](/docs/features/007_member_dashboard_chart_info_tooltips_spec.md)

---

## Overview

Based on the updated visual specification provided by ISCO in `updated_data points individual reporting back.xlsx`, the visual charts and indicator configurations displayed on the Member Reporting Back Dashboard require a systematic update.

The revised visual list introduces four major functional evolutions:
1. **Added Indicators**:
   - `Share of cocoa in your global supply chain that is certified and/or sourced under a company program` (Challenge: *Transparency and traceability*, formula: `ID899`).
   - `Share of cocoa sourced from agroforestry systems` (Challenge: *Agroforestry & Deforestation-free cocoa*, volume-weighted average across country repeat groups: `SUM_PRODUCT(ID878, ID1229) / ID1288`).
   - `Share of cocoa sourced globally under a living income strategy.` (Challenge: *Living income*, formula: `SUM(ID1289) / ID1288`, aggregated across repeat groups).
   - `Share of households for which the LI gap has been measured with more than 100% income of a living income benchmark` (Challenge: *Living income*, formula: `ID950 / ID845` or `ID1216`, indexed by data collection year `ID1215`).
2. **Removed Obsolete Indicators**:
   - `Share of households in direct supply chain for which a LI gap is measured` (`li_gap_measured`) has been explicitly marked as **"Take out!"** by ISCO and must be decommissioned from the dashboard.
3. **Renamed Challenge Pillars**:
   - Challenge pillar `"Deforestation"` is formally renamed to **`"Agroforestry & Deforestation-free cocoa"`** to reflect the inclusion of agroforestry practices alongside deforestation-free metrics.
4. **Enhanced Formula Evaluation Engine**:
   - Support volume-weighted multi-variable repeat group calculations (`SUM_PRODUCT(weight_col, val_col)`).
   - Support collection-year indexing for living income benchmark studies where survey data collection year (`ID1215`) differs from the submission round year (`Data.submitted`).

---

## Requirements Discovery (5W1H)

- **Who**:
  - **Member Organizations (`member_user`, `member_admin`)**: View their individualized sustainability metrics and peer group averages across the 12 updated sustainability indicators.
  - **ISCO & GISCO Secretariats (`secretariat_admin`)**: Inspect member performance, download templates, and analyze benchmark percentiles across the updated indicators.
- **What**: Incorporate the updated visual list into the dashboard visualization configuration, extend formula evaluation to support volume-weighted repeat groups and collection-year mapping, and deprecate obsolete metrics.
- **Where**:
  - **Configuration**: `/backend/source/config/visualization_mapping.json` (canonical indicator catalog).
  - **Ledger Mapping**: `/backend/source/config/local/id_mapping.json` (local/test database question ID resolution).
  - **Backend Evaluation Engine**:
    - `/backend/services/formula_evaluator.py`: Add AST support for `SUM_PRODUCT` or element-wise repeat vector operations.
    - `/backend/services/visualization_service.py` & `/backend/services/benchmark_service.py`: Support collection-year answer mapping and repeat group weighting.
  - **Frontend UI**:
    - `/frontend/src/pages/member-dashboard/MemberDashboardPage.jsx`: Renders the updated dynamic challenge sections and indicator cards automatically via API response.
    - `/frontend/src/static/ui-text.js`: Add German/French translations for new indicator names and descriptions.
- **When**: Incorporated into the active sprint.
- **Why**: ISCO partners refined their reporting framework to emphasize active living income strategies, agroforestry volumes, and certified sourcing over raw baseline measurements, requiring the dashboard visuals to maintain strict alignment with the latest monitoring methodology.
- **How**:
  - Update `visualization_mapping.json` to define the 12 active indicators.
  - Enhance `FormulaEvaluator` with safe element-wise multi-column repeat operations.
  - Verify local ID mappings and seed representative test submissions for new question IDs.
  - Validate with automated test suite and regression tests.

---

## Indicator Comparison & Mapping Specification

| # | Challenge Pillar | Indicator Name | Scope | Formula / Reference | Status | Notes & Changes |
|---|---|---|---|---|---|---|
| **1** | Transparency and traceability | Share of cocoa sourced directly | Global | `ID86` | Existing | Retained as-is. |
| **2** | Transparency and traceability | Share of cocoa sourced traceable to farm level | Global | `ID840 + ID841` | Existing | Retained as-is. |
| **3** | Transparency and traceability | Share of cocoa in your global supply chain that is certified and/or sourced under a company program | Global | `ID899` | **NEW** | Direct percentage sourcing under certification or company program. |
| **4** | Agroforestry & Deforestation-free cocoa | Share of deforestation free cocoa | Global | `ID851` | Existing | Moved under renamed challenge pillar. |
| **5** | Agroforestry & Deforestation-free cocoa | Share of cocoa sourced from agroforestry systems | Global | `SUM_PRODUCT(ID878, ID1229) / ID1288` | **NEW** | Volume-weighted average across country repeat groups (`ID878` country share * `ID1288` global volume * `ID1229` agroforestry share / global volume). |
| **6** | Living income | Share of households in direct supply chain for which a LI gap is measured | Global | `ID1216 / ID842` | **REMOVED** | **Decommissioned** per stakeholder instruction ("Take out!"). |
| **7** | Living income | Share of households in direct supply chain for which a LI strategy is implemented | Global | `SUM(ID847) / ID842` | Existing | Aggregated across supplier repeat groups. |
| **8** | Living income | Share of cocoa sourced globally under a living income strategy. | Global | `SUM(ID1289) / ID1288` | **NEW** | Volume share of cocoa sourced under LI strategy across all repeat groups. |
| **9** | Living income | Share of households for which the LI gap has been measured with more than 100% income of a living income benchmark | Global | `ID950 / ID845` | **NEW** | Benchmark compliance share. Mapped to data collection year (`ID1215`) rather than submission year. |
| **10** | Child Labour | Share of households in direct supply chain covered by CLMRS | West Africa | `ID575 / ID842` | Updated | Title updated to specify "direct supply chain". |
| **11** | Child Labour | Share of cases of child labour identified among children covered | West Africa | `ID577 / ID873` | Existing | Retained (`higher_is_better: false`). |
| **12** | Child Labour | Share of children who received support among those identified | West Africa | `ID579 / ID577` | Existing | Retained. |
| **13** | Child Labour | Share of children who received 2-follow-up visits among those identified in child labour | West Africa | `ID874 / ID577` | Existing | Retained. |

---

## Architecture Overview & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Member / Secretariat Admin
    participant FE as Frontend Dashboard
    participant API as /api/visualization/individual-dashboard
    participant VS as VisualizationService
    participant Resolver as SurveyIdResolver
    participant Eval as FormulaEvaluator (AST)
    participant DB as PostgreSQL (Data / Answer / Question)

    User->>FE: Open Member Dashboard
    FE->>API: GET /visualization/individual-dashboard?organisation_id=X
    API->>VS: get_individual_dashboard(org_id=X)
    VS->>DB: Query submitted survey answers (Data & Answer tables)
    VS->>Resolver: Resolve canonical IDs to local DB IDs
    loop Each Active Indicator in visualization_mapping.json (12 total)
        alt Standard Scalar / Simple Ratio Formula
            VS->>Eval: evaluate(formula, answers_for_year)
        alt Multi-Column Repeat Group (Agroforestry)
            VS->>Eval: evaluate_weighted_repeat(ID878, ID1229, ID1288, answers_for_year)
        alt Collection Year Remapping (Living Income Benchmark)
            VS->>Eval: evaluate_collection_year(ID950, ID845, year_col=ID1215, answers)
        end
        Eval-->>VS: Return computed metric value (or null)
        VS->>DB: Fetch precomputed peer group averages
    end
    VS-->>API: Return IndividualDashboardResponse (12 indicators across 4 challenges)
    API-->>FE: JSON Payload
    FE->>User: Render 12 indicator line chart cards grouped into 4 challenge sections
```

---

## 1. Backend Implementation

### 1.1 Configuration (`/backend/source/config/visualization_mapping.json`)
1. **Rename Challenge**: Update challenge `deforestation` title:
   ```json
   {
     "id": "agroforestry_and_deforestation",
     "name": "Agroforestry & Deforestation-free cocoa",
     "indicators": [ ... ]
   }
   ```
2. **Remove Obsolete Indicator**: Remove `li_gap_measured` (`ID1216 / ID842`).
3. **Add New Indicator 1**: `certified_company_program` under `transparency_and_traceability`:
   ```json
   {
     "id": "certified_company_program",
     "name": "Share of cocoa in your global supply chain that is certified and/or sourced under a company program",
     "country": "Global",
     "form_id": 7,
     "question_group": {
       "id": 90,
       "name": "Sourcing & Traceability"
     },
     "formula": "ID899",
     "numerator_ids": [899],
     "denominator_ids": [],
     "type": "percentage",
     "chart_type": "line",
     "higher_is_better": true,
     "description": "Proportion of global cocoa volume that is certified under standard systems or purchased through verified company programs."
   }
   ```
4. **Add New Indicator 2**: `cocoa_agroforestry_systems` under `agroforestry_and_deforestation`:
   ```json
   {
     "id": "cocoa_agroforestry_systems",
     "name": "Share of cocoa sourced from agroforestry systems",
     "country": "Global",
     "form_id": 7,
     "question_group": {
       "id": 121,
       "name": "Agroforestry & Environmental Sourcing"
     },
     "formula": "SUM_PRODUCT(ID878, ID1229) / ID1288",
     "calculation_type": "weighted_repeat",
     "weight_id": 878,
     "value_id": 1229,
     "scale_id": 1288,
     "numerator_ids": [878, 1229],
     "denominator_ids": [1288],
     "type": "percentage",
     "chart_type": "line",
     "higher_is_better": true,
     "description": "Volume-weighted percentage of cocoa sourced from validated agroforestry plots across producing countries."
   }
   ```
5. **Add New Indicator 3**: `li_strategy_volume_share` under `living_income`:
   ```json
   {
     "id": "li_strategy_volume_share",
     "name": "Share of cocoa sourced globally under a living income strategy.",
     "country": "Global",
     "form_id": 7,
     "question_group": {
       "id": "supplier_repeats",
       "name": "Supplier Repeat Group - Living Income"
     },
     "formula": "SUM(ID1289) / ID1288",
     "numerator_ids": [1289],
     "denominator_ids": [1288],
     "aggregate_repeats": true,
     "type": "ratio",
     "chart_type": "line",
     "higher_is_better": true,
     "description": "Total volume of cocoa sourced globally under an active living income strategy as a fraction of global sourcing."
   }
   ```
6. **Add New Indicator 4**: `li_benchmark_above_100` under `living_income`:
   ```json
   {
     "id": "li_benchmark_above_100",
     "name": "Share of households for which the LI gap has been measured with more than 100% income of a living income benchmark",
     "country": "Global",
     "form_id": 7,
     "question_group": {
       "id": "living_income_studies",
       "name": "Living Income Benchmark Studies"
     },
     "formula": "ID950 / ID845",
     "year_index_question": 1215,
     "numerator_ids": [950],
     "denominator_ids": [845],
     "type": "ratio",
     "chart_type": "line",
     "higher_is_better": true,
     "description": "Share of assessed farming households earning greater than 100% of the recognized living income benchmark, indexed by study collection year."
   }
   ```

### 1.2 Formula Evaluator Extension (`/backend/services/formula_evaluator.py`)
- Register `SUM_PRODUCT` in `ALLOWED_FUNCTIONS`:
  ```python
  ALLOWED_FUNCTIONS: Set[str] = {"SUM", "AVG", "MIN", "MAX", "COALESCE", "SUM_PRODUCT"}
  ```
- Implement `SUM_PRODUCT` evaluator:
  When two lists of repeat values are supplied, compute $\sum_{i} (\text{weights}[i] \times \text{values}[i])$ safely handling missing values and mismatched lengths.

### 1.3 Service Logic (`/backend/services/visualization_service.py`)
- Handle indicators configured with `year_index_question` (e.g. `ID1215`):
  If an indicator specifies `year_index_question`, remap the evaluated result to the collection year stored in that question answer rather than the submission year of the survey.
- Handle `aggregate_repeats` and `calculation_type: "weighted_repeat"` cleanly.

---

## 2. Frontend Implementation

### 2.1 Dynamic Dashboard Rendering
- The frontend architecture (`MemberDashboardPage.jsx`) dynamically maps through `dashboardData.challenges` and renders `IndicatorLineChartCard` components for every indicator returned by the API.
- Therefore, **zero structural React code changes** are required to render the new indicators. The grid layout automatically distributes the 12 indicators evenly across cards.

### 2.2 Localization & UI Text (`/frontend/src/static/ui-text.js`)
- Add localized names and fallback descriptions for German (`de`) and French (`fr`) for the newly added challenge title:
  - English: `"Agroforestry & Deforestation-free cocoa"`
  - German: `"Agroforstwirtschaft & entwaldungsfreier Kakao"`

---

## 3. Verification & Testing

### 3.1 Automated Tests
- **Backend Test Suite**:
  - `test_visualization_mapping_integrity`: Verify `visualization_mapping.json` contains exactly 12 active indicators, valid formulas, and no dangling references.
  - `test_formula_evaluator_sum_product`: Unit tests for `SUM_PRODUCT` AST evaluation with valid, empty, and mismatched repeat lists.
  - `test_collection_year_indexing`: Verify living income benchmark indicator correctly associates metrics with study year `ID1215`.
  - Full backend test run: `./dc.sh exec backend ./test.sh` (Must achieve ≥80% coverage and pass `flake8`).
- **Frontend Test Suite**:
  - Run `./dc.sh exec -e CI=true frontend yarn test src/pages/member-dashboard`.
  - Verify cards render without console warnings or layout shifts.

### 3.2 Manual Verification Steps
1. Start containers via `./dc.sh up -d`.
2. Log in as a Secretariat Admin (`admin@akvo.org`).
3. Navigate to `/dashboard` and switch between member organizations (e.g., Ferrero, Barry Callebaut, Akvo).
4. Verify all 4 challenge sections display:
   - *Transparency and traceability* (3 indicator cards)
   - *Agroforestry & Deforestation-free cocoa* (2 indicator cards)
   - *Living income* (3 indicator cards)
   - *Child Labour* (4 indicator cards)
5. Verify `li_gap_measured` no longer appears anywhere on the dashboard.
6. Verify line chart trends and peer group benchmark lines calculate correctly without NaN or division-by-zero crashes.

---

## 4. User Acceptance Criteria (UAC) & Technical Acceptance Criteria (TAC)

### User Acceptance Criteria (UAC)
- **UAC-08.1**: When a user views the Member Dashboard, exactly 4 challenge sections are displayed: *Transparency and traceability*, *Agroforestry & Deforestation-free cocoa*, *Living income*, and *Child Labour*.
- **UAC-08.2**: The obsolete indicator *Share of households in direct supply chain for which a LI gap is measured* does not appear on any member dashboard.
- **UAC-08.3**: The 4 new indicators are visible with appropriate titles, units, and interactive line charts:
  - Certified/company program cocoa share (`ID899`)
  - Cocoa sourced from agroforestry systems (`SUM_PRODUCT(ID878, ID1229) / ID1288`)
  - Cocoa sourced under living income strategy (`ID1289 / ID1288`)
  - Households >100% of living income benchmark (`ID950 / ID845` indexed by collection year `ID1215`)
- **UAC-08.4**: When switching peer groups or viewing GISCO/ISCO averages, benchmarks populate correctly for all 12 indicators.

### Technical Acceptance Criteria (TAC)
- **TAC-08.1**: `visualization_mapping.json` is updated with 12 valid indicators adhering to the existing JSON schema.
- **TAC-08.2**: `FormulaEvaluator` safely evaluates `SUM_PRODUCT` using AST node validation without allowing unwhitelisted function calls or code injection.
- **TAC-08.3**: `SurveyIdResolver` resolves all new question IDs (`899`, `1229`, `878`, `1288`, `1289`, `950`, `845`, `1215`) to local database IDs without errors.
- **TAC-08.4**: All backend tests pass with ≥80% test coverage, and `flake8` reports 0 lint errors.

---

## 5. Epic & Vibe Coding Estimation ⏱️

> Tasks are estimated using the 3-part Vibe Coding breakdown: **Vibe Coding (Dev)** + **Automated Testing** + **QA & Review** = **Total Est. Time**.
- **Confidence Level**: High
- **Dependencies**: None (builds on existing dashboard architecture)

| Task ID | Component & Description | Vibe Coding (Dev) | Automated Testing | QA & Review | Total Est. Time | Priority |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **TASK-08.1** | **Config & Schema Update**: Update `visualization_mapping.json` with 12 indicators, remove obsolete indicator, rename challenge to *Agroforestry & Deforestation-free cocoa*, and verify local `id_mapping.json` entries. | 25m | 15m | 10m | **50m (0.8h)** | P0 (Must Have) |
| **TASK-08.2** | **Formula Evaluator Extension**: Add AST support for `SUM_PRODUCT(weights, values)` in `FormulaEvaluator` with safe list multiplication, zero-division guards, and unit tests. | 35m | 25m | 15m | **75m (1.25h)** | P0 (Must Have) |
| **TASK-08.3** | **Service Logic & Year Remapping**: Update `VisualizationService` & `BenchmarkService` to handle collection year indexing (`ID1215`) and repeat group volume weighting. | 40m | 30m | 20m | **90m (1.5h)** | P0 (Must Have) |
| **TASK-08.4** | **Test Coverage & Seeding**: Add mock survey answers for new indicators in `test_visualization.py`, verify benchmark percentiles, and run full Pytest/Jest regression suites. | 30m | 35m | 15m | **80m (1.3h)** | P0 (Must Have) |
| **TASK-08.5** | **Frontend Text & Visual Verification**: Update challenge translations in `ui-text.js`, verify card rendering across member organizations in the browser, and document release notes. | 20m | 15m | 10m | **45m (0.75h)** | P1 (Should Have) |
| **TOTAL** | **Full Feature Delivery** | **2h 30m** | **2h 00m** | **1h 10m** | **5h 40m (~5.5h)** | |

---

## 🛑 HALT: Phase 0 Review & Approval Gate

In accordance with BMAD Phase 0 protocol:
- [x] 5W1H requirements analyzed from `updated_data points individual reporting back.xlsx`.
- [x] Feature Specification created at [docs/features/008_member_dashboard_chart_visuals_update_spec.md](/docs/features/008_member_dashboard_chart_visuals_update_spec.md).
- [x] All tasks estimated with 3-part Vibe Coding breakdown (total **~5.5 hours**).
- [ ] User review and approval.
