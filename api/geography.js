import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { method } from './_utils.js'

export default async function handler(req, res) {
  if (!method(req, res)) return
  try {
    const month = String(req.query?.month || '2026-08')
    const [year, mm] = month.split('-')
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(mm)) throw new Error('Invalid month')
    const file = join(process.cwd(), 'data', year, mm, 'observations.geo.json')
    const data = JSON.parse(await readFile(file, 'utf8'))
    const items = Array.isArray(data.observations) ? data.observations : []
    res.statusCode = 200
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ schemaVersion: data.schemaVersion || '1.0.0', month, count: items.length, purpose: data.purpose, items }))
  } catch (error) {
    res.statusCode = 404
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Geography dataset not found', detail: String(error.message || error) }))
  }
}
