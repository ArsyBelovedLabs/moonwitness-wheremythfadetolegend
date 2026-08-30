import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { method } from './_utils.js'

export default async function handler(req, res) {
  if (!method(req, res)) return
  try {
    const month = String(req.query?.month || '2026-09')
    const [year, mm] = month.split('-')
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(mm)) throw new Error('Invalid month')
    const file = join(process.cwd(), 'data', year, mm, 'candidates.json')
    const data = JSON.parse(await readFile(file, 'utf8'))
    const items = Array.isArray(data.candidates) ? data.candidates : []
    res.statusCode = 200
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ schemaVersion: data.schemaVersion || '1.0.0', month, workflow: data.workflow || [], policy: data.policy, count: items.length, items }))
  } catch (error) {
    res.statusCode = 404
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Candidate dataset not found', detail: String(error.message || error) }))
  }
}
