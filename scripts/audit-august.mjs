import { readFile } from 'node:fs/promises'

const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const evidence = await readJson('data/2026/08/evidence.json')
const revelation = await readJson('data/2026/08/revelation.json')
const report = await readJson('data/2026/08/report.json')
const issues = await readJson('data/2026/08/issues.json')

const requiredTraditions = new Set(['Q', 'I', 'T', 'Z'])
const traditions = new Set((revelation.traditions || []).map(x => x.key))
for (const key of requiredTraditions) {
  if (!traditions.has(key)) throw new Error(`Missing revelation tradition: ${key}`)
}
for (const row of revelation.traditions || []) {
  if (!row.name || !row.references?.length || !/^https:\/\//.test(row.url || '')) {
    throw new Error(`Incomplete revelation reference: ${row.key || 'unknown'}`)
  }
}
for (const row of evidence) {
  if (!row.title || !/^https?:\/\//.test(row.url || '')) {
    throw new Error(`Incomplete evidence URL: ${row.title || 'unknown'}`)
  }
}
for (const observation of report.observations || []) {
  if (!observation.id || observation.tauhid_gap == null || observation.evidence_score == null || observation.causality == null) {
    throw new Error(`Incomplete observation: ${observation.id || observation.practice || 'unknown'}`)
  }
}
for (const issue of issues || []) {
  if (!issue.id || !issue.issue || !issue.status) throw new Error(`Incomplete issue: ${issue.id || 'unknown'}`)
}

console.log(JSON.stringify({
  status: 'PASS',
  observations: (report.observations || []).length,
  evidence: evidence.length,
  issues: issues.length,
  revelationTraditions: traditions.size,
  rule: 'scores and causal claims remain separate from source evidence'
}, null, 2))
