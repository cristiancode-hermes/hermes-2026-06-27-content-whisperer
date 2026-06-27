# Database Schema — Content Whisperer

## ER Diagram

```mermaid
erDiagram
    User ||--o{ Source : "creates"
    User ||--o{ Collection : "creates"
    Collection ||--o{ CollectionSource : "has"
    Source ||--o{ CollectionSource : "included_in"
    Source ||--|| Summary : "has"
    Source ||--o{ KeyPoint : "has"
    Source ||--o{ Quote : "has"
    Source ||--o{ Stat : "has"

    User {
        int id PK
        string email UK
        string name
        string password
        datetime createdAt
        datetime updatedAt
    }

    Source {
        int id PK
        int userId FK
        string title
        string sourceType "text | url"
        string originalUrl "nullable"
        string rawContent
        string mode
        string notes "nullable"
        string analysisLength "nullable"
        datetime analyzedAt
        datetime createdAt
        datetime updatedAt
    }

    Summary {
        int id PK
        int sourceId FK UK
        string executiveSummary
        string tone "nullable"
        string sentiment "nullable"
        datetime createdAt
    }

    KeyPoint {
        int id PK
        int sourceId FK
        string text
        int relevanceScore
        int sortOrder
    }

    Quote {
        int id PK
        int sourceId FK
        string text
        string attribution "nullable"
        string context "nullable"
        int sortOrder
    }

    Stat {
        int id PK
        int sourceId FK
        string label
        string value
        string context "nullable"
        int sortOrder
    }

    Collection {
        int id PK
        int userId FK
        string name
        string description "nullable"
        datetime createdAt
        datetime updatedAt
    }

    CollectionSource {
        int id PK
        int collectionId FK
        int sourceId FK
        datetime addedAt
    }
```

## Migration Strategy

**Dev (SQLite):** `synchronize: true` — TypeORM auto-creates tables on startup. Database file at `apps/api/data/whisperer.db`.

**Prod (PostgreSQL/Neon):** `synchronize: true` is safe for initial deployment. For production, generate migrations:

```bash
# Generate migration
npx typeorm migration:generate src/migrations/InitialSchema -d src/data-source.ts

# Run migration
npx typeorm migration:run -d src/data-source.ts
```

## Neon-specific Notes

- Enable `pgvector` extension for future semantic search features
- RLS policies can be applied at the `userId` column on every table
- Connection pooling via PgBouncer (transaction mode)
- Use `sslmode=require` for secure connections

## Indexes

| Table | Index | Type |
|-------|-------|------|
| Source | `(userId, createdAt)` | B-tree (historia queries) |
| Source | `(userId, title)` | B-tree (búsqueda) |
| KeyPoint | `(sourceId, sortOrder)` | B-tree (ordenación) |
| Quote | `(sourceId, sortOrder)` | B-tree (ordenación) |
| Stat | `(sourceId)` | B-tree (join) |
| Collection | `(userId, name)` | UNIQUE B-tree |
| CollectionSource | `(collectionId, sourceId)` | UNIQUE B-tree |
