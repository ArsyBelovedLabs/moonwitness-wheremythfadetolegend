# WHERE MYTH FADE TO LEGEND

## MoonWitness Submodule · Counter-Mythos Observatory

Public research observatory for repository-grounded mythos/ritual observations, evidence, Tauhid-gap review, geography, disasters and causality analysis across Indonesia.

Production: `https://myth.moonwitness.biz.id/`

## What the app is

This repository is **not the MoonWitness main module**. It is the `WHERE MYTH FADE TO LEGEND` counter-mythos submodule.

Core guardrails:

- specific practices are reviewed separately from religions, ethnic groups and communities;
- evidence quality is independent from theological scoring;
- disaster events are stored independently from ritual observations;
- temporal/geographic proximity is not proof of causation;
- automated monitoring produces candidate signals only;
- August 2026 remains a frozen published baseline.

## Research instrument

The public app exposes:

- unified monthly report (`#report/2026-08`);
- complete observation ledger;
- repository-owned observation coordinates;
- interactive Mythos Spread Map;
- dedicated Disaster Map backed by `disasters.json`;
- deterministic Correlation / Timeline Engine (`ΔT + distance → proximity`);
- separate reviewed causality score and competing explanations;
- colorful Tauhid Gap dashboard + TAU issue register;
- evidence ledger;
- Four Revelation Lens;
- September candidate pipeline.

## Data architecture

GitHub is the source of truth. No PostgreSQL/MySQL/SQLite runtime database is used.

```text
data/index.json

data/YYYY/MM/
  report.json
  issues.json
  evidence.json
  revelation.json
  observations.geo.json
  disasters.json
  correlations.json
  candidates.json      # collecting months
```

August report/evidence/issues/revelation data remains frozen. Geography, disaster and correlation ledgers are added as new versioned files rather than silently rewriting the baseline.

## Correlation engine

`src/lib/correlation.js` keeps two concepts separate:

```text
TEMPORAL + GEOGRAPHIC CLOSENESS
            ↓
      PROXIMITY SCORE

REVIEWED SOURCES + MECHANISM + COMPETING CAUSES
            ↓
       CAUSALITY SCORE
```

Automatic pairs are labeled `AUTO_PROXIMITY_ONLY` and never become causal conclusions automatically.

## Candidate pipeline

Starting with September 2026:

```text
DISCOVERED
  → SOURCE_CHECK
  → VERIFIED
  → ANALYZED
  → PUBLISHED
```

The six-hour monitor may write only `DISCOVERED` candidates. Source verification is required before promotion.

## Public routes

```text
#report/2026-08  unified August public report
#spread-map      observation geography
#disaster-map    dedicated disaster map
#correlation     correlation / timeline engine
#review          Tauhid Gap + TAU issue register
#evidence        evidence ledger
#revelation      Four Revelation Lens
#pipeline        candidate-state pipeline
```

## Public API

```text
GET /api/health
GET /api/observations?month=YYYY-MM
GET /api/geography?month=YYYY-MM
GET /api/disasters?month=YYYY-MM
GET /api/correlations?month=YYYY-MM
GET /api/candidates?month=YYYY-MM
GET /api/evidence?month=YYYY-MM
GET /api/issues?month=YYYY-MM
GET /api/analysis?month=YYYY-MM
GET /api/resolution?month=YYYY-MM
GET /api/search?q=...
GET /api
```

All APIs are read-only.

## Stack

- React + Vite
- Leaflet / CARTO dark map tiles
- Lucide icons
- existing shadcn/Radix component layer
- canonical MoonWitness observatory component layer
- GitHub Actions monitoring + QA
- Vercel + GitHub Pages deployment
- Docker / Docker Compose portable runtime

## Local development

```bash
npm install
npm run dev
npm run build
```

## Docker Compose

The Docker runtime serves both the built Vite application and the same read-only `/api/*` handlers used by Vercel.

```bash
docker compose up --build -d
curl http://127.0.0.1:8080/api/health
```

Open `http://127.0.0.1:8080/`. To use another host port:

```bash
MOONWITNESS_PORT=8088 docker compose up --build -d
```

Stop and remove the runtime with:

```bash
docker compose down
```

The container runs as the non-root Node user and includes a healthcheck against `/api/health`. The `Docker Runtime` GitHub workflow validates Compose, builds the image, starts the service, and smoke-tests the web surface plus representative API endpoints.

## Quality gates

GitHub workflows cover data QA, source health, Docker runtime verification and Playwright smoke tests. The E2E suite checks frozen August counts, Disaster Map, Correlation Engine, unified monthly reporting and the September candidate-state UI.
