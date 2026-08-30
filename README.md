# WHERE MYTH FADE TO LEGEND

## August 2026 — Indonesia Observatory

An evidence-first monthly observatory for mythos, ritual, religious context, media propagation, Tauhid Gap, revelation cross-reference, and causality.

### Core principles

- **Allah** is the theological reference point for the project's Tauhid lens.
- Religions, ethnic groups, and communities are **not scored as good/bad**.
- **Specific practices** are evaluated separately from people and institutions.
- Mythos, doctrine, tradition, ritual, media narrative, and natural events remain distinct datasets.
- Evidence quality is independent from Tauhid Gap.
- Temporal proximity is never treated as proof of causation.
- High Tauhid Gap flags a **practice for review**, not a verdict on a person or community.

### Product

The repository powers a mobile-first live observatory with:

- monthly archive and month selector
- observation timeline and searchable master table
- observation detail drawer
- evidence ledger
- issue center and resolution queue
- Four Revelation Lens: **Al-Qur'an, Injil/Gospel, Taurat/Torah, Zabur/Psalms**
- Tauhid Gap severity system
- causality dashboard
- Indonesia observation map
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

### Deployment

The same static source is designed for:

- **GitHub Pages** via `.github/workflows/pages.yml`
- **Vercel** via `vercel.json`

Suggested public URLs:

- `https://arsybelovedlabs.github.io/moonwitness-wheremythfadetolegend/`
- `https://moonwitness-wheremythfadetolegend.vercel.app/`

### Scoring

**Evidence Score** = confidence in factual documentation.

**Tauhid Gap Score** = comparative theological assessment of a specific documented practice against the project's Allah/Tawhid reference point.

**Causality Score** = strength of evidence for a cause-and-effect relationship, requiring a plausible mechanism and competing-cause checks.
