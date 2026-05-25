# Target/Indicator Survey Reporting Specification

Introduce target-reporting capability natively to the Survey Editor and main survey form/answers engine, replacing the static/seeder-based MVP roadmap configuration.

## I. Overview & Goal
- **Problem Statement**: Partners need to report targets and indicators dynamically. Currently, there is no dynamic configuration capability for target reporting. We want partners to build and configure target-reporting surveys dynamically using the Survey Editor.
- **Core Metric**: 100% of target/indicator reporting questionnaires built dynamically via UI.
- **Question Types**: **No new question type is needed.** The existing question types (such as `number` or `input`) will be utilized directly. When a survey has `target_survey` toggled on, any numeric or text questions in the survey will display target-reporting fields (defined target, reported target, achieved value, and narrative description) in the user interface.

## II. User Stories & Flows
- **User Personas**:
  - **Survey Editor**: Admin or Editor who designs surveys and defines targets for indicators.
  - **Partner Reporter**: User who submits reported targets and actual achievements.
- **User Journey / Flow**:
  1. **Trigger**: Survey Editor logs in, navigates to Survey Editor page, and creates/selects a survey.
  2. **Step 1 (Configuration)**: The Editor toggles "Target Survey" switch in Settings.
  3. **Step 2 (Question definition)**: Editor creates questions of type `number` or `input` inside question groups and defines a static target value (`target_value` on the question).
  4. **Step 3 (Answering)**: The Partner Reporter opens the Webform page for the published survey.
  5. **Step 4 (Form rendering)**: The form detects the survey has `target_survey = true` and renders for each question:
     - Target Indicator Display (read-only label showing the question's defined target from `Question.target_value`)
     - Achievement field (Input box for reported achievement value, saved to `target_value` on the answer)
     - Description/Narrative text field (Textarea for context, saved to `target_comment` on the answer)
  6. **Step 5 (Submission)**: Partner saves or submits. The answers payload containing `target_value` (achievement) and `target_comment` (description) is POSTed/PUTed to the backend.

## III. Requirements (Scope Guardrails)

### Must-Have
- `target_survey` boolean flag on the `Form` model.
- `target_value` float/numeric column on the `Question` model (predefined target set in editor).
- `target_value` float/numeric column on the `Answer` model (user-reported achievement value).
- `target_comment` text column on the `Answer` model (progress explanation).
- Survey Editor settings UI checkbox to mark a survey as a target survey.
- Form rendering in `WebformPage.jsx` / `akvo-react-form` dynamically rendering target inputs for target surveys.
- Data submission handles `target_value` (reported achievement) and `target_comment` (description).

### Nice-to-Have
- Auto-migrations of legacy roadmap schemas.

### Out of Scope
- Custom progress calculation formulas in the editor.

## IV. Architecture Design
- **Webform UI Rendering Layout**:
  When `target_survey` is enabled, the question renderer (e.g., `TypeNumber.jsx`) splits the layout into a three-column side-by-side layout:
  - Column 1: Defined Indicator Target (read-only, displays `target_value` from the question)
  - Column 2: Achievement/Actual value input box (editable, saved to `target_value` on the answer)
  - Column 3: Narrative description / comment field (editable, saved to `target_comment` on the answer)

- **Answer Data Storage**:
  To ensure perfect backward compatibility and prevent conflicts with existing text/comment fields, we will introduce new columns to store target goals and narrative descriptions:
  - `target_value` on `Question` table -> Defined target goal set by Admin (read-only on webform).
  - `target_value` on `Answer` table -> Reported achievement value submitted by partner.
  - `target_comment` on `Answer` table -> Progress narrative description / explanation.

- **Data Flow / Logic Flow**:
  ```mermaid
  sequenceDiagram
      participant FE as React Frontend
      participant BE as FastAPI Backend
      participant DB as PostgreSQL Database

      FE->>BE: GET /webform/{id}
      BE->>DB: Query Form & Target Survey Flag & Question Targets
      DB-->>BE: Form Data
      BE-->>FE: Webform Schema (with target_survey flag and predefined target_values)
      FE->>FE: Render Target, Actual, Description Fields Side-by-Side
      FE->>BE: POST/PUT /data/form/{id} (includes value, target_value, target_comment)
      BE->>DB: Save Answer (value, target_value, target_comment)
      DB-->>BE: Success
      BE-->>FE: Response Dict
  ```

- **Data Model changes**:
  - `form` table: `target_survey` (Boolean, default `False`)
  - `question` table: `target_value` (Float, nullable `True`)
  - `answer` table:
    - `target_value` (Float, nullable `True`)
    - `target_comment` (Text, nullable `True`)

## V. Acceptance Criteria
- **User Acceptance Criteria (UAC)**:
  - Given an Editor designs a survey, when they set `target_survey` to `true` and define target values for questions, then these are saved in the database.
  - Given a Reporter fills a target survey, when they save their responses, then target value, actual value, and description narrative are saved.
- **Technical Acceptance Criteria (TAC)**:
  - Alembic DB migration generated.
  - Zero impact on normal surveys (`target_survey = false` by default).

## VI. Edge Cases & Errors
- **Failures**: API submission failures fail closed with error notification showing validation warnings.
- **Empty States**: If a survey is newly marked as target, fields display placeholder inputs.
- **Boundary Conditions**: Null values are allowed for targets. If no target value is input, the backend sets it to `None`.

## VII. Analytics & Telemetry
- **Tracking Events**: Track when a target survey is created, and track submissions with target fields populated.
- **Success Metrics**: Number of dynamic target surveys successfully configured and submitted by partners.

## VIII. Rollout & Rollback Plan
- **Rollout Strategy**: Migrate schema and publish the frontend updates behind the feature flag or deploy directly since it is backward-compatible.
- **Rollback Plan**: In case of issues, disable the UI setting toggle for "Target Survey" or run Alembic downgrade.

## IX. Epic & Ballpark Estimation

### Epic: Target Survey Reporting
This epic encompasses database migrations, API changes to serialize and persist target flags/values, and UI updates in the Survey Editor and Webform rendering.

- **Component Breakdown**:
  - **DB Migration**: Generate Alembic migration script to add `target_survey` to `form` table, `target_value` to `question` table, and `target_value` + `target_comment` to `answer` table.
  - **Backend Models**: Update SQLAlchemy models (`Form`, `Question`, `Answer`) and Pydantic models.
  - **Backend CRUD & Routes**: Update CRUD and routes (`form.py`, `data.py`) to process target values.
  - **Survey Editor UI**: Add toggle checkbox in Form Settings panel, and target value input field to Question creation drawer.
  - **Webform UI**: Modify `WebformPage.jsx` and `akvo-react-form` fields to render Target/Actual/Description fields when loading target-reporting forms.
- **Complexity Assessment**: Medium
- **Ballpark Estimate**: 6.0 developer days
- **Assumptions**: Reuses existing question types and components, eliminating the need to write custom HTML inputs or custom DB tables for question groups.

---

## Related Files

The following files are related to this feature:

### Backend
1. **Models**:
   - `backend/models/form.py` (Add `target_survey` flag)
   - `backend/models/question.py` (Add question-level `target_value` column)
   - `backend/models/answer.py` (Add answer-level `target_value` and `target_comment` columns)
2. **Database Helpers**:
   - `backend/db/crud_form.py` (Save/retrieve `target_survey` flag)
   - `backend/db/crud_answer.py` (Save/update answer `target_value`, `value`, and `target_comment` simultaneously)
3. **API Routes**:
   - `backend/routes/form.py` (Serialize target settings in schema)
   - `backend/routes/data.py` (Handle and validate `target_value` and `target_comment` payloads)

### Frontend
1. **State Store**:
   - `frontend/src/lib/store.js` (Track `target_survey` configuration state)
2. **Survey Editor Page & Components**:
   - `frontend/src/pages/survey-editor/SurveyEditor.jsx` (Load `target_survey` settings from backend)
   - `frontend/src/components/survey-editor/FormEditor.jsx` (Toggle switch/checkbox to set `target_survey`)
3. **Webform Rendering / Form Fill Page**:
   - `frontend/src/pages/survey/WebformPage.jsx` (Check form settings and load schema)
   - `frontend/src/akvo-react-form/fields/TypeNumber.jsx` (Render side-by-side inputs for target, achievement, and narrative description)
