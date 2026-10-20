# Module B - REST API (3h)

## Task
Build a REST API for a library system using MySQL (database dump: schema.sql). Stack: Node.js + Express (or PHP framework).
The API will be consumed by another agency's app, so follow the spec EXACTLY: field names, status codes, JSON shape.

## Response format
Success:  `{ "data": ... }`
Error:    `{ "error": { "code": 422, "message": "Validation error", "details": { "field": ["msg"] } } }`
Lists:    `{ "data": [...], "meta": { "page": 1, "per_page": 10, "total": 42 } }`

## Endpoints
| Method | Path | Auth | Description | Success | Errors |
|--------|------|------|-------------|---------|--------|
| POST | /api/login | no | body: email, password -> `{data:{token, user}}` | 200 | 401, 422 |
| POST | /api/logout | token | invalidate token | 204 | 401 |
| GET | /api/books | token | query: search, page, per_page, available=1 | 200 | 401 |
| GET | /api/books/:id | token | one book | 200 | 401, 404 |
| POST | /api/books | admin | title, author, isbn (unique), copies>=1 | 201 | 401, 403, 422 |
| PUT | /api/books/:id | admin | update fields | 200 | 401, 403, 404, 422 |
| DELETE | /api/books/:id | admin | only if no active loans | 204 | 401, 403, 404, 409 |
| POST | /api/loans | token | body: book_id; fails if no copies left; max 3 active loans | 201 | 401, 404, 409, 422 |
| GET | /api/loans/me | token | my loans | 200 | 401 |
| POST | /api/loans/:id/return | token | return a loan I own | 200 | 401, 403, 404, 409 |

Other rules: token via `Authorization: Bearer <token>`; passwords hashed; CORS enabled; JSON only.
Test accounts are in schema.sql (admin@lib.kz / admin123, user@lib.kz / user123).
