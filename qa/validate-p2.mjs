import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const errors = []
const readJson = async path => JSON.parse(await readFile(join(root, path), 'utf8'))
const isUrl = value => typeof value === 'string' && /^https?:\/\/[^\s]+$/i.test(value)
const scoreKeys = ['evidence_score','tauhid_gap','causality']

const registry = await readJson('data/index.json')
if (!Array.isArray(registry.months) || !registry.months.length) errors.push('Registry has no months')

const observationIds = new Set()
const evidenceUrls = new Set()
for (const month of registry.months ?? []) {
  const report = await readJson(month.path)
  const issues = await readJson(month.issues)
  const evidence = await readJson(month.evidence)
  const revelation = await readJson(month.revelation)

  for (const o of report.observations ?? []) {
    const id = o.id || `${month.id}|${o.date}|${o.location}|${o.practice}`
    if (observationIds.has(id)) errors.push(`Duplicate observation: ${id}`)
    observationIds.add(id)
    for (const key of scoreKeys) {
      if (o[key] != null && (!Number.isFinite(Number(o[key])) || Number(o[key]) < 0 || Number(o[key]) > 100)) errors.push(`${month.id}: ${key} out of range in ${id}`)
    }
    if (o.source && !isUrl(o.source)) errors.push(`${month.id}: invalid observation source URL in ${id}`)
  }

  for (const e of evidence ?? []) {
    if (e.url && !isUrl(e.url)) errors.push(`${month.id}: invalid evidence URL: ${e.title || 'untitled'}`)
    if (e.url) {
      if (evidenceUrls.has(e.url)) errors.push(`Duplicate evidence URL: ${e.url}`)
      evidenceUrls.add(e.url)
    }
  }

  for (const r of revelation.traditions ?? []) {
    if (!r.key || !r.name || !Array.isArray(r.references) || !r.references.length) errors.push(`${month.id}: malformed revelation entry`)
    if (r.url && !isUrl(r.url)) errors.push(`${month.id}: invalid revelation URL: ${r.name}`)
  }

  if (!Array.isArray(issues)) errors.push(`${month.id}: issues must be an array`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`P2 QA passed: ${registry.months.length} month(s), ${observationIds.size} observations, ${evidenceUrls.size} unique evidence URLs.`)
