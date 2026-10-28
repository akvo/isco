# Member Reporting Back Dashboard ("Dashboard Member X") — Complete Specification (HLD, LLD & Spec)

> **Document Scope**: Dedicated specification covering strictly the **"Dashboard Member X"** sheet from `5_Template DUMMY_Individual_reporting_back_ISCO_GISCO.xlsx`.  
> **Audience**: GISCO Secretariat (Dr. Ulrike Joras), Platform Management (Joy Ghosh @ Akvo), Evaluators (Hilde Geens @ c-lever.org), Engineering & QA Team.  
> **Status**: Approved & Aligned with Stakeholder Feedback (Google Docs Export Ready)  

---

# Part 1: High-Level Design (HLD)

## 1. Executive Summary & Purpose
The **Member Reporting Back Dashboard** digitizes the "Dashboard Member X" reporting sheet into a live, interactive portal in the ISCO web application. Member companies can monitor their 3-year sustainability progress (2022–2024) across 4 challenges and compare their performance against peer group benchmarks within **GISCO** and across all **ISCO** platforms.

## 2. Dashboard Visual Wireframe
```text
+--------------------------------------------------------------------------------------------------------------------+
| ISCO PLATFORM                                                      [Logged in: Chocolatier AG (member_user)] [Logout]
+--------------------------------------------------------------------------------------------------------------------+
|  MEMBER REPORTING BACK DASHBOARD                                                                                   |
+--------------------------------------------------------------------------------------------------------------------+
|                                                                                                                    |
|  Individual Reporting Back Dashboard – Chocolatier Example AG                                                      |
|  Overview of performance per challenge – Member vs Large Manufacturer average over time (2022 - 2024)              |
|                                                                                                                    |
|  [Peer Group: Large Manufacturer]                          [Benchmark Scope: GISCO & ISCO]                         |
|                                                                                                                    |
|  +--------------------------------------------------------------------------------------------------------------+  |
|  | CHALLENGE 1: TRANSPARENCY AND TRACEABILITY                                                                   |  |
|  |                                                                                                              |  |
|  |  [ Chart 1.1: Sourced Directly (Global) ]         [ Chart 1.2: Traceable to Farm Level (Global) ]            |  |
|  |   100% |        /--o Member: 48.5%                 100% |               o Member: 47.9%                      |  |
|  |        |  o----/                                        |              /                                     |  |
|  |    50% |  ......o--o ISCO Avg: 46.5%                50% |   o----.....o  ISCO Avg: 46.7%                    |  |
|  |        |  ---------o GISCO Avg: 49.0%                   |  /--------o    GISCO Avg: 45.0%                    |  |
|  |     0% +---+----+----+                               0% +----+----+----+                                     |  |
|  |        '22 '23  '24                                     '22  '23  '24                                        |  |
|  |   Year   Member  ISCO Avg  GISCO Avg               Year   Member  ISCO Avg  GISCO Avg                        |  |
|  |   2022   34.2%    36.4%     37.0%                  2022   26.3%    28.6%     27.0%                         |  |
|  |   2023   70.6%    70.0%     65.0%                  2023   29.8%    36.3%     32.0%                         |  |
|  |   2024   48.5%    46.5%     49.0%                  2024   47.9%    46.7%     45.0%                         |  |
|  +--------------------------------------------------------------------------------------------------------------+  |
|                                                                                                                    |
|  +--------------------------------------------------------------------------------------------------------------+  |
|  | CHALLENGE 2: DEFORESTATION                                                                                   |  |
|  |  [ Chart 2.1: Deforestation-Free Cocoa (Global) ]                                                            |  |
|  +--------------------------------------------------------------------------------------------------------------+  |
|                                                                                                                    |
|  +--------------------------------------------------------------------------------------------------------------+  |
|  | CHALLENGE 3: LIVING INCOME                                                                                   |  |
|  |  [ Chart 3.1: LI Gap Measured (Global) ]           [ Chart 3.2: LI Strategy Implemented (Global) ]          |  |
|  +--------------------------------------------------------------------------------------------------------------+  |
|                                                                                                                    |
|  +--------------------------------------------------------------------------------------------------------------+  |
|  | CHALLENGE 4: CHILD LABOUR (West Africa)                                                                      |  |
|  |  [ Chart 4.1: CLMRS Coverage ]                     [ Chart 4.2: Child Labour Cases Identified (!) ]          |  |
|  |  [ Chart 4.3: Remediation Support Received ]       [ Chart 4.4: 2-Follow-Up Visits Received ]                |  |
|  +--------------------------------------------------------------------------------------------------------------+  |
+--------------------------------------------------------------------------------------------------------------------+
```

## 3. Harmonized Peer Groups
Members are automatically mapped to one of 4 harmonized peer groups based on their database `member_type`:
- **Trader/Processor**: International traders and processors (`Trader GISCO`, `FRISCO-trader`, `DISCO traders`, `Trader SWISSCO`).
- **Large Manufacturer**: Multinational manufacturers and industry brands (`Industry`, `Big Industry`, `DISCO - Large Manufacturers`).
- **SME**: Small and medium enterprises (`GISCO small industry`, `SWISSCO SME`, `DISCO small manufacturers`, `Beyond Chocolate Small industry`).
- **Retail**: Supermarkets and retail chains (`Retail GISCO`, `Retail SWISSCO`, `Retail FRISCO`, `Retail DISCO`, `Retail BC`).

## 4. The 9 Core Indicators (Mapped to Survey Questions)
*(In local development databases and active rounds, questions reside under **Form 7 (Member Questionnaire)**; in production, `MEMBER_SURVEY = [1, 7]`)*
1. **Sourced Directly**: Form 7, Group 90, `ID86` [%] | `chart_type: "line"`
2. **Traceable to Farm Level**: Form 7, Group 90, `ID840 + ID841` [%] | `chart_type: "line"`
3. **Deforestation-Free Cocoa**: Form 7, Group 15, `ID851` [%] | `chart_type: "line"`
4. **Living Income Gap Measured**: Form 7, Supplier Repeats, `SUM(ID1216) / ID842` [Ratio] | `chart_type: "line"`
5. **Living Income Strategy Implemented**: Form 7, Supplier Repeats, `SUM(ID847) / ID842` [Ratio] | `chart_type: "line"`
6. **CLMRS Coverage (West Africa)**: Form 7, CLMRS Group, `ID575 / ID842` [Ratio] | `chart_type: "line"`
7. **Child Labour Cases Identified (West Africa)**: Form 7, `ID577 / ID873` [Ratio] *(Lower is better)* | `chart_type: "line"`
8. **Remediation Support Provided (West Africa)**: Form 7, `ID579 / ID577` [Ratio] | `chart_type: "line"`
9. **2-Follow-Up Visits Provided (West Africa)**: Form 7, `ID874 / ID577` [Ratio] | `chart_type: "line"`

---

# Part 2: Low-Level Design (LLD)

## 1. Database Schema
- **`peer_group`**: `id`, `name`, `code`, `description`, `created`.
- **`peer_group_member_type`**: `id`, `peer_group_id` (FK), `member_type_id` (FK), `isco_scope`.

## 2. API Contract: `GET /api/visualization/individual-dashboard`
- **Parameters**: `organisation_id` (optional, restricted to `secretariat_admin`), `isco_id` (optional, default `1`).
- **Response**:
  ```json
  {
    "organisation": {
      "id": 45,
      "name": "Chocolatier Example AG",
      "peer_group": {
        "id": 2,
        "code": "large_manufacturer",
        "name": "Large Manufacturer"
      }
    },
    "years": [2022, 2023, 2024],
    "challenges": [
      {
        "id": "transparency_and_traceability",
        "name": "Transparency and traceability",
        "indicators": [
          {
            "id": "sourced_directly",
            "name": "Share of cocoa sourced directly",
            "country": "Global",
            "unit": "percentage",
            "chart_type": "line",
            "higher_is_better": true,
            "series": [
              { "year": 2022, "member": 0.3422, "isco_avg": 0.3640, "gisco_avg": 0.3700 },
              { "year": 2023, "member": 0.7056, "isco_avg": 0.7000, "gisco_avg": 0.6500 },
              { "year": 2024, "member": 0.4854, "isco_avg": 0.4650, "gisco_avg": 0.4900 }
            ]
          }
        ]
      }
    ]
  }
  ```
- **Performance**: In-memory `TTLCache` (1-hour TTL) stores computed peer group cohort averages. Repeated requests respond in `< 50ms`.
- **Configurable Member Self-Exclusion**: Setting `exclude_current_member_from_average` (default `false`) allows dynamic $O(1)$ subtraction of caller's submitted data from the cached cohort average if requested by GISCO.

## 3. Frontend Component Architecture
- React 17 with **`akvo-charts`** (`Line` component powered by Apache ECharts).
- Blue solid line (`#1890ff`) for Member, Orange dashed line (`#fa8c16`) for ISCO Avg, Green dotted line (`#52c41a`) for GISCO Avg.
- Graceful null rendering for missing survey years (renders as gaps rather than breaking the line).

---

# Part 3: Feature Specification & Estimation

## 1. User Stories & Acceptance Criteria
- **US-01**: Member logs in and sees their 9 line charts comparing 2022–2024 trends against ISCO and GISCO averages for their assigned peer group.
- **US-02**: Member peer group is locked and automatically determined by their database classification; static badge displayed.
- **US-03**: Secretariat Admin can select any member organisation from a dropdown switcher to inspect their reporting dashboard and mapped peer group.
- **US-04**: Missing submission years render as disconnected gaps without breaking chart display.

## 2. Granular Task Estimation Breakdown (1 Dev, 52.0 Hours / ~7.4 Days)

- **Capacity**: 1 Developer @ 7 productive hours/day, 5 days/week.
- **Buffer**: Each task includes automated testing (≥80% gate) plus a **+1.0h to +2.0h buffer for manual browser QA and edge cases**.
- **Decoupled QA**: Each task can be tested and verified independently without waiting for the full UI.

| Task ID | Task Description | Dev (Impl) | Automated Tests | QA & +1h Buffer | Total | Independent QA Criteria |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **TASK-01** | **Harmonized Peer Groups DB & Seeder** | 3.0h | 1.5h | 2.0h | **6.5h (~0.9d)** | Run migration upgrade/downgrade; verify 4 peer groups seeded in database. |
| **TASK-02** | **Indicator Mapping & AST Formula Evaluator** | 3.5h | 2.0h | 2.0h | **7.5h (~1.1d)** | Test formula parser against mock survey answers, zero-division, groupings, and repeat groups. |
| **TASK-03** | **Benchmark Aggregator, Self-Exclusion & TTLCache** | 3.5h | 2.0h | 2.0h | **7.5h (~1.1d)** | Compare computed ISCO/GISCO averages against reference values from Excel template with/without exclusion toggle. |
| **TASK-04** | **REST API Endpoint & Multi-Tenant RBAC** | 3.0h | 2.0h | 1.5h | **6.5h (~0.9d)** | Test via Swagger UI (`/docs`): RBAC tenant isolation (403), admin org switcher, `<50ms` cache. |
| **TASK-05** | **Frontend Dashboard Page Shell & Static Badge** | 2.5h | 1.5h | 1.5h | **5.5h (~0.8d)** | Browser test: `/dashboard` page layout, static peer group badge, Secretariat switcher, loading states. |
| **TASK-06** | **9 Multi-Line Charts via `akvo-charts` & Tables** | 4.5h | 2.0h | 2.5h | **9.0h (~1.3d)** | Visual test: `akvo-charts` line charts, colors (blue/orange/green), missing year gaps, data tables. |
| **TASK-07** | **Docker Coverage Gate & Partner Demo Buffer** | 2.5h | 1.5h | 5.5h | **9.5h (~1.4d)** | Run `./dc.sh exec backend ./test.sh` (≥80% gate), linting, demo walkthrough with Joy & Dr. Joras. |
| **TOTAL** | **Full Feature Delivery ("Dashboard Member X")** | **22.5h** | **12.5h** | **17.0h** | **52.0h** | **~7.4 Working Days (1.5 Weeks)** |

### Optimistic vs. Calibrated Buffered Plan Comparison

| Component | Optimistic ("Vibe Coding") | Calibrated Buffered Plan | Difference (Buffer) | Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **Core Dev Implementation** | 16.5h | 22.5h | +6.0h | Accounts for real-world AST edge cases, repeat group handling, and responsive styling. |
| **Automated Testing (TEA)** | 7.5h | 12.5h | +5.0h | Guarantees meeting the strict ≥80% test coverage gate inside Docker (`./dc.sh`). |
| **Manual QA & Verification** | 4.0h | 11.5h | +7.5h | Adds +1.0h to +2.0h per task for manual browser inspection and Excel reconciliation. |
| **Partner Review Reserve** | 0.0h | 5.5h | +5.5h | Explicit buffer for review demos with GISCO/Akvo and requested formula adjustments. |
| **Total Effort** | **28.0h (~4.0 days)** | **52.0h (~7.4 days)** | **+24.0h (+3.4 days)** | **Provides realistic, stress-free delivery without risk of scope or deadline slip.** |

## 3. Deterministic Verification Commands
```bash
./dc.sh exec backend pytest tests/test_visualization.py -v
./dc.sh exec backend flake8
./dc.sh exec frontend yarn test
./dc.sh exec backend ./test.sh
```
