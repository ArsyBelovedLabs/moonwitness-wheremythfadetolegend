# Observatory Data Model

MoonWitness is currently a **static, Git-backed data observatory**. GitHub is the source of truth for the monthly datasets; Vercel serves the same files and exposes read-only API endpoints. There is no PostgreSQL/MySQL/SQLite database in the current architecture.

## Data flow

`Evidence -> Observation -> Issue / Analysis -> Resolution -> Story -> Archive`

Each month lives under `data/YYYY/MM/` and should contain:

- `report.json` — KPIs, observations, causality and monthly summary data.
- `issues.json` — issue register with priority, status and resolution/next action.
- `evidence.json` — auditable source records and links.
- `revelation.json` — four-reference theological comparison lens.

## Runtime architecture

```text
GitHub repository
      │
      ├── data/YYYY/MM/*.json      ← source of truth
      │
      ├── React + Vite             ← browser UI
      │
      └── /api/*.js                 ← Vercel read-only facade
                    │
                    └── reads the same repository files
```

The browser may read `/data/...json` directly for the static app. Vercel Functions under `/api/` provide stable API surfaces for external readers and integrations.

## API surfaces

- `GET /api/observations?month=YYYY-MM`
- `GET /api/evidence?month=YYYY-MM`
- `GET /api/issues?month=YYYY-MM`
- `GET /api/analysis?month=YYYY-MM`
- `GET /api/resolution?month=YYYY-MM`
- `GET /api/search?q=...`
- `GET /api/health`

The analysis and resolution APIs are read-only projections of the issue register. They do not write conclusions back to the dataset.

## Scoring

- Evidence Score: documentation quality, not truth of a supernatural claim.
- Tauhid Gap: comparative theological lens applied to a specific practice, never to an ethnicity, religion or person as a whole.
- Causality Score: strength of a claimed cause-effect relationship. Temporal overlap alone is not causality.

## Evidence grades

A = primary/official/direct documentation
B = reputable journalism
C = secondary media
D = social/unverified content
E = rumor/folklore claim

## Review workflow

`COLLECT -> VERIFY -> CLASSIFY -> SCORE -> MAP -> CROSS-CHECK -> ISSUE -> ANALYZE -> RESOLVE -> STORY -> ARCHIVE`

Automated monitoring produces candidate signals only. Verification and resolution remain explicit research steps.

## Freeze policy

August 2026 is preserved as a historical baseline. Corrections must be versioned; historical data must not be silently edited.
