# MoonWitness Freeze Manifest

## Freeze target
August 2026 historical baseline / feature-complete observatory.

## UI architecture
React is the single application entrypoint. The previous DOM-injection prototype layers are no longer imported by `src/main.jsx`.

## Research flow
Evidence → Observation → Analysis → Issue → Resolution → Story → Archive.

## Product routes
Home, Observatory, Mythos, Ritual Watch, Revelation, Media Watch, Causality, Reports, Evidence Explorer, Evidence Analysis, Resolution Board, Methodology, and Story deep links.

## Data architecture
GitHub repository JSON is the versioned source of truth. Vercel serves the static application and read-only API facade. No transactional database is required for the frozen August 2026 baseline.

## Data files
`data/index.json`
`data/YYYY/MM/report.json`
`data/YYYY/MM/issues.json`
`data/YYYY/MM/evidence.json`
`data/YYYY/MM/revelation.json`
`data/monitor/*`

## Freeze rules
- Do not silently rewrite August 2026 historical records.
- Corrections must be committed and traceable.
- Keep Evidence Score independent from Tauhid Gap.
- Treat automated monitoring as candidate signals; verification remains explicit.
- Specific practices, claims and sources are reviewed, not communities as a whole.
- Temporal proximity is not evidence of causation.

## Deployment
Production domain: `myth.moonwitness.biz.id`
Vercel project: `moonwitness-wheremythfadetolegend`
Node: 24.x
Build: `npm run build`
