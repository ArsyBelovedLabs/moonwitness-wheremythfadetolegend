import { readFile, writeFile } from 'node:fs/promises'

const latest = JSON.parse(await readFile('data/monitor/latest.json', 'utf8'))

const rules = [
  { key: 'mythos', label: 'MYTHOS', terms: ['myth', 'legend', 'folklore', 'spirit', 'ancestor', 'sacred place', 'sacred object', 'astrology', 'zodiac', 'divination', 'fortune telling', 'mystic'] },
  { key: 'ritual', label: 'RITUAL', terms: ['ritual', 'ceremony', 'offering', 'incense', 'prayer', 'blessing', 'protection', 'sacrifice', 'invocation', 'amulet'] },
  { key: 'tauhid-signal', label: 'TAUHID SIGNAL', terms: ['worship', 'idol', 'deity', 'spirit worship', 'ancestor worship', 'supernatural power', 'ask protection', 'ask blessing'] },
]

const WORKFLOW = ['DISCOVERED', 'SOURCE_CHECK', 'VERIFIED', 'ANALYZED', 'PUBLISHED']

const classify = item => {
  const text = `${item.title} ${item.description} ${item.query}`.toLowerCase()
  const matches = rules.filter(r => r.terms.some(term => text.includes(term)))
  const primary = matches[0] || { key: 'other', label: 'OTHER', terms: [] }
  const score = matches.reduce((n, m) => n + m.terms.filter(t => text.includes(t)).length, 0)
  return {
    signalId: `SIG-${Buffer.from(item.guid || item.url).toString('base64url').slice(0, 10).toUpperCase()}`,
    status: 'DISCOVERED',
    type: primary.label,
    candidateCategories: matches.map(m => m.label),
    matchCount: score,
    title: item.title,
    url: item.url,
    source: item.source || null,
    published: item.published || null,
    query: item.query,
    collectedAt: item.collectedAt,
    reviewRequired: true,
    note: 'Keyword classification is triage only. DISCOVERED is not VERIFIED and no religious or causal verdict is assigned automatically.',
  }
}

const signals = (latest.items || []).map(classify)
const alerts = []
if (signals.length >= 10) alerts.push({ type: 'SIGNAL_BURST', severity: 'medium', message: `${signals.length} new DISCOVERED signals detected in this cycle.` })
if (signals.filter(s => s.type === 'TAUHID SIGNAL').length >= 3) alerts.push({ type: 'TAUHID_REVIEW_BURST', severity: 'high', message: 'Multiple candidate Tauhid signals require source review.' })

const generatedAt = new Date().toISOString()
await writeFile('data/monitor/signals.json', JSON.stringify({ schemaVersion: '2.0.0', generatedAt, workflow: WORKFLOW, count: signals.length, signals, alerts }, null, 2) + '\n')

// Current-month candidate ledger. Automated code may create/update DISCOVERED rows only.
const now = new Date()
const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).formatToParts(now)
const year = parts.find(p => p.type === 'year')?.value
const month = parts.find(p => p.type === 'month')?.value
const candidatePath = `data/${year}/${month}/candidates.json`

try {
  const ledger = JSON.parse(await readFile(candidatePath, 'utf8'))
  const byId = new Map((ledger.candidates || []).map(x => [x.id, x]))
  for (const signal of signals) {
    const id = signal.signalId.replace(/^SIG-/, 'CAND-')
    const existing = byId.get(id)
    if (existing && existing.status !== 'DISCOVERED') continue
    byId.set(id, {
      id,
      status: 'DISCOVERED',
      title: signal.title,
      url: signal.url,
      source: signal.source,
      published: signal.published,
      query: signal.query,
      type: signal.type,
      candidateCategories: signal.candidateCategories,
      matchCount: signal.matchCount,
      firstSeen: existing?.firstSeen || signal.collectedAt || generatedAt,
      lastSeen: signal.collectedAt || generatedAt,
      sourceCheck: existing?.sourceCheck || { status: 'PENDING', checkedAt: null, notes: null },
      verification: existing?.verification || { status: 'NOT_VERIFIED', evidenceIds: [] },
      analysis: existing?.analysis || { status: 'NOT_ANALYZED', issueIds: [] },
      publication: existing?.publication || { status: 'NOT_PUBLISHED', observationId: null },
      note: 'Automated discovery only; promotion requires explicit source verification.'
    })
  }
  ledger.schemaVersion = '1.1.0'
  ledger.workflow = WORKFLOW
  ledger.updatedAt = generatedAt
  ledger.candidates = [...byId.values()]
  await writeFile(candidatePath, JSON.stringify(ledger, null, 2) + '\n')
} catch (error) {
  console.log(`Candidate ledger not written (${candidatePath}): ${error.message}`)
}

console.log(JSON.stringify({ signals: signals.length, alerts: alerts.length, candidatePath }, null, 2))
