# Feature Specification: Survey Validations & Dynamic Placeholders

This document specifies the technical design, configuration changes, and implementation plan for adding dynamic placeholders and immediate inline numerical validations to the survey form system.

## 1. Requirements

### 1.1 Immediate Inline Numerical Validations
We need to support immediate numerical comparisons on value change instead of waiting for form submission:
1. **Q6 $\le$ Q5 Comparison**: The response to Question 6 must be less than or equal to the response to Question 5.
2. **Q3 (Male Growers) + Q4 (Female Growers) $\le$ Q2 (Total Farmers)**: The sum of Q3 and Q4 must not exceed the total value in Q2.
3. **Q3 (Male Growers) $\le$ Q2 (Total Farmers)**: The response to Q3 must be less than or equal to Q2.

*Note: For repeatable question groups, comparisons must be computed within the same repeat index iteration (e.g., Q6-1 $\le$ Q5-1, Q6-2 $\le$ Q5-2, etc.).*

### 1.2 Delayed Sum-to-100% Validation
- We confirmed that the sum-to-100% validation check already runs exclusively on submission (inside `onSubmitValidationOrShowSubmitWarning` in `WebformPage.jsx`). This behavior matches the user's preference and will be preserved.

### 1.3 Dynamic Cascade Dropdown Placeholders
For dynamic cascading API-driven select fields (e.g., country and partner selections):
- **Country field (Level 1)**: Display "select country" (EN) / "Land auswählen" (DE) / "Sélectionner le pays" (FR).
- **Partner field (Level 1)**: Display "select partner" (EN) / "Partner auswählen" (DE) / "Sélectionner le partenaire" (FR).
- Subsequent levels will continue to use the standard "Select level {N}" text.

---

## 2. Technical Design

### 2.1 Database Schema Representation (`question.rule`)
To support dynamic comparisons configurable via the survey editor UI, validation rules are stored directly inside the generic JSONB `rule` column of the `question` table.

The `rule` JSON object for a question with comparison validations will contain the following keys:
- `comparison_type`: `"None" | "comparison" | "sum_comparison"`
- `comparison_operator`: `"less_than_or_equal" | "greater_than_or_equal" | "equal"`
- `comparison_target`: ID of the target numeric question.
- `comparison_sources`: Array of numeric question IDs to sum (only for `sum_comparison`).
- `comparison_message`: Localized error message in English.
- `comparison_message_de`: Localized error message in German.
- `comparison_message_fr`: Localized error message in French.

#### Example `rule` object on a comparison source question (e.g. Q6):
```json
{
  "allow_decimal": true,
  "min": 0,
  "comparison_type": "comparison",
  "comparison_operator": "less_than_or_equal",
  "comparison_target": 5,
  "comparison_message": "Answer must be less than or equal to Question 5",
  "comparison_message_de": "Der Wert muss kleiner oder gleich der Antwort auf Frage 5 sein",
  "comparison_message_fr": "La valeur doit être inférieure ou égale à celle de la question 5"
}
```

### 2.2 Survey Editor UI (`QuestionSetting.jsx`)
In the survey editor:
1. Under the **Validation Criteria** tab for numeric questions, we render form inputs for comparison configuration:
   - **Comparison Type**: Dropdown select with options `None`, `comparison`, and `sum_comparison`.
   - **Sources** (if type is `sum_comparison`): Multi-select listing all other numeric questions.
   - **Operator**: Dropdown select with options `<=`, `>=`, `==`.
   - **Target Question**: Dropdown select listing all other numeric questions.
   - **Error Messages**: Inputs for custom localized error messages (English, German, French).
2. When the Comparison Type changes to `"None"`, any comparison fields are cleared/reset.
3. Form values mapped to `question-${qid}-rule-${key}` are automatically parsed and saved back to the database as part of the question's `rule` object.

### 2.3 Number Field Validations (`TypeNumber.jsx`)
We will update `NumberField` (in `TypeNumber.jsx`) to:
1. Access the `rule` object passed directly as a prop to the question component.
2. Resolve target and source field keys scoped to the repeat index:
   - For repeatable question groups (e.g., field ID is `48-1`), resolve the target question (e.g., ID 49) to `49-1`.
   - For non-repeatable groups, resolve it to the integer ID (e.g., `49`).
3. Construct the `dependencies` array of `<Form.Item>` to contain the target/source field keys. This ensures Ant Design reactively re-evaluates the validator when any related field is changed.
4. Implement a custom `validator` function:
   - Skip validation if the field value is empty or `n/a` is checked.
   - Evaluate the comparison operator against the target value (and sum of source values if `sum_comparison`).
   - Reject the Promise with the corresponding localized warning message if evaluation fails.

### 2.4 Cascade Dynamic Placeholders (`TypeCascade.jsx` / `TypeCascadeApi.jsx`)
1. Propagate `variable_name` from `TypeCascade` to `TypeCascadeApi` and into `CascadeApiField`.
2. Inside `CascadeApiField`, check if the select field is level 1 (`ci === 0`) and check the `variable_name`:
   - If `"country"`: Set placeholder to `uiText.selectCountry`.
   - If `"partner"`: Set placeholder to `uiText.selectPartner`.
   - Otherwise, default to standard `${uiText.selectLevel} ${ci + 1}`.

### 2.5 Localization Updates
We will add keys to translation files (`en.json`, `de.json`, `fr.json`, `id.json`, `in.json`):
- **English (`en.json`)**:
  - `"selectCountry": "select country"`
  - `"selectPartner": "select partner"`
- **German (`de.json`)**:
  - `"selectCountry": "Land auswählen"`
  - `"selectPartner": "Partner auswählen"`
- **French (`fr.json`)**:
  - `"selectCountry": "Sélectionner le pays"`
  - `"selectPartner": "Sélectionner le partenaire"`
- **Indonesian (`id.json`)**:
  - `"selectCountry": "Pilih Negara"`
  - `"selectPartner": "Pilih Mitra"`
- **Hindi (`in.json`)**:
  - `"selectCountry": "देश चुनें"`
  - `"selectPartner": "साझेदार चुनें"`

---

## 3. Verification Plan

### 3.1 Automated Testing
We will add front-end tests using the existing Jest/React Testing Library setup or backend route validation checks to verify configurations.

### 3.2 Manual Verification
We will verify the feature inside the application using a mock local form (e.g., `form_id` 100 or a specific dev form):
1. **Dynamic Placeholder**:
   - Inspect Country and Partner cascade fields before any selection.
   - Confirm placeholder text shows "select country" and "select partner" (and correct localized text when changing language to German/French).
2. **Inline Validation**:
   - Change values of Q5 and Q6. Confirm that if Q6 > Q5, a warning shows immediately underneath the field. Confirm warning disappears when Q6 is decreased or Q5 is increased.
   - Change values of Q2, Q3, and Q4. Confirm warnings show immediately if Q3 > Q2 or if Q3 + Q4 > Q2.
   - Test within a repeatable group to confirm validations are properly isolated to the same repeat index.
