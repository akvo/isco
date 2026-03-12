---
description: Integrate phase - end-to-end connectivity and service integration
---

# Phase 3: Integrate (Full Stack)

## Purpose
Ensure that the newly implemented features work correctly across the entire stack, from React frontend to FastAPI backend and the database.

## Steps

**Set Mode:** Use `task_boundary` to set mode to **EXECUTION**.

### 1. Verify API Connectivity
- Ensure the React frontend can talk to the FastAPI backend.
- Check CORS settings in `backend/main.py`.
- Verify the Axios/Fetch base URL matches the Docker service (`http://backend:8000`).

### 2. Manual End-to-End Walkthrough
- Use the Browser tool to navigate the application.
- Perform the primary user journey (e.g., Create -> List -> Update -> Delete).
- Verify data persistence in the database.

### 3. Cross-Component Consistency
- Verify the JSON response from the backend matches the Pydantic `Response` schema and the React component's expected data structure.
- Ensure error messages from the backend are gracefully displayed in the frontend.

### 4. Docker Environment Check
- Restart services: `./dc.sh down && ./dc.sh up -d`
- Check logs for any startup errors: `./dc.sh logs -f`

## Completion Criteria
- [ ] Frontend and Backend communicate without CORS errors
- [ ] Primary user journey verified via Browser
- [ ] Error messages displayed correctly in UI
- [ ] Docker environment stable

## Next Phase
Proceed to **Phase 4: Verify** (`/4-verify`)
