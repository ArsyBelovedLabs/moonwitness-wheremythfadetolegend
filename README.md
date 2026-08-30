# WHERE MYTH FADE TO LEGEND

## Indonesia Mythos & Ritual Observatory

React + Vite observatory for monthly evidence, ritual context, Four Revelation cross-reference, Tauhid Gap and causality analysis.

### Stack

- React + Vite
- shadcn/ui components with Radix primitives and Tailwind CSS
- Lucide icons
- Leaflet-ready geography layer
- PWA / installable app support
- GitHub Pages + Vercel deployment
- Read-only Vercel JSON API

### Data architecture

**GitHub is the current source of truth, not a traditional database.** Monthly observations, evidence, issues, analysis and resolutions are versioned as JSON under `data/YYYY/MM/`. Vercel Functions provide read-only API access to those files. This keeps historical snapshots reviewable and changes auditable in Git history.

There is currently **no PostgreSQL, MySQL, SQLite or other runtime database** in this project.

The workflow is:

```text
Evidence
  → Observation
  → Issue / Analysis
  → Resolution
  → Story export
  → Archive
```

### UI standard

The application uses shadcn/ui source components directly from `src/components/ui/*`. The application shell uses Tailwind utility classes and the shadcn theme tokens in `src/index.css`.

### Principles

- **Allah** is the theological reference point for the project's Tauhid lens.
- Religions, ethnic groups and communities are **not scored as good/bad**.
- **Specific practices** are evaluated separately from people and institutions.
- Mythos, doctrine, tradition, ritual, media narrative and natural events remain distinct.
- Evidence quality is independent from Tauhid Gap.
- Temporal proximity is never treated as proof of causation.
- High Tauhid Gap flags a **practice for review and constructive clarification**, not a verdict on a person or community.
- Automated monitoring produces **candidate signals only**. Verification remains a separate research step.

### Product

The application is mobile-first and designed as a live observatory with:

- monthly archive and month selector
- observation timeline and searchable master table
- observation detail sheet/drawer
- evidence ledger and Evidence Explorer
- Evidence Analysis workflow with TAU issue filtering
- Resolution board with focused issue drill-down
- 1080×1920 Story export/share
- Four Revelation Lens: **Al-Qur'an, Injil/Gospel, Taurat/Torah, Zabur/Psalms**
- Tauhid Gap severity system
- causality dashboard
- Indonesia observation map layer
- light/dark mode
- installable PWA shell
- live six-hour monitoring status
- candidate signal classification and alerts
- source health monitoring
- P4–P6 QA and E2E checks

### Public API (Vercel)

```text
GET /api/health
GET /api/observations?month=YYYY-MM
GET /api/evidence?month=YYYY-MM
GET /api/issues?month=YYYY-MM
GET /api/analysis?month=YYYY-MM
GET /api/resolution?month=YYYY-MM
GET /api/search?q=...
GET /api
```

The API is read-only and does not assign theological verdicts automatically.

### Monthly data

```text
data/index.json
data/YYYY/MM/report.json
data/YYYY/MM/issues.json
data/YYYY/MM/evidence.json
data/YYYY/MM/revelation.json
data/monitor/latest.json
data/monitor/signals.json
data/monitor/review-queue.json
```

### Monitoring

The GitHub monitor runs every 6 hours (`0 */6 * * *`) and follows:

```text
source scan
→ deduplicate
→ candidate classification
→ alert summary
→ review queue
→ verified observation
```

Scheduled source health runs at `30 */6 * * *`.

### Quality gates

Core JSON QA, P2 integrity checks, source-health checks and Playwright smoke tests are defined in `.github/workflows/`.

### Freeze policy

August 2026 is preserved as a historical baseline. Corrections must be versioned; historical data must not be silently edited.

### Local development

```bash
npm install
npm run dev
npm run build
```

### Deployment

The same React/Vite source is designed for:

- **GitHub Pages** via `.github/workflows/pages.yml`
- **Vercel** via `vercel.json` and the Vercel project Git integration
