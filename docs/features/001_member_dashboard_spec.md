# Feature Specification: Member Reporting Back Dashboard ("Dashboard Member X")

> **Document Type**: Feature Specification  
> **Status**: `Approved` | **Author**: Tech Lead (`bmad-architect`)  
> **Scope**: **"Dashboard Member X" sheet** (Multi-Year Trend Dashboard: 9 Interactive Line Charts & Peer Group Selector)  
> **Reference HLD**: [docs/hld/member_dashboard_hld.md](docs/hld/member_dashboard_hld.md)  
> **Reference LLD**: [docs/lld/member_dashboard_lld.md](docs/lld/member_dashboard_lld.md)  

---

## 1. Feature Overview

The **Member Reporting Back Dashboard** digitizes the **"Dashboard Member X"** sheet from `5_Template DUMMY_Individual_reporting_back_ISCO_GISCO.xlsx`. 

It enables member organisations to view 9 interactive time-series line charts across four sustainability challenges (Transparency, Deforestation, Living Income, Child Labour) comparing their performance over time (2022, 2023, 2024) against GISCO and ISCO peer group benchmarks.

### User Stories:
1. **As a Member Admin / Member User**, I want to open `/dashboard` and immediately see my organisation's 3-year performance across the 9 indicators compared against my peer group's ISCO and GISCO averages.
2. **As a Member User**, I want to switch my benchmark peer group (e.g. from Large Manufacturer to SME or Trader/Processor) via a dropdown to compare our performance against different industry cohorts.
3. **As a Secretariat Admin**, I want to select any member organisation from a dropdown switcher to inspect their individual dashboard and assist with annual reporting discussions.

---

## 2. Touchpoint Files

| Operation | File Path | Purpose |
|---|---|---|
| `[CREATE]` | `/backend/models/peer_group.py` | SQLAlchemy models for `PeerGroup` and `PeerGroupMemberType`. |
| `[CREATE]` | `/backend/migrations/versions/YYYY-MM-DD_add_peer_group_tables.py` | Alembic migration to create tables and seed 4 harmonized peer groups. |
| `[CREATE]` | `/backend/source/config/visualization_mapping.json` | Declarative mapping of the 9 indicators to Form 1 & Form 7 questions. |
| `[CREATE]` | `/backend/services/visualization_service.py` | Calculation engine, TTLCache, and aggregation logic. |
| `[CREATE]` | `/backend/routes/visualization.py` | REST API endpoint `GET /api/visualization/individual-dashboard`. |
| `[CREATE]` | `/frontend/src/pages/member-dashboard/MemberDashboardPage.jsx` | Main dashboard page with peer group selector and 4 challenge sections. |
| `[CREATE]` | `/frontend/src/pages/member-dashboard/IndicatorLineChartCard.jsx` | Recharts multi-line chart component with compact yearly data table. |
| `[CREATE]` | `/backend/tests/test_visualization.py` | Unit & API integration tests verifying formulas, RBAC, and caching. |

---

## 3. The 9 Configured Indicators

| Challenge | Indicator Name | Survey Form | Question IDs | Formula |
| :--- | :--- | :--- | :--- | :--- |
| **Transparency & Traceability** | Share of cocoa sourced directly | Form 7 | `ID86` | `ID86` |
| **Transparency & Traceability** | Share of cocoa sourced traceable to farm level | Form 7 | `ID840, ID841` | `ID840 + ID841` |
| **Deforestation** | Share of deforestation free cocoa | Form 7 | `ID851` | `ID851` |
| **Living Income** | Share of households for which LI gap is measured | Form 7 | `ID1216, ID842` | `SUM(ID1216) / ID842` |
| **Living Income** | Share of households for which LI strategy is implemented | Form 7 | `ID847, ID842` | `SUM(ID847) / ID842` |
| **Child Labour** | Share of households covered by CLMRS | Form 7 | `ID575, ID842` | `ID575 / ID842` |
| **Child Labour** | Share of cases of child labour identified among children covered | Form 7 | `ID577, ID873` | `ID577 / ID873` *(Inverted: lower is better)* |
| **Child Labour** | Share of children who received support among those identified | Form 7 | `ID579, ID577` | `ID579 / ID577` |
| **Child Labour** | Share of children who received 2-follow-up visits among those identified | Form 7 | `ID874, ID577` | `ID874 / ID577` |

---

## 4. Vertical Slice Implementation Plan & Granular Estimation (1 Dev, 8 Days / 56.0 Hours)

### 4.1 Granular Task Estimation Breakdown (1 Dev @ 7 Hours/Day)

Each task is architected as an independent vertical slice with clear, decoupled QA criteria so QA does not have to wait for the complete UI to test backend logic, APIs, or database models.

| Task ID | Task Description & Subtasks | Vibe Coding (Dev) | Automated Testing | Manual QA & +1h Buffer | Total Buffered | Independent QA Verification Criteria |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **TASK-01** | **Harmonized Peer Groups Database & Seeder**<br>• Create `peer_group` and `peer_group_member_type` SQLAlchemy models<br>• Write Alembic migration script with table constraints and indexes<br>• Seed 4 harmonized peer groups linked to existing `member_type` tags (`Trader/Processor`, `Large Manufacturer`, `SME`, `Retail`)<br>• Unit test migration upgrade/downgrade and tag mappings | 3.0h | 1.5h | 2.0h | **6.5h (~0.9d)** | **Independent DB & Migration Gate**:<br>QA runs Alembic migration upgrade/downgrade, verifies tables via `psql`, and verifies seed data matches the 4 peer group categories. |
| **TASK-02** | **Declarative Indicator Config & AST Formula Evaluator**<br>• Author `/backend/source/config/visualization_mapping.json` for 9 indicators<br>• Implement safe formula evaluator for ratios, sums (`ID840 + ID841`), and repeat groups (`SUM(ID1216) / ID842`)<br>• Implement division-by-zero safeguards (return `null`/`N/A` without 500 error)<br>• Unit test formula parser with mock survey answers across edge cases | 3.5h | 2.0h | 2.0h | **7.5h (~1.1d)** | **Independent Engine Gate**:<br>QA runs unit tests with mock survey payloads. Verifies edge cases: missing answers, zero denominators, and repeat groups evaluated correctly. |
| **TASK-03** | **Peer Group Benchmark Aggregation Engine & In-Memory TTLCache**<br>• Query submitted answers for peer group member organisations across 2022–2024<br>• Calculate GISCO Average and ISCO Average benchmarks<br>• Implement minimum reporting cohort gate (>=3 reporting members per peer group/year to prevent de-anonymization)<br>• Build in-memory `TTLCache` (1-hour TTL) with thread-safe invalidation<br>• Integration tests verifying benchmark calculation & cache hits/misses | 4.0h | 2.5h | 2.0h | **8.5h (~1.2d)** | **Independent Benchmarks Gate**:<br>QA runs integration test script comparing computed ISCO/GISCO benchmarks against reference values from `5_Template DUMMY_Individual_reporting_back_ISCO_GISCO.xlsx`. |
| **TASK-04** | **Individual Dashboard REST API Endpoints & Multi-Tenant RBAC**<br>• Implement `GET /api/visualization/individual-dashboard` endpoint<br>• Implement `GET /api/visualization/peer-groups` dropdown options endpoint<br>• Enforce multi-tenant data isolation: `member_user` can only query own organisation<br>• Enable Secretariat Admin switcher (`?organisation_id={id}`)<br>• API integration tests verifying RBAC, 403 Forbidden on foreign org, and missing year handling (`null` data points) | 3.5h | 2.0h | 2.0h | **7.5h (~1.1d)** | **Independent API Gate**:<br>QA tests endpoints via Swagger UI (`/docs`) or curl: validates JSON structure, 403 on foreign orgs, admin org switching, and `< 50ms` response times. |
| **TASK-05** | **Frontend Dashboard Page Shell & Dynamic Controls**<br>• Create `/frontend/src/pages/member-dashboard/MemberDashboardPage.jsx`<br>• Add top header navigation link to `/dashboard`<br>• Implement Peer Group selection dropdown with automatic recalculation<br>• Implement Secretariat Organisation Switcher dropdown for `secretariat_admin`<br>• Handle loading spinners, error boundaries, and empty state alerts | 3.0h | 1.5h | 2.0h | **6.5h (~0.9d)** | **Independent UI Shell Gate**:<br>QA tests `/dashboard` page in browser: verifies header navigation, dropdown selections, loading states, and error alerts with mocked API responses. |
| **TASK-06** | **9 Recharts Multi-Line Charts & Accompanying Data Grids**<br>• Build `IndicatorLineChartCard.jsx` using Recharts `<LineChart>`<br>• Configure 3 distinct curves: Member (solid blue), ISCO Avg (dashed orange), GISCO Avg (dotted green)<br>• Handle inverted polarity for child labour identification (lower is better visual cues)<br>• Render non-connected gaps for missing years (`null` points)<br>• Build compact yearly data table below each chart (`Year`, `Member`, `ISCO Avg`, `GISCO Avg`)<br>• Responsive 2-column grid layout across 4 Challenge sections | 4.5h | 2.0h | 2.5h | **9.0h (~1.3d)** | **Independent Chart Visual Gate**:<br>QA verifies all 9 charts in browser: inspects line colors/strokes, tooltips, missing year gaps, inverted polarity formatting, and data table accuracy. |
| **TASK-07** | **E2E Integration, Docker Coverage Gate & Partner Feedback Buffer**<br>• Full regression run inside Docker (`./dc.sh exec backend ./test.sh`) enforcing **≥80% test coverage**<br>• Backend linting (`flake8`) and frontend linting/formatting (`yarn lint`, `yarn prettier-write`)<br>• Cross-browser testing (Chrome, Firefox, Safari) and responsive layout validation<br>• Walkthrough review demo with Joy Ghosh (Akvo) and Dr. Ulrike Joras (GISCO)<br>• Dedicated buffer for stakeholder adjustments and formula calibration | 2.5h | 1.5h | 6.5h | **10.5h (~1.5d)** | **Final Delivery Gate**:<br>Full `./dc.sh` regression passes (≥80% coverage), zero lint errors, stakeholder demo sign-off from Joy Ghosh and Dr. Ulrike Joras. |
| **TOTAL** | **Full Feature Delivery ("Dashboard Member X" Sheet)** | **24.0h** | **13.0h** | **19.0h** | **56.0h** | **8.0 Working Days (1.6 Sprints / Weeks)** |

---

### 4.2 Optimistic vs. Calibrated Buffered Plan Comparison

| Component | Optimistic ("Vibe Coding") | Calibrated Buffered Plan | Difference (Buffer) | Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **Core Dev Implementation** | 18.0h | 24.0h | +6.0h | Accounts for real-world AST edge cases, repeat group handling, and responsive styling. |
| **Automated Testing (TEA)** | 8.0h | 13.0h | +5.0h | Guarantees meeting the strict ≥80% test coverage gate inside Docker (`./dc.sh`). |
| **Manual QA & Verification** | 4.0h | 12.5h | +8.5h | Adds +1.0h to +2.0h per task for manual browser inspection and Excel reconciliation. |
| **Partner Review Reserve** | 0.0h | 6.5h | +6.5h | Explicit buffer for review demos with GISCO/Akvo and requested formula adjustments. |
| **Total Effort** | **30.0h (~4.3 days)** | **56.0h (8.0 days)** | **+26.0h (+3.7 days)** | **Provides realistic, stress-free delivery without risk of scope or deadline slip.** |

---

## 5. Verification Commands

All tests must be executed inside Docker via `./dc.sh`:
- **Backend Tests**: `./dc.sh exec backend pytest tests/test_visualization.py -v`
- **Backend Lint**: `./dc.sh exec backend flake8`
- **Frontend Tests**: `./dc.sh exec frontend yarn test`
- **Full Coverage Gate**: `./dc.sh exec backend ./test.sh` (Must achieve ≥80% test coverage)
