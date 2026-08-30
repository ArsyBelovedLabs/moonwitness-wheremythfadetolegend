# Monitoring Alerts

The monitor is allowed to surface operational signals, not final theological conclusions.

## Alert classes

- `NEW_SIGNAL_BURST` — unusually high number of new candidates in one scan.
- `DUPLICATE_BURST` — several sources repeat substantially similar claims.
- `SOURCE_CONCENTRATION` — most coverage comes from a single source family.
- `REVIEW_REQUIRED` — an item is specific enough to require human source/context review.
- `CAUSALITY_REVIEW` — a story links ritual timing with a natural event; timing alone is never treated as proof.

## Severity

- `INFO` — monitor only.
- `WATCH` — review when practical.
- `HIGH` — prioritize evidence review.
- `CRITICAL` — prioritize immediately because evidence volume, source concentration or potential public impact is unusually high.

All alerts preserve the underlying URLs and timestamps. They do not create a religious verdict automatically.
