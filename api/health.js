import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.end()
    return
  }
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const now = Date.now()
  let monitor = { status: 'unknown' }
  try {
    const data = JSON.parse(await readFile(join(process.cwd(), 'data/monitor/latest.json'), 'utf8'))
    const collectedAt = Date.parse(data.collectedAt || '')
    const ageHours = Number.isFinite(collectedAt) ? (now - collectedAt) / 36e5 : null
    monitor = {
      status: ageHours != null && ageHours <= 12 ? 'healthy' : 'stale',
      collectedAt: data.collectedAt || null,
      ageHours: ageHours == null ? null : Number(ageHours.toFixed(2)),
      newItemCount: Number(data.newItemCount || 0),
      errorCount: Number(data.errorCount || 0),
    }
  } catch (error) {
    monitor = { status: 'missing', error: String(error.message || error) }
  }

  res.statusCode = 200
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({
    service: 'where-myth-fade-to-legend',
    status: monitor.status === 'healthy' ? 'ok' : 'degraded',
    checkedAt: new Date(now).toISOString(),
    monitor,
  }))
}
