---
name: react-crud
description: Step-by-step guide for adding new CRUD features to the FastAPI-React stack. Covers backend (Pydantic, SQLAlchemy, Routers) and frontend (Services, Hooks, Components).
---

# React CRUD Skill

## Overview

Complete guide for adding a new CRUD feature to the `fastapi-react` stack. Follow these steps in order.

## 1. Backend Implementation

Follow the `fastapi-backend.md` standards.

### 1.1. Create Pydantic Schemas
In `backend/models/[resource].py`: Create `Base`, `Create`, `Update`, and `Response` models.

### 1.2. Create SQLAlchemy Model
In `backend/models/[resource].py`: Define the DB table.

### 1.3. Create Route
In `backend/routes/[resource].py`: Implement GET, POST, PATCH, DELETE endpoints. Use `Depends(get_db)` and `Depends(get_current_user_required)`.

### 1.4. Mount Route & Migrate
Mount in `main.py` and run:
```bash
./dc.sh exec backend alembic revision --autogenerate -m "add [resource] table"
./dc.sh exec backend alembic upgrade head
```

## 2. Frontend Implementation

Follow the `react-frontend.md` standards and feature-based architecture.

### 2.1. Create Feature Directory
`mkdir -p frontend/src/features/[feature-name]/{components,hooks,services,tests}`

### 2.2. Create API Service
In `frontend/src/features/[feature-name]/services/api.js`:
```javascript
import axios from 'axios';
const API_URL = '/api/[resource]';
export const getItems = () => axios.get(API_URL);
export const createItem = (data) => axios.post(API_URL, data);
```

### 2.3. Create Custom Hook
In `frontend/src/features/[feature-name]/hooks/use[Feature].js`:
```javascript
import { useState, useEffect } from 'react';
import { getItems } from '../services/api';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... handle state and effects
  return { items, loading };
};
```

### 2.4. Create Components
Build functional components in `frontend/src/features/[feature-name]/components/`. Apply "WOW" aesthetics (transitions, gradients).

## 3. Verification

### 3.1. Backend Tests
`./dc.sh exec backend ./test.sh`

### 3.2. Frontend Tests
`./dc.sh exec frontend npm run test -- src/features/[feature-name]/tests`

## Rule Compliance

- FastAPI Backend @fastapi-backend.md
- React Frontend @react-frontend.md
- API Design @api-design.md
- Testing Strategy @testing-strategy.md
- Docker Commands @docker-commands.md
