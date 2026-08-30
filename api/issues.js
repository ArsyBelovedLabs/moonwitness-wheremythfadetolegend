import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { method } from './_utils.js'

export default async function handler(req, res) {
  if (!method(req, res)) return
  try {
    const month = String(req.query?.month || '2026-08')
    const [year, mm] = month.split('-')
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(mm)) throw new Error('Invalid month')
    const file = join(process.cwd(), 'data', year, mm, 'issues.json')
    const data = JSON.parse(await readFile(file, 'utf8'))
    const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : [])
    res.statusCode = 200
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ schemaVersion: '1.0.0', month, count: items.length, items }))
  } catch (error) {
    res.statusCode = 404
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Issue dataset not found', detail: String(error.message || error) }))
  }
}
