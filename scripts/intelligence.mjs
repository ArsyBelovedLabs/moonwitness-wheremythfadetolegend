import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const latestPath = join(root, 'data/monitor/latest.json')
const policyPath = join(root, 'data/monitor/intelligence-policy.json')
const analyticsPath = join(root, 'data/monitor/analytics-schema.json')
const latest = JSON.parse(await readFile(latestPath, 'utf8'))
const policy = JSON.parse(await readFile(policyPath, 'utf8'))
const analytics = JSON.parse(await readFile(analyticsPath, 'utf8'))

const rules = [
  ['MYTHOS', /astrolog|zodiac|folklore|legend|spirit|ancestor|sacred object|sacred place|supernatural/i],
  ['RITUAL', /ritual|offering|sacrifice|invocation|prayer|protection|blessing|amulet|ceremony|worship/i],
  ['RELIGIOUS_PRACTICE_SIGNAL', /divination|fortune telling|idol|deity|spiritual power|asking protection|asking blessing/i]
]

const classify = text => {
  const labels = []
  for (const [label, regex] of rules) if (regex.test(text)) labels.push(label)
  return labels.length ? labels : ['GENERAL_CONTEXT']
}

const items = (latest.items || []).map((item, index) => {
  const text = `${item.title || ''} ${item.description || ''}`
  const labels = classify(text)
  return {
    signalId: `SIG-${latest.runId.replaceAll('/', '-').replaceAll(':', '')}-${String(index + 1).padStart(3, '0')}`,
    status: 'DETECTED',
    signalTypes: labels,
    title: item.title,
    url: item.url,
    published: item.published || null,
    source: item.source || null,
    query: item.query || null,
    collectedAt: item.collectedAt,
    reviewRequired: labels.some(x => x !== 'GENERAL_CONTEXT')
  }
})

const counts = Object.fromEntries(['MYTHOS','RITUAL','RELIGIOUS_PRACTICE_SIGNAL','GENERAL_CONTEXT'].map(k => [k, 0]))
for (const item of items) for (const type of item.signalTypes) counts[type] = (counts[type] || 0) + 1

const alerts = []
if (items.length >= analytics.alerts.new_signal_threshold) alerts.push({ type: 'NEW_SIGNAL_BURST', severity: 'WATCH', count: items.length })
if (latest.errors?.length) alerts.push({ type: 'COLLECTOR_ERRORS', severity: latest.errors.length >= 3 ? 'HIGH' : 'WATCH', count: latest.errors.length })
if (items.length && items.filter(x => x.signalTypes.includes('RITUAL')).length) alerts.push({ type: 'REVIEW_REQUIRED', severity: 'INFO', count: items.filter(x => x.signalTypes.includes('RITUAL')).length })

const output = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  monitorRun: latest.runId,
  status: 'DETECTED',
  counts,
  alerts,
  policyVersion: policy.version,
  items
}

await writeFile(join(root, 'data/monitor/signals.json'), JSON.stringify(output, null, 2) + '\n')
console.log(JSON.stringify({ signals: items.length, alerts: alerts.length, counts }, null, 2))
