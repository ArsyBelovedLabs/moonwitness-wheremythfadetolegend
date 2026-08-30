import { readFile } from 'node:fs/promises'

const evidence = JSON.parse(await readFile('data/2026/08/evidence.json', 'utf8'))
const items = Array.isArray(evidence) ? evidence : evidence.items || []
const results = []
for (const item of items) {
  const url = item.url || item.source_url
  if (!url || !/^https?:\/\//i.test(url)) {
    results.push({ id: item.id || null, url: url || null, status: 'invalid-url' })
    continue
  }
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'MoonWitness Source Health/1.0' } })
    results.push({ id: item.id || null, url, status: r.ok ? 'ok' : `http-${r.status}`, finalUrl: r.url })
  } catch (error) {
    results.push({ id: item.id || null, url, status: 'error', error: String(error.message || error) })
  }
}
const failed = results.filter(x => x.status !== 'ok')
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), checked: results.length, failed: failed.length, results }, null, 2))
if (failed.length > 0 && process.env.FAIL_ON_SOURCE_ERRORS === '1') process.exit(1)
