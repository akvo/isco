# Individual Reporting Back Dashboard

> [!NOTE]
> **Implementation Specification Update**:
> This document served as the foundational concept document. The finalized engineering design and delivery artifacts are now available in:

> - **High-Level Design (HLD)**: [docs/hld/member_dashboard_hld.md](docs/hld/member_dashboard_hld.md) (Executive & Partner Overview for Google Docs export)
> - **Low-Level Design (LLD)**: [docs/lld/member_dashboard_lld.md](docs/lld/member_dashboard_lld.md) (Technical & Code Architecture)
> - **Feature Specification**: [docs/features/001_member_dashboard_spec.md](docs/features/001_member_dashboard_spec.md) (Sprint & Test Implementation Spec)

## Overview

The "Individual Reporting Back Dashboard" is a visualization feature requested by partners to provide member organisations with a performance overview compared to ISCO and GISCO averages.

## Problem Statement

Members need a way to visualize their performance across various challenges (Transparency, Deforestation, Living Income, Child Labour) relative to industry averages over time.

## Target Users

- **Member Admins**: To monitor their own organisation's progress.
- **Secretariat Admins**: To understand aggregated performance and individual member contributions.

## Visualisation Structure

The dashboard is grouped by **Challenges**, each containing one or more **Indicators**. Each indicator is represented by a chart showing:

- **Member Performance**: The value for the specific organisation.
- **ISCO Average**: The average value across all ISCO members.
- **GISCO Average**: The global average.
- **Time Dimension**: Data is tracked over years (e.g., 2022, 2023, 2024).

## Configuration (Static Mapping)

The visualization logic relies on mapping specific Question IDs and Question Groups across Survey Forms to indicators.

### Indicator & Question Group Mapping Table

| Challenge | Indicator | Scope | Form | Question Group (ID & Name) | Question IDs & Description | Formula / Aggregation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Transparency & Traceability** | Share of cocoa sourced traceable to farm level | Global | Form 7 | Group 90: Sourcing & Traceability | • `ID840`: Direct cocoa volume traceable to farm/polygon<br>• `ID841`: Indirect cocoa volume traceable to farm/polygon | `ID840 + ID841` |
| **Transparency & Traceability** | Share of cocoa sourced directly | Global | Form 7 | Group 90: Sourcing & Traceability | • `ID86`: Direct sourcing volume / percentage | `ID86` |
| **Deforestation** | Share of deforestation free cocoa | Global | Form 7 | Group 15: Deforestation-Free Supply Chains | • `ID851`: Volume/share verified deforestation-free | `ID851` |
| **Living Income** | Share of households in direct supply chain for which a LI gap is measured | Global | Form 7 | Supplier Group (Repeats): Living Income Assessment | • `ID1216`: Households measured for LI gap in repeat group<br>• `ID842`: Total cocoa volume / direct households | `SUM(ID1216) / ID842` (across supplier repeats) |
| **Living Income** | Share of households in direct supply chain for which a LI strategy is implemented | Global | Form 7 | Supplier Group (Repeats): Living Income Assessment | • `ID847`: Households covered by LI strategy in repeat group<br>• `ID842`: Total cocoa volume / direct households | `SUM(ID847) / ID842` (across supplier repeats) |
| **Child Labour** | Share of households in supply chain covered by CLMRS | West Africa | Form 7 | Group: Child Labour Monitoring Systems (CLMRS) | • `ID575`: Households covered by CLMRS in West Africa<br>• `ID842`: Total direct supply chain households/volume | `ID575 / ID842` |
| **Child Labour** | Share of cases of child labour identified among children covered | West Africa | Form 7 | Group: Child Labour Identification & Remediation | • `ID577`: Identified child labour cases<br>• `ID873`: Total children monitored/covered under CLMRS | `ID577 / ID873` *(Inverted: lower is better)* |
| **Child Labour** | Share of children who received support among those identified | West Africa | Form 7 | Group: Remediation & Support Services | • `ID579`: Children provided remediation support<br>• `ID577`: Total identified child labour cases | `ID579 / ID577` |
| **Child Labour** | Share of children who received 2-follow-up visits among those identified | West Africa | Form 7 | Group: Monitoring & Follow-up Verification | • `ID874`: Identified children with >=2 follow-up visits<br>• `ID577`: Total identified child labour cases | `ID874 / ID577` |

## Technical Implementation (Draft)


### Backend
1. **Static Configuration Service**: A new service or utility to load the mapping (from a JSON/YAML file or a database table).
2. **Aggregation Engine**:
    - Fetch answers for the specified question IDs.
    - Calculate the values for the Member, ISCO Avg, and GISCO Avg.
    - Handle complex formulas (e.g., `(ID840 + ID841)`, `ID1216 / ID842`).
3. **API Endpoint**: `GET /api/visualization/individual-dashboard?member_id={id}&isco_id={isco_id}`
    - `isco_id`: Specifies the context for the "ISCO Average" (e.g., if a member belongs to both GISCO and DISCO).
4. **Raw Data Query Logic**: Instead of a static SQL view, the backend will dynamically query the `answer` table based on the Question IDs defined in the configuration. This ensures that the Raw Data Table stays in sync with any changes to the indicator mapping.

## Data Model & Query Strategy
The visualization engine will leverage the existing core models to aggregate data:

### Core Model Mapping
- **`Organisation`**: Used to filter by Member ID and group by ISCO type for averages.
- **`Data`**: Each dashboard entry represents a submission. We will use the `submitted` field to determine the **Year** of the data point.
- **`Answer`**: The source of the indicator values.
    - Numeric values will be extracted from `Answer.value`.
    - Options/Ratios will be calculated from `Answer.options` or `Answer.text` depending on the question type.
- **`Question`**: Used to identify the type of computation needed (e.g., handling repeat groups).

### Aggregation Logic
1. **Member Value**: Fetches `Answer` records linked to `Data` entries belonging to the requested `Organisation` for a specific `Year`.
2. **ISCO Average**: Aggregates `Answer` values from all organizations linked to the specified `isco_id` via the `OrganisationIsco` model for the target `Year`.
3. **GISCO Average**: A "Global" reference. In this system, it typically refers to the **GISCO (German Initiative on Sustainable Cocoa)** average as the baseline, or a global average across all participating ISCOs if configured as "All".
4. **Country Filtering**: For indicators marked as "West Africa" (e.g., Child Labour), the engine will apply a filter based on the `Answer` value of the "Country" identifier question within the relevant repeating group. If no country identifier exists, it will use the organization's primary operating region (if available in future models).

### Frontend
1. **Dashboard Component**: A new page or tab in the member profile/dashboard area.
2. **Raw Data Table**: An Ant Design `Table` component with searching and filtering capabilities. It will display the raw data source for the charts, including:
    - Challenge/Indicator Name
    - Question Name (from DB)
    - Raw Answer Value
    - Year of Submission
3. **Chart Library**: Integrate a charting library (e.g., `recharts` or `apexcharts`) if not already present.
4. **Data Fetching**: Use existing API patterns to fetch and display the visualization data.

## Dev/Test Environment Synchronization
To ensure development accuracy when the production questionnaire structure is not available locally:
1. **Schema Sync**: A utility to import the production questionnaire from a JSON schema, preserving types and rules while creating local autoincremented IDs.
2. **ID Resolver & Mapping**: A mapping layer that translates Production IDs (used in the static config) to Local/Test IDs. This ensures that the same configuration file works across all environments without collisions.
3. **Mock Data Generation**: A script to seed the local environment with synthetic answers for the production-mapped IDs, allowing for realistic chart rendering and testing.
4. **Environment Isolation**: These utilities are for development/test only and will not affect the production database.

## Implementation Timeline (Optimistic - 7 Days)
| Phase | Task | Effort (Days) |
|-------|------|---------------|
| **Research & Analysis**| Schema Sync & Mock Data Generator | 1.5 |
| **Backend Development** | Implement aggregation engine and formula evaluator | 2 |
| **API Integration** | Create visualization and raw data endpoints | 0.5 |
| **Frontend Development**| Build Charts and Raw Data Table components | 2 |
| **QA & Verification** | End-to-end verification and data cleanup | 1 |
| **External Review** | Partner review and final adjustments buffer | 2 |
| **Total** | | **9 Days** |

## Next Steps
1. **Validation**: Confirm the formulas for each indicator with the partner.
2. **Architecture Review**: Winston to finalize the data structure for the static config.
3. **Sprint Planning**: Bob to create stories and initialize the sprint.
