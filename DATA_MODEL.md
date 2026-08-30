# Observatory Data Model

`WHERE MYTH FADE TO LEGEND` is a MoonWitness **counter-mythos submodule** and a static, Git-backed research observatory. GitHub remains the source of truth; Vercel serves the React app and read-only API. There is no runtime SQL database in the current architecture.

## Research flow

```text
PUBLIC-SOURCE MONITOR
        ↓
DISCOVERED
        ↓ source verification
SOURCE_CHECK
        ↓
VERIFIED
        ↓ practice/evidence analysis
ANALYZED
        ↓ explicit publication decision
PUBLISHED
        ↓
OBSERVATION LEDGER
        ├── GEOGRAPHY
        ├── TAUHID REVIEW
        ├── EVIDENCE
        └── CORRELATION REVIEW ← DISASTER LEDGER
```

**Automated monitoring is allowed to create `DISCOVERED` candidates only.** It must not promote a candidate to `VERIFIED`, `ANALYZED` or `PUBLISHED` by itself.

## Monthly files

Each month under `data/YYYY/MM/` may contain:

- `report.json` — published observation ledger, KPI summary and reviewed causality statements.
- `issues.json` — practice-level clarification issues.
- `evidence.json` — auditable evidence/source records.
- `revelation.json` — Four Revelation comparison lens.
- `observations.geo.json` — repository-owned geographic metadata for observations.
- `disasters.json` — independently sourced disaster events and disaster-context signals.
- `correlations.json` — reviewed observation ↔ disaster relation records.
- `candidates.json` — monitoring pipeline records before publication.

`data/index.json` registers the paths and lifecycle state for each month.

## Geography contract

Coordinates do **not** live in the React UI. `observations.geo.json` assigns a stable observation ID and geography metadata to a published report row using an exact date/location/practice match.

Important fields:

- `id`: stable `OBS-YYYY-MM-NNN` identifier.
- `date_start`, `date_end`: normalized ISO dates used by the timeline engine.
- `geography.map_enabled`: whether the record is genuinely geolocatable.
- `lat`, `lon`: repository-owned mapping coordinate.
- `precision`: e.g. `city-centroid`, `regency-centroid`, `locality-centroid`.
- `province`, `island`: geographic grouping metadata.

National, multi-region and online observations remain **non-local** instead of receiving invented coordinates.

## Disaster contract

`disasters.json` is intentionally separate from the ritual/observation ledger. A disaster record contains:

- stable `DIS-*` ID;
- start/end timestamp;
- locality and administrative area;
- repository coordinate + precision;
- disaster type and severity/context;
- evidence score;
- independent disaster source;
- natural/human cause or official mechanism summary;
- explicit related observation IDs, if any;
- reviewed causality score/status/finding.

A disaster may exist with no related observation. This is normal and important for baseline context.

## Correlation / Timeline Engine

The browser engine in `src/lib/correlation.js` computes **proximity**, not causality.

```text
OBSERVATION WINDOW + LOCATION
             ×
DISASTER WINDOW + LOCATION
             ↓
        ΔT + DISTANCE
             ↓
      PROXIMITY SCORE
             ↓
  SEPARATE CAUSALITY REVIEW
```

The automatic engine may surface pairs within a bounded time/distance window as `AUTO_PROXIMITY_ONLY`. These rows are discovery aids and never causal conclusions.

Reviewed relation rows in `correlations.json` retain a separate `repository_causality_score`, competing explanations and a human-readable finding. High proximity can therefore coexist with low causality.

## Scoring dimensions

- **Evidence Score** — documentation quality, not truth of a supernatural claim.
- **Tauhid Gap** — comparative theological lens applied to a specific practice, never to an ethnicity, religion or person as a whole.
- **Proximity Score** — temporal/geographic closeness calculated by the engine.
- **Causality Score** — reviewed strength of an asserted cause-effect relationship.

Never substitute proximity for causality.

## Candidate-state contract

Allowed lifecycle:

`DISCOVERED → SOURCE_CHECK → VERIFIED → ANALYZED → PUBLISHED`

Expected meaning:

- `DISCOVERED`: automated or manual lead; not verified.
- `SOURCE_CHECK`: source identity, date, locality and primary evidence are being checked.
- `VERIFIED`: occurrence/source basis confirmed to the required research standard.
- `ANALYZED`: practice, evidence, Tauhid and causality dimensions have been reviewed.
- `PUBLISHED`: explicitly promoted into the monthly observation/evidence/issue ledgers.

Skipping directly from `DISCOVERED` to `PUBLISHED` violates the contract.

## Public API

Read-only endpoints include:

- `GET /api/observations?month=YYYY-MM`
- `GET /api/geography?month=YYYY-MM`
- `GET /api/disasters?month=YYYY-MM`
- `GET /api/correlations?month=YYYY-MM`
- `GET /api/candidates?month=YYYY-MM`
- `GET /api/evidence?month=YYYY-MM`
- `GET /api/issues?month=YYYY-MM`
- `GET /api/analysis?month=YYYY-MM`
- `GET /api/resolution?month=YYYY-MM`
- `GET /api/search?q=...`
- `GET /api/health`

## Freeze policy

August 2026 remains the historical published baseline. `report.json`, `issues.json`, `evidence.json` and `revelation.json` are not silently rewritten by the geography/disaster upgrade. New files provide versioned metadata and independent disaster/correlation context around the frozen report.

September 2026 starts in `collecting` state with empty published ledgers and an explicit candidate pipeline.
