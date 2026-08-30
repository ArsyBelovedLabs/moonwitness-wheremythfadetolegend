# Observatory Monitoring

The six-hour monitor is an evidence collector, not an automatic theological classifier.

## Schedule

GitHub Actions runs the collector at `0 */6 * * *` (UTC): four times per day.

## Sources

The first connector uses public Google News RSS search results across the configured Indonesia-focused query registry.

## Lifecycle

`COLLECTED` → `UNREVIEWED` → `VERIFIED` → optionally linked to an `Observation` → `Issue` → `Resolution`.

A collected item must not automatically receive a Tauhid Gap, religious verdict, actor attribution, or causal claim. Those fields belong to reviewed datasets.

## Files

- `queries.json` — monitoring query registry.
- `latest.json` — newest collector snapshot.
- `runs/YYYY-MM-DD/HHmm/snapshot.json` — immutable run snapshot.
- `seen.json` — de-duplication index.
