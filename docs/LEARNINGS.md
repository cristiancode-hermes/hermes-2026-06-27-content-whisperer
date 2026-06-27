# Learnings — Content Whisperer (2026-06-27)

## What Worked Well

1. **Design specs from UX team** continue to be invaluable — 9th consecutive build-from-specs project. Save ~15 min of planning/design per run.

2. **AI Strategy Pattern** (Rung 2-3) with local TF-IDF fallback produces surprisingly useful structured analysis without an LLM — extractive summaries, keyword-dense key points, regex-based quotes/stats extraction.

3. **Parallel subagent delegation** for a large frontend (8 pages, 33 TS files, all routing/services) completed in ~5 min with a clean build. 55 tool calls automated without any manual intervention needed.

4. **Signal-based dashboard with computed()** for stat derivation (mode distribution, monthly activity, top words) kept the template clean.

5. **Separate detail tables** (Summary 1:1, KeyPoint/Quote/Stat 1:N) worked well — cleaner than JSON blobs and future-proof for queries.

6. **TypeORM 1.0 `as any` pattern** for seed data saves is now well-understood — 15th project using it without new issues.

## What I'd Do Differently

1. **NestJS build process** still requires `--tsc` flag for decorator compatibility (TS1240). Should accept this as permanent constraint rather than debugging each time.

2. **The collections service findAll** with `result: any[]` pattern is a leftover from TypeORM strictness — should return a properly typed response or use a DTO.

3. **Backend test coverage** was skipped again for time — the AI analysis service (especially LocalFallbackStrategy) would benefit from focused unit tests.

## Applied Lessons from Recipe Manager (2026-06-26)

- ✅ **Individual signals for form fields** (ngModel + signals) — applied in analyze page (content, mode, length)
- ✅ **Template methods public** — all click handlers and event methods are public
- ✅ **TypeORM `as any` casts** for seed data saves — used consistently throughout

## Technical Debt

- Zero backend unit tests (should add tests for AI analysis strategies)
- No frontend component tests
- LocalFallbackStrategy quote extraction is regex-based and misses edge cases
- Dashboard top-words generates fresh data from raw content each time — could cache or pre-compute

## Environment Constraints (15th Run)

- GITHUB_TOKEN empty — cannot push to GitHub
- NEON_API_KEY empty — cannot provision Neon database
- OPENAI_API_KEY empty — AI uses LocalFallback strategy
