# Public API

The Vercel deployment exposes read-only JSON endpoints for integrations and dashboards.

| Endpoint | Purpose |
|---|---|
| `/api/health` | Service + six-hour monitor health |
| `/api/observations?month=YYYY-MM` | Monthly observations |
| `/api/evidence?month=YYYY-MM` | Monthly evidence ledger |
| `/api/issues?month=YYYY-MM` | Monthly issue register |
| `/api/search?q=...` | Cross-month search |

All endpoints are read-only and expose CORS headers. The API does not assign theological verdicts automatically.
