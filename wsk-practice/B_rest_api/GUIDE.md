# Guide - Module B

## Time plan
- 0:00-0:15 Read spec, import schema.sql, init project
- 0:15-0:45 Helpers (response/error), DB pool, auth middleware
- 0:45-2:15 Endpoints in order: login -> books GET -> books write -> loans
- 2:15-2:45 Insomnia collection, test every status code
- 2:45-3:00 Re-read spec vs. responses

## Setup (Node)
```
npm init -y
npm i express mysql2 cors dotenv bcryptjs
```
Structure: `src/db.js, src/middleware/{auth,admin}.js, src/routes/{auth,books,loans}.js, src/utils/respond.js, server.js`

## Key snippets
Parameterized queries only:
```js
const [rows] = await pool.query('SELECT * FROM books WHERE title LIKE ?', [`%${q}%`]);
```
Token auth:
```js
const token = (req.headers.authorization || '').replace('Bearer ', '');
const [r] = await pool.query('SELECT u.* FROM tokens t JOIN users u ON u.id=t.user_id WHERE t.token=?', [token]);
if (!r.length) return res.status(401).json({ error: { code: 401, message: 'Unauthenticated' } });
req.user = r[0]; next();
```
Token generation: `crypto.randomBytes(32).toString('hex')`.

## Business rules to double-check
- Available copies = copies - active loans (returned_at IS NULL)
- 409 when no copies left, when user has 3 active loans, when deleting a book with active loans
- 403 for non-admin on book writes and when returning someone else's loan

## Checklist
- [ ] Every response matches the JSON shape
- [ ] 201/204/401/403/404/409/422 used correctly
- [ ] Validation errors list fields in `details`
- [ ] No string-concatenated SQL
- [ ] Insomnia collection covers each endpoint (happy path + 1 failure)
