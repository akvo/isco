---
description: Implement phase - Red-Green-Refactor with Vitest/Pytest
---

# Phase 2: Implement (FastAPI & React)

## Purpose
Write production code following Test-Driven Development (TDD) principles to ensure high-quality, maintainable features for both the FastAPI backend and React frontend.

## Prerequisites
- **Phase 1 (Research)** completed with a documented research log.
- **Workflow Awareness**: Proactively scan `.agent/workflows/` and use required workflows.
- **Task.md** updated to reflect the current story in progress.

## Steps

**Set Mode:** Use `task_boundary` to set mode to **EXECUTION**.

### 1. Create Test Files
- **Backend (Python):** Create `backend/tests/test_{feature_name}.py`.
- **Frontend (React):** Create `*.test.jsx` within the feature folder (co-location).

### 2. Write Failing Test (Red)
**Backend: Class-Based pytest**
```python
import pytest
from httpx import AsyncClient

class TestItemFeature:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.url = "/api/v1/items/"

    @pytest.mark.asyncio
    async def test_create_item_success(self, client: AsyncClient, auth_headers):
        payload = {"name": "Example", "description": "TDD"}
        response = await client.post(self.url, json=payload, headers=auth_headers)
        assert response.status_code == 201
```

**Frontend: Jest + React Testing Library**
```jsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
    it('should render correct title', () => {
        render(<MyComponent title="Hello" />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });
});
```

### 3. Write Minimal Code (Green)
Write only the code necessary to make the tests pass:
- Define FastAPI routes and Pydantic schemas in `backend/`.
- Implement React components and CSS in `frontend/src/features/[feature]`.

### 4. Refactor (Blue)
Improve the code while keeping the tests green:
- **Aesthetics**: Apply "WOW" factors (transitions, gradients) to React components.
- **Backend**: Ensure clean DI and Pydantic v1 compliance.
- **Consistency**: Verify snake_case for Python and PascalCase for React components.

### 5. Repeat
Continue the Red-Green-Refactor cycle for each story requirement.

## Development Commands

```bash
# Backend: Run tests via project test script
./dc.sh exec backend ./test.sh

# Frontend: Run Jest tests
./dc.sh exec frontend npm run test -- --watchAll=false
```

## Completion Criteria
- [ ] Unit tests written and passing (TDD Enforced)
- [ ] Implementation complete
- [ ] Aesthetics meet "WOW" standards
- [ ] Document Sync: Update `agent_docs/stories/` (Actual Time, UAC/TAC)

## Next Phase
Proceed to **Phase 3: Integrate** (`/3-integrate`)
