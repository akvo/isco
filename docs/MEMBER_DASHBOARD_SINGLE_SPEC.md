# Member Reporting Back Dashboard ("Dashboard Member X") — Complete Specification (HLD, LLD & Spec)

> **Document Scope**: Dedicated specification covering strictly the **"Dashboard Member X"** sheet from `5_Template DUMMY_Individual_reporting_back_ISCO_GISCO.xlsx`.  
> **Audience**: GISCO Secretariat (Dr. Ulrike Joras), Platform Management (Joy Ghosh @ Akvo), Evaluators (Hilde Geens @ c-lever.org), Engineering & QA Team.  
> **Status**: Ready for Google Docs Export & Review  

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
|  Overview of performance per challenge – Member vs ISCO average over time (2022 - 2024)                             |
|                                                                                                                    |
|  [Select Peer Group: (v) Large Manufacturer ]              [Benchmark Scope: (v) GISCO (Germany) ]                 |
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
- **Trader/Processor**: International traders and processors (`Trader GISCO`, `FRISCO-trader`, `DISCO traders`, `Trader SWISSCO`).
- **Large Manufacturer**: Multinational manufacturers and industry brands (`Industry`, `Big Industry`, `DISCO - Large Manufacturers`).
- **SME**: Small and medium enterprises (`GISCO small industry`, `SWISSCO SME`, `DISCO small manufacturers`, `Beyond Chocolate Small industry`).
- **Retail**: Supermarkets and retail chains (`Retail GISCO`, `Retail SWISSCO`, `Retail FRISCO`, `Retail DISCO`, `Retail BC`).

## 4. The 9 Core Indicators (Mapped to Survey Questions)
*(In local development databases and active rounds, questions reside under **Form 7 (Member Questionnaire)**; in production, `MEMBER_SURVEY = [1, 7]`)*
1. **Sourced Directly**: Form 7, Group 90, `ID86` [%]
2. **Traceable to Farm Level**: Form 7, Group 90, `ID840 + ID841` [%]
3. **Deforestation-Free Cocoa**: Form 7, Group 15, `ID851` [%]
4. **Living Income Gap Measured**: Form 7, Supplier Repeats, `SUM(ID1216) / ID842` [Ratio]
5. **Living Income Strategy Implemented**: Form 7, Supplier Repeats, `SUM(ID847) / ID842` [Ratio]
6. **CLMRS Coverage (West Africa)**: Form 7, CLMRS Group, `ID575 / ID842` [Ratio]
7. **Child Labour Cases Identified (West Africa)**: Form 7, `ID577 / ID873` [Ratio] *(Lower is better)*
8. **Remediation Support Provided (West Africa)**: Form 7, `ID579 / ID577` [Ratio]
9. **2-Follow-Up Visits Provided (West Africa)**: Form 7, `ID874 / ID577` [Ratio]

---

# Part 2: Low-Level Design (LLD)

## 1. Database Schema
- **`peer_group`**: `id`, `name`, `code`, `description`, `created`.
- **`peer_group_member_type`**: `id`, `peer_group_id` (FK), `member_type_id` (FK), `isco_scope`.

## 2. API Contract: `GET /api/visualization/individual-dashboard`
- **Parameters**: `peer_group_id` (optional), `organisation_id` (optional, admin only).
- **Response**: Organisation metadata, list of available peer groups, and an array of challenges containing indicators with time-series objects:
  ```json
  {
    "year": 2024,
    "member": 0.4854,
    "isco_avg": 0.4650,
    "gisco_avg": 0.4900
  }
  ```
- **Performance**: In-memory `TTLCache` (1-hour TTL) stores computed peer group averages so changing peer groups responds in `< 50ms`.

## 3. Frontend Component Architecture
- React 17 with Recharts line charts.
- Blue solid line for Member, Orange dashed line for ISCO Avg, Green dotted line for GISCO Avg.
- Graceful null rendering for missing survey years (renders as gaps rather than breaking the line).

---

# Part 3: Feature Specification & Estimation

## 1. User Stories & Acceptance Criteria
- **US-01**: Member logs in and sees their 9 line charts comparing 2022–2024 trends against ISCO and GISCO averages.
- **US-02**: Member can switch peer groups from a dropdown to immediately compare against another cohort.
- **US-03**: Secretariat Admin can select any member organisation to inspect their reporting dashboard.
- **US-04**: Missing submission years render as gaps without error.

## 2. Granular Task Estimation Breakdown (1 Dev, 8 Days / 56.0 Hours)

- **Capacity**: 1 Developer @ 7 productive hours/day, 5 days/week.
- **Buffer**: Each task includes automated testing (≥80% gate) plus a **+1.0h to +2.0h buffer for manual browser QA and edge cases**.
- **Decoupled QA**: Each task can be tested and verified independently without waiting for the full UI.

| Task ID | Task Description | Dev (Impl) | Automated Tests | QA & +1h Buffer | Total | Independent QA Criteria |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **TASK-01** | **Harmonized Peer Groups DB & Seeder** | 3.0h | 1.5h | 2.0h | **6.5h (~0.9d)** | Run migration upgrade/downgrade; verify 4 peer groups seeded in database. |
| **TASK-02** | **Indicator Mapping & AST Formula Evaluator** | 3.5h | 2.0h | 2.0h | **7.5h (~1.1d)** | Test formula parser against mock survey answers, zero-division, and repeat groups. |
| **TASK-03** | **Benchmark Aggregator & TTLCache** | 4.0h | 2.5h | 2.0h | **8.5h (~1.2d)** | Compare computed ISCO/GISCO averages against reference values from Excel template. |
| **TASK-04** | **REST API Endpoints & RBAC** | 3.5h | 2.0h | 2.0h | **7.5h (~1.1d)** | Test via Swagger UI (`/docs`): RBAC tenant isolation (403), admin org switcher, `<50ms` cache. |
| **TASK-05** | **Frontend Dashboard Page Shell & Dropdowns** | 3.0h | 1.5h | 2.0h | **6.5h (~0.9d)** | Browser test: `/dashboard` page layout, peer group dropdown, Secretariat switcher, loading states. |
| **TASK-06** | **9 Recharts Multi-Line Charts & Tables** | 4.5h | 2.0h | 2.5h | **9.0h (~1.3d)** | Visual test: 9 line charts, colors (blue/orange/green), missing year gaps, data tables. |
| **TASK-07** | **Docker Coverage Gate & Partner Demo Buffer** | 2.5h | 1.5h | 6.5h | **10.5h (~1.5d)** | Run `./dc.sh exec backend ./test.sh` (≥80% gate), linting, demo walkthrough with Joy & Dr. Joras. |
| **TOTAL** | **Full Feature Delivery ("Dashboard Member X")** | **24.0h** | **13.0h** | **19.0h** | **56.0h** | **8.0 Working Days (1.6 Weeks)** |

### Optimistic vs. Calibrated Buffered Plan Comparison

| Component | Optimistic ("Vibe Coding") | Calibrated Buffered Plan | Difference (Buffer) | Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **Core Dev Implementation** | 18.0h | 24.0h | +6.0h | Accounts for real-world AST edge cases, repeat group handling, and responsive styling. |
| **Automated Testing (TEA)** | 8.0h | 13.0h | +5.0h | Guarantees meeting the strict ≥80% test coverage gate inside Docker (`./dc.sh`). |
| **Manual QA & Verification** | 4.0h | 12.5h | +8.5h | Adds +1.0h to +2.0h per task for manual browser inspection and Excel reconciliation. |
| **Partner Review Reserve** | 0.0h | 6.5h | +6.5h | Explicit buffer for review demos with GISCO/Akvo and requested formula adjustments. |
| **Total Effort** | **30.0h (~4.3 days)** | **56.0h (8.0 days)** | **+26.0h (+3.7 days)** | **Provides realistic, stress-free delivery without risk of scope or deadline slip.** |

## 3. Deterministic Verification Commands
```bash
./dc.sh exec backend pytest tests/test_visualization.py -v
./dc.sh exec backend flake8
./dc.sh exec frontend yarn test
./dc.sh exec backend ./test.sh
```
