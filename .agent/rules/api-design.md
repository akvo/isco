---
trigger: model_decision
description: When implementing REST/HTTP APIs (endpoints, handlers, middleware, or response formatting)
---

## API Design Principles

### RESTful API Standards

**Resource-Based URLs:**
- Use plural nouns for resources: `/api/users`, `/api/orders`.
- Hierarchical relationships: `/api/users/:userId/orders`.
- Avoid verbs in URLs: `/api/users/:id` instead of `/api/getUser`.

**HTTP Methods:**
- GET: Read/retrieve.
- POST: Create new resource.
- PUT: Replace entire resource.
- PATCH: Partial update.
- DELETE: Remove resource.

**Pagination:**
- Limit results per page (default 20, max 100).
- Offset-based: `?page=2&limit=20`.

### HTTP Status Codes

| Code | When to Use |
|------|------------|
| 200 OK | Success (GET, PUT, PATCH) |
| 201 Created | Resource created (POST) |
| 204 No Content | Success with no body (DELETE) |
| 400 Bad Request | Validation errors |
| 401 Unauthorized | Missing/invalid authentication |
| 403 Forbidden | Lacks permission |
| 404 Not Found | Resource doesn't exist |
| 422 Unprocessable | Domain/Validation rule violation |
| 500 Error | System issue |

### Success Response Format

```json
{
  "data": {},
  "meta": { "total": 100, "page": 1, "perPage": 20 }
}
```

### Error Response Format (FastAPI)

```json
{
  "detail": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email"
  }
}
```

### Related Rules
- Error Handling @error-handling.md
- Security Mandate @security-mandate.md
- FastAPI Backend @fastapi-backend.md
