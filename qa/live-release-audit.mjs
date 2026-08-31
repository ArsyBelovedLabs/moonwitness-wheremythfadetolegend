const checks = [
  ['web-canonical', 'https://moonwitness.biz.id/'],
  ['web-legacy-alias', 'https://myth.moonwitness.biz.id/'],
  ['command-center', 'https://cc.moonwitness.biz.id/'],
  ['api-health', 'https://api.moonwitness.biz.id/v1/health'],
  ['api-openapi', 'https://api.moonwitness.biz.id/openapi.json'],
  ['api-readiness', 'https://api.moonwitness.biz.id/v1/readiness'],
]

const results = []
for (const [id, url] of checks) {
  const startedAt = Date.now()
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20_000) })
    results.push({ id, url, status: response.status, ok: response.ok, finalUrl: response.url, latencyMs: Date.now() - startedAt })
  } catch (error) {
    results.push({ id, url, status: null, ok: false, error: error instanceof Error ? error.name : 'request_failed', latencyMs: Date.now() - startedAt })
  }
}

const hardFailures = results.filter(item => ['web-canonical', 'web-legacy-alias', 'command-center', 'api-health', 'api-openapi'].includes(item.id) && !item.ok)
const warnings = results.filter(item => item.id === 'api-readiness' && !item.ok)
const report = {
  checkedAt: new Date().toISOString(),
  release: 'moonwitness-primary-web',
  canonical: 'https://moonwitness.biz.id/',
  alias: 'https://myth.moonwitness.biz.id/',
  status: hardFailures.length ? 'blocked' : warnings.length ? 'degraded' : 'ready',
  hardFailures: hardFailures.map(item => item.id),
  warnings: warnings.map(item => `${item.id}:${item.status ?? 'offline'}`),
  results,
}
console.log(JSON.stringify(report, null, 2))
if (hardFailures.length) process.exitCode = 1
