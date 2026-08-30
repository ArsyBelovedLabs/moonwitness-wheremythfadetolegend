import { readFile, writeFile } from 'node:fs/promises'

const latest = JSON.parse(await readFile('data/monitor/latest.json', 'utf8'))
const taxonomy = JSON.parse(await readFile('data/taxonomy/mythos.json', 'utf8').catch(() => '{"categories":[]}'))

const rules = [
  { key: 'mythos', label: 'MYTHOS', terms: ['myth', 'legend', 'folklore', 'spirit', 'ancestor', 'sacred place', 'sacred object', 'astrology', 'zodiac', 'divination', 'fortune telling', 'mystic'] },
  { key: 'ritual', label: 'RITUAL', terms: ['ritual', 'ceremony', 'offering', 'incense', 'prayer', 'blessing', 'protection', 'sacrifice', 'invocation', 'amulet'] },
  { key: 'tauhid-signal', label: 'TAUHID SIGNAL', terms: ['worship', 'idol', 'deity', 'spirit worship', 'ancestor worship', 'supernatural power', 'ask protection', 'ask blessing'] },
]

const classify = item => {
  const text = `${item.title} ${item.description} ${item.query}`.toLowerCase()
  const matches = rules.filter(r => r.terms.some(term => text.includes(term)))
  const primary = matches[0] || { key: 'other', label: 'OTHER', terms: [] }
  const score = matches.reduce((n, m) => n + m.terms.filter(t => text.includes(t)).length, 0)
  return {
    signalId: `SIG-${Buffer.from(item.guid || item.url).toString('base64url').slice(0, 10).toUpperCase()}`,
    status: 'DETECTED',
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
    note: 'Keyword classification is triage only; no religious or causal verdict is assigned automatically.',
  }
}

const signals = (latest.items || []).map(classify)
const alerts = []
if (signals.length >= 10) alerts.push({ type: 'SIGNAL_BURST', severity: 'medium', message: `${signals.length} new signals detected in this cycle.` })
if (signals.filter(s => s.type === 'TAUHID SIGNAL').length >= 3) alerts.push({ type: 'TAUHID_REVIEW_BURST', severity: 'high', message: 'Multiple candidate Tauhid signals require human review.' })

await writeFile('data/monitor/signals.json', JSON.stringify({ schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), count: signals.length, signals, alerts }, null, 2) + '\n')
console.log(JSON.stringify({ signals: signals.length, alerts: alerts.length }))
