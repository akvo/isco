# Low-Level Design (LLD): Member Reporting Back Dashboard ("Dashboard Member X")

> **Document Type**: Low-Level Design (LLD)  
> **Target Audience**: Backend & Frontend Engineers, QA Engineers  
> **Scope**: **"Dashboard Member X" sheet** (Multi-Year Trend Dashboard: 9 Interactive Line Charts & Peer Group Selector)  
> **Status**: Approved for Implementation  

---

## 1. Architectural Overview & Component Hierarchy

The feature delivers an interactive time-series dashboard rendering the **9 sustainability indicators** across 4 challenges, comparing the logged-in Member against **GISCO** and **ISCO** peer group averages over years (2022, 2023, 2024).

```mermaid
flowchart TD
    subgraph Frontend["React 17 SPA (/frontend)"]
        Page["MemberDashboardPage"]
        Header["DashboardHeader (Peer Group Selector & Org Switcher)"]
        ChallengeSec["ChallengeSection (4 Challenges)"]
        ChartCard["IndicatorLineChartCard (9 Line Charts)"]
        DataGrid["CompactDataGrid (Year x Member x ISCO x GISCO)"]
        
        Page --> Header
        Page --> ChallengeSec
        ChallengeSec --> ChartCard
        ChartCard --> DataGrid
    end

    subgraph Backend["FastAPI Application (/backend)"]
        Router["/api/visualization/individual-dashboard"]
        Auth["JWT Middleware (verify_user)"]
        Service["VisualizationService"]
        Cache["In-Memory TTLCache (TTL: 1 hour)"]
        Engine["AggregationEngine & FormulaEvaluator"]
        Config["visualization_mapping.json"]
        
        Router --> Auth
        Auth --> Service
        Service --> Cache
        Service --> Engine
        Engine --> Config
    end

    subgraph Database["PostgreSQL"]
        PeerGroupTable[("peer_group & peer_group_member_type")]
        AnswerTable[("data & answer (Forms 1 & 7)")]
        OrgTable[("organisation & member_type")]
        
        Engine --> PeerGroupTable
        Engine --> AnswerTable
        Engine --> OrgTable
    end
```

---

## 2. Database Schema & Migration

### 2.1 SQLAlchemy Models (`/backend/models/peer_group.py`)

```python
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from db.connection import Base
from models.member_type import MemberType


class PeerGroup(Base):
    __tablename__ = "peer_group"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created = Column(DateTime, default=datetime.utcnow)

    member_types = relationship(
        "PeerGroupMemberType",
        backref="peer_group_detail",
        cascade="all, delete-orphan",
    )


class PeerGroupMemberType(Base):
    __tablename__ = "peer_group_member_type"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    peer_group_id = Column(Integer, ForeignKey("peer_group.id", ondelete="CASCADE"), nullable=False)
    member_type_id = Column(Integer, ForeignKey("member_type.id", ondelete="CASCADE"), nullable=False)
    isco_scope = Column(String, default="ALL", nullable=False)  # 'GISCO', 'ISCO', or 'ALL'

    member_type_detail = relationship(MemberType, backref="peer_group_associations")
```

### 2.2 Seeder Mapping
Alembic migration creates the tables and seeds 4 harmonized peer groups linked to existing `member_type` tags:
- `trader_processor`: Trader GISCO, FRISCO-trader, DISCO traders, Trader SWISSCO
- `large_manufacturer`: Industry, Big Industry, DISCO - Large Manufacturers
- `sme`: GISCO small industry, GISCO - Small Industry, SWISSCO SME, Small Industry, DISCO small manufacturers, Beyond Chocolate Small industry
- `retail`: Retail GISCO, Retail SWISSCO, Retail FRISCO, Retail DISCO, Retail BC, DISCO - Retail

---

## 3. Declarative Configuration: `visualization_mapping.json`

**Path**: `/backend/source/config/visualization_mapping.json`

```json
{
  "challenges": [
    {
      "id": "transparency_and_traceability",
      "name": "Transparency and traceability",
      "indicators": [
        {
          "id": "sourced_directly",
          "name": "Share of cocoa sourced directly",
          "country": "Global",
          "form_id": 7,
          "question_group": { "id": 90, "name": "Sourcing & Traceability" },
          "formula": "ID86",
          "numerator_ids": [86],
          "denominator_ids": [],
          "type": "percentage",
          "higher_is_better": true
        },
        {
          "id": "sourced_traceable",
          "name": "Share of cocoa sourced traceable to farm level",
          "country": "Global",
          "form_id": 7,
          "question_group": { "id": 90, "name": "Sourcing & Traceability" },
          "formula": "ID840 + ID841",
          "numerator_ids": [840, 841],
          "denominator_ids": [],
          "type": "percentage",
          "higher_is_better": true
        }
      ]
    },
    {
      "id": "deforestation",
      "name": "Deforestation",
      "indicators": [
        {
          "id": "deforestation_free",
          "name": "Share of deforestation free cocoa",
          "country": "Global",
          "form_id": 7,
          "question_group": { "id": 15, "name": "Deforestation-Free Supply Chains" },
          "formula": "ID851",
          "numerator_ids": [851],
          "denominator_ids": [],
          "type": "percentage",
          "higher_is_better": true
        }
      ]
    },
    {
      "id": "living_income",
      "name": "Living income",
      "indicators": [
        {
          "id": "li_gap_measured",
          "name": "Share of households in direct supply chain for which a LI gap is measured",
          "country": "Global",
          "form_id": 7,
          "question_group": { "id": "supplier_repeats", "name": "Supplier Repeat Group - Living Income" },
          "formula": "ID1216 / ID842",
          "numerator_ids": [1216],
          "denominator_ids": [842],
          "aggregate_repeats": true,
          "type": "ratio",
          "higher_is_better": true
        },
        {
          "id": "li_strategy_implemented",
          "name": "Share of households in direct supply chain for which a LI strategy is implemented",
          "country": "Global",
          "form_id": 7,
          "question_group": { "id": "supplier_repeats", "name": "Supplier Repeat Group - Living Income" },
          "formula": "ID847 / ID842",
          "numerator_ids": [847],
          "denominator_ids": [842],
          "aggregate_repeats": true,
          "type": "ratio",
          "higher_is_better": true
        }
      ]
    },
    {
      "id": "child_labour",
      "name": "Child Labour",
      "indicators": [
        {
          "id": "clmrs_covered",
          "name": "Share of households in supply chain covered by CLMRS",
          "country": "West Africa (Cameroon, Côte d'Ivoire, Ghana, Nigeria)",
          "form_id": 7,
          "question_group": { "id": "clmrs_monitoring", "name": "Child Labour Monitoring Systems (CLMRS)" },
          "formula": "ID575 / ID842",
          "numerator_ids": [575],
          "denominator_ids": [842],
          "type": "ratio",
          "higher_is_better": true
        },
        {
          "id": "child_labour_identified",
          "name": "Share of cases of child labour identified among children covered",
          "country": "West Africa (Cameroon, Côte d'Ivoire, Ghana, Nigeria)",
          "form_id": 7,
          "question_group": { "id": "clmrs_identification", "name": "Child Labour Identification & Remediation" },
          "formula": "ID577 / ID873",
          "numerator_ids": [577],
          "denominator_ids": [873],
          "type": "ratio",
          "higher_is_better": false
        },
        {
          "id": "support_received",
          "name": "Share of children who received support among those identified",
          "country": "West Africa (Cameroon, Côte d'Ivoire, Ghana, Nigeria)",
          "form_id": 7,
          "question_group": { "id": "clmrs_remediation", "name": "Remediation & Support Services" },
          "formula": "ID579 / ID577",
          "numerator_ids": [579],
          "denominator_ids": [577],
          "type": "ratio",
          "higher_is_better": true
        },
        {
          "id": "follow_up_visits",
          "name": "Share of children who received 2-follow-up visits among those identified in child labour",
          "country": "West Africa (Cameroon, Côte d'Ivoire, Ghana, Nigeria)",
          "form_id": 7,
          "question_group": { "id": "clmrs_followup", "name": "Monitoring & Follow-up Verification" },
          "formula": "ID874 / ID577",
          "numerator_ids": [874],
          "denominator_ids": [577],
          "type": "ratio",
          "higher_is_better": true
        }
      ]
    }
  ]
}
```

---

## 4. REST API Contract

### `GET /api/visualization/individual-dashboard`

**Query Parameters**:
- `organisation_id` (optional, integer): Target organisation. Restricted to `secretariat_admin`. Defaults to caller's organisation.
- `peer_group_id` (optional, integer): Target peer group for benchmarking. Defaults to organisation's mapped peer group.
- `isco_id` (optional, integer): Baseline ISCO scope (defaults to GISCO = 1).

**Success Response (`200 OK`)**:
```json
{
  "organisation": {
    "id": 45,
    "name": "Chocolatier Example AG",
    "selected_peer_group_id": 2,
    "available_peer_groups": [
      { "id": 1, "code": "trader_processor", "name": "Trader/Processor" },
      { "id": 2, "code": "large_manufacturer", "name": "Large Manufacturer" },
      { "id": 3, "code": "sme", "name": "SME" },
      { "id": 4, "code": "retail", "name": "Retail" }
    ]
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
          "higher_is_better": true,
          "series": [
            { "year": 2022, "member": 0.3422, "isco_avg": 0.3640, "gisco_avg": 0.3700 },
            { "year": 2023, "member": 0.7056, "isco_avg": 0.7000, "gisco_avg": 0.6500 },
            { "year": 2024, "member": 0.4854, "isco_avg": 0.4650, "gisco_avg": 0.4900 }
          ]
        },
        {
          "id": "sourced_traceable",
          "name": "Share of cocoa sourced traceable to farm level",
          "country": "Global",
          "unit": "percentage",
          "higher_is_better": true,
          "series": [
            { "year": 2022, "member": 0.2629, "isco_avg": 0.2860, "gisco_avg": 0.2700 },
            { "year": 2023, "member": 0.2979, "isco_avg": 0.3630, "gisco_avg": 0.3200 },
            { "year": 2024, "member": 0.4786, "isco_avg": 0.4670, "gisco_avg": 0.4500 }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. Calculation Logic & Caching Engine

1. **Formula Evaluation**:
   - `ID86`: direct lookup from submitted Answer.
   - `ID840 + ID841`: summation of direct and indirect traceable volumes.
   - `SUM(ID1216) / ID842`: sums numerator values across all repeat group entries, guarded against division-by-zero (`null` if denominator is 0).
2. **Missing Years**: If an organisation did not submit data for a given year (e.g. 2022), `member: null` is emitted. Recharts renders this as a non-connected gap.
3. **In-Memory TTL Caching**:
   - Peer group averages (`ISCO_Average` and `GISCO_Average`) are calculated across all submitted member answers and cached in an in-memory `TTLCache` (TTL: 1 hour).
   - Dynamic peer group dropdown requests hit cache in `< 50ms`.

---

## 6. Frontend UI Component Specifications

- **Page Entrypoint**: `/frontend/src/pages/member-dashboard/MemberDashboardPage.jsx`
- **Routing**: Accessible at `/dashboard` from the top header navigation.
- **Charts Library**: Recharts (`<ResponsiveContainer>`, `<LineChart>`, `<Line>`, `<XAxis>`, `<YAxis>`, `<Tooltip>`, `<Legend>`).
- **Styling**: ISCO palette:
  - 🔵 Member Line: `#1890ff` (solid stroke 3px, round dot)
  - 🟠 ISCO Average Line: `#fa8c16` (dashed stroke 2px, small square)
  - 🟢 GISCO Average Line: `#52c41a` (dotted stroke 2px, small triangle)
- **Data Grid**: Compact Ant Design HTML table below each chart with columns `Year`, `Member`, `ISCO Avg`, `GISCO Avg`.

---

## 7. Engineering Estimation Breakdown & Sprint Schedule (1 Dev, 8 Days / 56.0 Hours)

### 7.1 Estimation Methodology
- **Developer Capacity**: 1 full-stack engineer working **7 productive hours per day**, 5 days per week.
- **Buffer Allocation**: Each engineering task includes a **+1.0h to +2.0h buffer for manual browser QA and edge-case testing**, ensuring no task is under-estimated.
- **Dedicated Partner Review Reserve**: 6.5 hours (~1.0 working day) are explicitly reserved for review walkthroughs with GISCO and Akvo stakeholders.

### 7.2 Granular Task Estimation Breakdown

| Task ID | Task Description & Subtasks | Vibe Coding (Dev) | Automated Testing | Manual QA & +1h Buffer | Total Buffered | Working Days (7h/d) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **TASK-01** | **Harmonized Peer Groups Database & Seeder**<br>• Create `peer_group` and `peer_group_member_type` SQLAlchemy models<br>• Write Alembic migration script with table constraints and indexes<br>• Seed 4 harmonized peer groups linked to existing `member_type` tags (`Trader/Processor`, `Large Manufacturer`, `SME`, `Retail`)<br>• Write database unit tests verifying tag mapping and migration upgrade/downgrade | 3.0h | 1.5h | 2.0h | **6.5h** | ~0.9d |
| **TASK-02** | **Declarative Indicator Configuration & AST Formula Evaluator**<br>• Author `/backend/source/config/visualization_mapping.json` for 9 indicators with Question Groups & IDs<br>• Implement safe formula evaluator for ratios, sums (`ID840 + ID841`), and repeat groups (`SUM(ID1216) / ID842`)<br>• Implement division-by-zero safeguards (return `null`/`N/A` without 500 error)<br>• Unit test formula parser with mock survey answers across edge cases | 3.5h | 2.0h | 2.0h | **7.5h** | ~1.1d |
| **TASK-03** | **Peer Group Benchmark Aggregation Engine & In-Memory TTLCache**<br>• Implement query logic to extract submitted answers for peer group member organisations across 2022–2024<br>• Calculate GISCO Average and ISCO Average benchmarks<br>• Implement minimum reporting cohort gate (>=3 reporting members per peer group/year to prevent de-anonymization)<br>• Build in-memory `TTLCache` (1-hour TTL) with thread-safe invalidation<br>• Integration tests verifying benchmark calculation & cache hits/misses | 4.0h | 2.5h | 2.0h | **8.5h** | ~1.2d |
| **TASK-04** | **Individual Dashboard REST API Endpoints & Multi-Tenant RBAC**<br>• Implement `GET /api/visualization/individual-dashboard` endpoint<br>• Implement `GET /api/visualization/peer-groups` dropdown options endpoint<br>• Enforce multi-tenant data isolation: `member_user` can only query own organisation<br>• Enable Secretariat Admin switcher (`?organisation_id={id}`)<br>• API integration tests verifying RBAC, 403 Forbidden on foreign org, and missing year handling (`null` data points) | 3.5h | 2.0h | 2.0h | **7.5h** | ~1.1d |
| **TASK-05** | **Frontend Dashboard Page Shell & Dynamic Controls**<br>• Create `/frontend/src/pages/member-dashboard/MemberDashboardPage.jsx`<br>• Add top header navigation link to `/dashboard`<br>• Implement Peer Group selection dropdown with automatic recalculation<br>• Implement Secretariat Organisation Switcher dropdown for `secretariat_admin`<br>• Handle loading spinners, error boundaries, and empty state alerts | 3.0h | 1.5h | 2.0h | **6.5h** | ~0.9d |
| **TASK-06** | **9 Recharts Multi-Line Charts & Accompanying Data Grids**<br>• Build `IndicatorLineChartCard.jsx` using Recharts `<LineChart>`<br>• Configure 3 distinct curves: Member (solid blue), ISCO Avg (dashed orange), GISCO Avg (dotted green)<br>• Handle inverted polarity for child labour identification (lower is better visual cues)<br>• Render non-connected gaps for missing years (`null` points)<br>• Build compact yearly data table below each chart (`Year`, `Member`, `ISCO Avg`, `GISCO Avg`)<br>• Responsive 2-column grid layout across 4 Challenge sections | 4.5h | 2.0h | 2.5h | **9.0h** | ~1.3d |
| **TASK-07** | **E2E Integration, Docker Coverage Gate & Partner Feedback Buffer**<br>• Full regression run inside Docker (`./dc.sh exec backend ./test.sh`) enforcing **≥80% test coverage**<br>• Backend linting (`flake8`) and frontend linting/formatting (`yarn lint`, `yarn prettier-write`)<br>• Cross-browser testing (Chrome, Firefox, Safari) and responsive layout validation<br>• Walkthrough review demo with Joy Ghosh (Akvo) and Dr. Ulrike Joras (GISCO)<br>• Dedicated buffer for stakeholder adjustments and formula calibration | 2.5h | 1.5h | 6.5h | **10.5h** | ~1.5d |
| **TOTAL** | **Full Feature Delivery ("Dashboard Member X" Sheet)** | **24.0h** | **13.0h** | **19.0h** | **56.0h** | **8.0 Working Days** |

---

### 7.3 Optimistic vs. Calibrated Buffered Estimate Comparison

| Component | Optimistic ("Vibe Coding") | Calibrated Buffered Plan | Difference (Buffer) | Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **Core Dev Implementation** | 18.0h | 24.0h | +6.0h | Accounts for real-world AST edge cases, repeat group handling, and responsive styling. |
| **Automated Testing (TEA)** | 8.0h | 13.0h | +5.0h | Guarantees meeting the strict ≥80% test coverage gate inside Docker (`./dc.sh`). |
| **Manual QA & Verification** | 4.0h | 12.5h | +8.5h | Adds +1.0h to +2.0h per task for manual browser inspection and Excel reconciliation. |
| **Partner Review Reserve** | 0.0h | 6.5h | +6.5h | Explicit buffer for review demos with GISCO/Akvo and requested formula adjustments. |
| **Total Effort** | **30.0h (~4.3 days)** | **56.0h (8.0 days)** | **+26.0h (+3.7 days)** | **Provides realistic, stress-free delivery without risk of scope or deadline slip.** |

---

### 7.4 8-Day Delivery Gantt Schedule (1 Dev, 7h/day)

```mermaid
gantt
    title Member Dashboard ("Dashboard Member X") 8-Day Sprint Schedule (56h)
    dateFormat  YYYY-MM-DD
    section Day 1: Peer Groups & Models
    TASK-01 Peer Groups DB & Seeder              :done,    t1, 2026-11-02, 6.5h
    TASK-02 Formula Evaluator Setup              :active,  t2a, 2026-11-02, 0.5h
    section Day 2: Formula Engine
    TASK-02 AST Formulas & Repeat Groups         :         t2b, 2026-11-03, 7.0h
    section Day 3: Benchmarks & Cache
    TASK-03 Benchmark Aggregation Engine         :         t3a, 2026-11-04, 7.0h
    section Day 4: Cache & REST APIs
    TASK-03 TTLCache Finalization                :         t3b, 2026-11-05, 1.5h
    TASK-04 REST API Endpoints & RBAC            :         t4a, 2026-11-05, 5.5h
    section Day 5: APIs & UI Shell
    TASK-04 API Testing & RBAC Verification      :         t4b, 2026-11-06, 2.0h
    TASK-05 Frontend Dashboard Page & Controls   :         t5a, 2026-11-06, 5.0h
    section Day 6: UI Shell & Line Charts
    TASK-05 Dropdowns QA Verification            :         t5b, 2026-11-09, 1.5h
    TASK-06 9 Recharts Line Charts & Data Grids  :         t6a, 2026-11-09, 5.5h
    section Day 7: Line Charts & Coverage Gate
    TASK-06 Visual Polish & Missing Years QA     :         t6b, 2026-11-10, 3.5h
    TASK-07 Docker ≥80% Coverage Gate & Linting  :         t7a, 2026-11-10, 3.5h
    section Day 8: QA Sign-off & Partner Buffer
    TASK-07 Final Docker E2E & Browser QA        :         t7b, 2026-11-11, 2.0h
    RESERVE Partner Review Demo & Feedback Iteration :     res, 2026-11-11, 5.0h
```

