# API Reference — Content Whisperer

> Base URL: `http://localhost:3000/api`
> Auth: `Authorization: Bearer <JWT_TOKEN>`

## Auth

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "María García",
  "password": "securePass123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "email": "user@example.com", "name": "María García", "createdAt": "2026-06-27T...", "updatedAt": "2026-06-27T..." }
}
```

**Errors:** 409 Conflict (email exists), 400 Validation

### POST /api/auth/login
Authenticate and receive JWT.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePass123"
}
```

**Response (201):**
```json
{ "token": "...", "user": { ... } }
```

**Errors:** 401 Unauthorized (invalid credentials)

### GET /api/auth/me
Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`
**Response (200):** `{ "id": 1, "email": "...", "name": "...", "createdAt": "...", "updatedAt": "..." }`

## Sources

### GET /api/sources
List sources with pagination and filtering.

**Query params:** `?page=1&limit=10&type=text&q=searchterm`

**Response (200):**
```json
{
  "data": [{ "id": 1, "title": "...", "sourceType": "url", "mode": "general", "summary": { ... }, "keyPoints": [...] }],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

### GET /api/sources/search?q=term
Full-text search in title and raw content.

### GET /api/sources/:id
Get a single source with all relations (summary, keyPoints, quotes, stats).

### PATCH /api/sources/:id
Update title and/or notes.

```json
{ "title": "New Title", "notes": "Some notes..." }
```

### DELETE /api/sources/:id
Delete source and all associated data (CASCADE). Returns 204.

## Analysis

### POST /api/analysis/text
Analyze pasted text.

```json
{
  "content": "string (100-50000 chars)",
  "mode": "general | technical | academic | news",
  "length": "brief | normal | detailed"
}
```

**Response (201):** Full Source object with summary, keyPoints, quotes, stats.

### POST /api/analysis/url
Analyze content from a URL.

```json
{
  "url": "https://example.com/article",
  "mode": "general",
  "length": "normal"
}
```

**Response (201):** Full Source object.

## Collections

### GET /api/collections
List all collections for the authenticated user.

**Response:**
```json
[
  { "id": 1, "name": "Salud", "description": "...", "_count": { "sources": 5 }, "createdAt": "...", "updatedAt": "..." }
]
```

### POST /api/collections
Create a new collection.

```json
{ "name": "Dev Resources", "description": "Artículos técnicos" }
```

### GET /api/collections/:id
Get collection with its sources (with summaries).

### PATCH /api/collections/:id
Update collection name/description.

### DELETE /api/collections/:id
Delete collection (sources NOT deleted, only unlinked).

### POST /api/collections/:id/sources
Add source to collection.

```json
{ "sourceId": 1 }
```

### DELETE /api/collections/:id/sources/:sourceId
Remove source from collection. Returns 204.

## Dashboard

### GET /api/dashboard/stats
**Response:**
```json
{
  "totalSources": 3,
  "totalCollections": 3,
  "totalQuotes": 3,
  "activeModes": 2,
  "modeDistribution": [{ "mode": "general", "count": "2" }, { "mode": "technical", "count": "1" }],
  "monthlyActivity": [{ "month": "2026-06", "count": "3" }]
}
```

### GET /api/dashboard/recent
Returns last 5 sources with summaries.

### GET /api/dashboard/top-words
Returns top 20 most frequent meaningful words across all user sources.
