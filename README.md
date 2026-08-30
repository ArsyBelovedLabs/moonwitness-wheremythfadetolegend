# WHERE MYTH FADE TO LEGEND

## Indonesia Mythos & Ritual Observatory

React + Vite observatory for monthly evidence, ritual context, Four Revelation cross-reference, Tauhid Gap and causality analysis.

### Stack

- React + Vite
- shadcn/ui-style component primitives and design tokens
- Lucide icons
- Leaflet-ready geography layer
- PWA / installable app support
- GitHub Pages + Vercel deployment

### Principles

- **Allah** is the theological reference point for the project's Tauhid lens.
- Religions, ethnic groups and communities are **not scored as good/bad**.
- **Specific practices** are evaluated separately from people and institutions.
- Mythos, doctrine, tradition, ritual, media narrative and natural events remain distinct.
- Evidence quality is independent from Tauhid Gap.
- Temporal proximity is never treated as proof of causation.
- High Tauhid Gap flags a **practice for review and constructive clarification**, not a verdict on a person or community.

### Product

The application is mobile-first and designed as a live observatory with:

- monthly archive and month selector
- observation timeline and searchable master table
- observation detail sheet/drawer
- evidence ledger
- issue center and resolution queue
- Four Revelation Lens: **Al-Qur'an, Injil/Gospel, Taurat/Torah, Zabur/Psalms**
- Tauhid Gap severity system
- causality dashboard
- Indonesia observation map layer
- 1080×1920 Story export/share
- light/dark mode
- installable PWA shell

### Monthly data

```text
data/index.json
data/YYYY/MM/report.json
data/YYYY/MM/issues.json
data/YYYY/MM/evidence.json
data/YYYY/MM/revelation.json
```

Shared taxonomy lives at `data/taxonomy.json`.

### Quality gate

Every push and pull request runs `qa/validate.mjs` to validate the core registry and monthly JSON datasets before deployment.

### Local development

```bash
npm install
npm run dev
npm run build
```

### Deployment

The same app source is designed for:

- **GitHub Pages** via `.github/workflows/pages.yml`
- **Vercel** via `vercel.json`

Suggested public URLs:

- `https://arsybelovedlabs.github.io/moonwitness-wheremythfadetolegend/`
- `https://moonwitness-wheremythfadetolegend.vercel.app/`
