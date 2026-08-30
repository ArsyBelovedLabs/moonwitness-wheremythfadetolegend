import { readFile } from 'node:fs/promises'

const evidence = JSON.parse(await readFile('data/2026/08/evidence.json', 'utf8'))
const disasters = JSON.parse(await readFile('data/2026/08/disasters.json', 'utf8'))
const evidenceItems = Array.isArray(evidence) ? evidence : evidence.items || []
const disasterItems = (disasters.events || []).map(item => ({
  id: item.id,
  url: item.source?.url,
  title: item.source?.title,
  source_kind: 'disaster',
}))
const contextItems = (disasters.context_signals || []).map(item => ({
  id: item.id,
  url: item.url,
  title: item.title,
  source_kind: 'disaster-context',
}))
const items = [
  ...evidenceItems.map(item => ({ ...item, source_kind: item.source_kind || 'evidence' })),
  ...disasterItems,
  ...contextItems,
]

const results = []
for (const item of items) {
  const url = item.url || item.source_url
  if (!url || !/^https?:\/\//i.test(url)) {
    results.push({ id: item.id || null, kind: item.source_kind, url: url || null, status: 'invalid-url' })
    continue
  }
  try {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'MoonWitness Source Health/2.0' } })
    if (r.status === 405 || r.status === 403) {
      r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'MoonWitness Source Health/2.0', range: 'bytes=0-1024' } })
    }
    results.push({ id: item.id || null, kind: item.source_kind, url, status: r.ok ? 'ok' : `http-${r.status}`, finalUrl: r.url })
  } catch (error) {
    results.push({ id: item.id || null, kind: item.source_kind, url, status: 'error', error: String(error.message || error) })
  }
}
const failed = results.filter(x => x.status !== 'ok')
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), checked: results.length, failed: failed.length, results }, null, 2))
if (failed.length > 0 && process.env.FAIL_ON_SOURCE_ERRORS === '1') process.exit(1)
