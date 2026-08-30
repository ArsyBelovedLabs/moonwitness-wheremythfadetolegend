import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const month = process.argv[2] || '2026-08'
const [year, mm] = month.split('-')
if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(mm)) throw new Error('Usage: node scripts/export-report.mjs YYYY-MM')
const base = join('data', year, mm)
const [report, issues, evidence, revelation] = await Promise.all([
  readFile(join(base, 'report.json'), 'utf8').then(JSON.parse),
  readFile(join(base, 'issues.json'), 'utf8').then(JSON.parse),
  readFile(join(base, 'evidence.json'), 'utf8').then(JSON.parse),
  readFile(join(base, 'revelation.json'), 'utf8').then(JSON.parse),
])
const md = [
  `# WHERE MYTH FADE TO LEGEND — ${month}`,
  '',
  report.title ? `## ${report.title}` : '',
  report.summary || '',
  '',
  `### Observations (${(report.observations || []).length})`,
  ...(report.observations || []).map((o) => `- **${o.date} · ${o.location}** — ${o.practice}. Evidence ${o.evidence_score ?? '—'}/100; Tauhid Gap ${o.tauhid_gap ?? '—'}/100; Causality ${o.causality ?? '—'}/100.`),
  '',
  `### Issues (${Array.isArray(issues) ? issues.length : 0})`,
  ...(Array.isArray(issues) ? issues : issues.items || []).map((i) => `- **${i.id || 'ISSUE'}** — ${i.issue || i.title || 'Issue'} — ${i.priority || 'REVIEW'}.`),
  '',
  `### Evidence (${Array.isArray(evidence) ? evidence.length : 0})`,
  ...(Array.isArray(evidence) ? evidence : evidence.items || []).map((e) => `- **${e.id || 'SOURCE'}** — ${e.title || e.source || 'Source'} — ${e.url || e.source_url || ''}`),
  '',
  '### Four Revelation Lens',
  JSON.stringify(revelation, null, 2),
  '',
  '### Method note',
  'Scores are attached to specific observations/practices. Monitoring signals are candidates until reviewed. Timing or correlation is not treated as proof of causality.',
].join('\n')

await mkdir('exports', { recursive: true })
const output = join('exports', `${month}-report.md`)
await writeFile(output, md)
console.log(output)
