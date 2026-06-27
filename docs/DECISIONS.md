# Architecture Decisions — Content Whisperer

## ADR-1: Summary as Separate 1:1 Table (not JSON column)

**Context:** Each Source needs an executive summary, tone, and sentiment. Could store as JSON column on Source or as separate table.

**Decision:** Separate `summaries` table with 1:1 relationship.

**Rationale:**
- Allows lazy loading (summary not fetched for list queries)
- Cleaner schema with typed columns vs unstructured JSON
- Tone and sentiment can be indexed independently

**Trade-off:** Slightly more complex queries (extra JOIN for full detail)

---

## ADR-2: Separate KeyPoint/Quote/Stat Tables (not JSON arrays)

**Context:** Each analysis produces key points, quotes, and stats. Could store as JSON arrays in Source.

**Decision:** Separate normalized tables with foreign keys.

**Rationale:**
- Each entity has a stable type with different fields (relevanceScore for keyPoints, attribution for quotes, label/value for stats)
- Allows ordering via sortOrder column
- Enables future features: filtering keyPoints by score, searching quotes, aggregating stats across sources
- ON DELETE CASCADE handles cleanup

**Trade-off:** More database tables, more INSERT statements per analysis

---

## ADR-3: AI Strategy Pattern (Interface + Two Implementations)

**Context:** The app needs AI content analysis. No guarantee of OpenAI API key availability (cron environment). Need to work without an LLM.

**Decision:** Strategy Pattern with `AIStrategy` interface, two implementations:
- `OpenAIStrategy`: calls OpenAI structured JSON API
- `LocalFallbackStrategy`: TF-IDF + heuristics

**Rationale:**
- Single switch via env var (`OPENAI_API_KEY`)
- No dependency injection framework needed for strategies — simple class instantiation
- Same interface, same response types — frontend is agnostic

**Trade-off:** LocalFallback produces simpler results than LLM

---

## ADR-4: sourceType as VARCHAR (not Enum or separate tables)

**Context:** Sources come from text paste or URL. Could use separate tables or a PostgreSQL enum.

**Decision:** Single `sources` table with `sourceType VARCHAR(10)` and nullable `originalUrl`.

**Rationale:**
- Most fields are shared (title, content, mode, etc.)
- Adding future source types (PDF, image, video) only requires adding a new type string
- No schema migration for new source types
- SQLite doesn't support enums — varchar is portable

---

## ADR-5: `as any` Casts for TypeORM save() Calls

**Context:** TypeORM 1.0's DeepPartial type doesn't accept relation objects `{ entity: { id: 1 } }` or FK columns when `@ManyToOne`/`@JoinColumn` is present.

**Decision:** Use `as any` type assertion on save/create arguments.

**Rationale:**
- Runtime behavior is correct — TypeORM accepts `{ entity: { id: n } }`
- Avoiding `as any` would require splitting saves or extensive type gymnastics
- All casts are in seed/creation code, not in business logic

**Trade-off:** Loses compile-time type safety for those specific calls

---

## ADR-6: SQLite Dev / PostgreSQL Prod via Env Switch

**Context:** Design specs call for Neon/PostgreSQL production but no NEON_API_KEY available in cron environment.

**Decision:** TypeORM config switches between `better-sqlite3` (when `DATABASE_TYPE=sqlite`) and `postgres` (when `DATABASE_TYPE=postgres`).

**Rationale:**
- SQLite is zero-config, no server needed
- Same TypeORM API and entities work for both
- PostgreSQL-compatible schema design (text, real, COALESCE for aggregation)
- Switch requires only env change

**Trade-off:** SQLite-specific date functions (strftime) vs PostgreSQL EXTRACT — need env-aware queries for date aggregations
