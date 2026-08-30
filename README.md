# WHERE MYTH FADE TO LEGEND

## MoonWitness Submodule · Counter-Mythos Observatory

`WHERE MYTH FADE TO LEGEND` is a public MoonWitness submodule for evidence-first monitoring and clarification of mythos, ritual context, media narratives, Four Revelation references, Tauhid Gap and causality claims across Indonesia.

The public interface is deliberately presented as a **counter-mythos observatory**, not as the main MoonWitness application.

### Stack

- React + Vite
- Leaflet geography layer
- Lucide icons
- repository-backed JSON data
- PWA / installable shell
- GitHub Pages + Vercel deployment
- read-only Vercel JSON API

### Data architecture

**GitHub is the current source of truth, not a traditional database.** Monthly observations, evidence, issues and theological comparison metadata are versioned as JSON under `data/YYYY/MM/`. Vercel Functions provide read-only API access to those files.

There is currently **no PostgreSQL, MySQL, SQLite or other runtime database** in this project.

### Public dashboard routes

The current public presentation follows the August 2026 observatory poster system:

```text
#report        → August master report + complete observation ledger
#spread-map    → repository-grounded mythos spread map
#disaster-map  → August disaster context + causality overlay
#review        → Tauhid Gap distribution + TAU issue register
#evidence      → evidence ledger
#revelation    → Four Revelation Lens
```

The presentation uses a black / observatory-gold visual system with explicit severity colors. Tauhid Gap is rendered as:

```text
LOW       0–25   green
WATCH    26–40   yellow
HIGH     41–75   orange
CRITICAL 76–100  red
```

These bands apply to **specific observed practices or claims**, not to a religion, ethnicity, institution or community.

### Principles

- **Allah** is the theological reference point for the project's Tauhid lens.
- Religions, ethnic groups and communities are **not scored as good/bad**.
- **Specific practices** are evaluated separately from people and institutions.
- Mythos, doctrine, tradition, ritual, media narrative and natural events remain distinct.
- Evidence quality is independent from Tauhid Gap.
- Temporal proximity is never treated as proof of causation.
- High Tauhid Gap flags a **practice for review and constructive clarification**, not a verdict on a person or community.
- Automated monitoring produces **candidate signals only**. Verification remains a separate research step.

### August 2026 frozen baseline

The August report is loaded from:

```text
data/2026/08/report.json
data/2026/08/issues.json
data/2026/08/evidence.json
data/2026/08/revelation.json
```

The current frozen dataset contains:

- 8 dashboard KPIs
- 17 observation rows
- 7 causality findings
- 12 TAU review issues
- 15 evidence sources
- 4 Revelation Lens traditions

The Disaster Map only creates disaster context from repository causality findings. It must not visually or textually imply that a ritual caused a wildfire, earthquake, flood or other natural event merely because of temporal or geographic proximity.

### Four Revelation Lens

The current comparison surface includes:

- **Al-Qur'an**
- **Injil / Gospel**
- **Taurat / Torah**
- **Zabur / Psalms**

References are theological comparison points for Tawhid, not evidence that a scripture directly describes a modern event.

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

### Monitoring

The repository monitor follows:

```text
source scan
→ deduplicate
→ candidate classification
→ alert summary
→ review queue
→ verified observation
```

Monitor state is stored under `data/monitor/`. Candidate signals are not promoted to verified observations automatically.

### Quality gates

Core JSON QA, source-health checks and Playwright smoke tests are defined in `.github/workflows/` and `e2e/`.

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
- **Vercel** via `vercel.json` and Git integration
