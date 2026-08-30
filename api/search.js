import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  try {
    const registry = JSON.parse(await readFile(join(process.cwd(), 'data/index.json'), 'utf8'))
    const q = String(req.query?.q || '').trim().toLowerCase()
    if (!q) {
      res.statusCode = 200
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ schemaVersion: '1.0.0', count: 0, items: [] }))
      return
    }
    const results = []
    for (const month of registry.months || []) {
      const [year, mm] = month.id.split('-')
      const base = join(process.cwd(), 'data', year, mm)
      const report = await readFile(join(base, 'report.json'), 'utf8').then(JSON.parse).catch(() => null)
      const issues = await readFile(join(base, 'issues.json'), 'utf8').then(JSON.parse).catch(() => [])
      const evidence = await readFile(join(base, 'evidence.json'), 'utf8').then(JSON.parse).catch(() => [])
      for (const o of report?.observations || []) {
        if (`${o.date} ${o.location} ${o.actor} ${o.practice} ${o.summary}`.toLowerCase().includes(q)) results.push({ type: 'observation', month: month.id, id: o.id || null, title: o.practice, location: o.location })
      }
      for (const i of (Array.isArray(issues) ? issues : issues.items || [])) {
        if (`${i.id} ${i.issue || i.title} ${i.description || ''}`.toLowerCase().includes(q)) results.push({ type: 'issue', month: month.id, id: i.id || null, title: i.issue || i.title })
      }
      for (const e of (Array.isArray(evidence) ? evidence : evidence.items || [])) {
        if (`${e.id} ${e.title || ''} ${e.source || ''} ${e.url || ''}`.toLowerCase().includes(q)) results.push({ type: 'evidence', month: month.id, id: e.id || null, title: e.title || e.source || 'Evidence', url: e.url || e.source_url || null })
      }
    }
    res.statusCode = 200
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ schemaVersion: '1.0.0', query: q, count: results.length, items: results.slice(0, 200) }))
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Search failed', detail: String(error.message || error) }))
  }
}
