import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const readJson = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'))
const errors = []
const required = [
  'data/index.json',
  'data/2026/08/report.json', 'data/2026/08/issues.json', 'data/2026/08/evidence.json', 'data/2026/08/revelation.json',
  'data/2026/08/observations.geo.json', 'data/2026/08/disasters.json', 'data/2026/08/correlations.json',
  'data/2026/09/report.json', 'data/2026/09/issues.json', 'data/2026/09/evidence.json', 'data/2026/09/revelation.json',
  'data/2026/09/observations.geo.json', 'data/2026/09/disasters.json', 'data/2026/09/correlations.json', 'data/2026/09/candidates.json',
]
for (const file of required) {
  try { await readJson(file) } catch (error) { errors.push(`${file}: ${error.message}`) }
}

try {
  const registry = await readJson('data/index.json')
  if (!Array.isArray(registry.months) || !registry.months.length) errors.push('data/index.json: months must be a non-empty array')
  for (const month of registry.months || []) {
    for (const key of ['path','issues','evidence','revelation','geography','disasters','correlations']) {
      if (!month[key]) errors.push(`${month.id || 'unknown month'}: missing ${key}`)
    }
    if (month.status === 'collecting' && !month.candidates) errors.push(`${month.id}: collecting month must register candidates`)
  }
} catch {}

try {
  const report = await readJson('data/2026/08/report.json')
  if ((report.observations || []).length !== 17) errors.push(`August report: expected frozen 17 observations, got ${(report.observations || []).length}`)
  for (const [i,row] of (report.observations || []).entries()) {
    for (const key of ['date','location','practice','evidence_score','tauhid_gap','causality','source']) if (row[key] === undefined || row[key] === '') errors.push(`August observation ${i}: missing ${key}`)
  }

  const geo = await readJson('data/2026/08/observations.geo.json')
  if ((geo.observations || []).length !== 17) errors.push(`August geography: expected 17 metadata rows, got ${(geo.observations || []).length}`)
  const reportKeys = new Set((report.observations || []).map(x => `${x.date}|${x.location}|${x.practice}`))
  for (const row of geo.observations || []) {
    const key = `${row.match?.date}|${row.match?.location}|${row.match?.practice}`
    if (!reportKeys.has(key)) errors.push(`August geography ${row.id}: no exact frozen observation match`)
    if (row.geography?.map_enabled && (!Number.isFinite(row.geography.lat) || !Number.isFinite(row.geography.lon))) errors.push(`August geography ${row.id}: mapped row needs numeric lat/lon`)
  }
} catch {}

try {
  const disasters = await readJson('data/2026/08/disasters.json')
  for (const row of disasters.events || []) {
    for (const key of ['id','date_start','location','type','evidence_score','source','causality']) if (row[key] === undefined || row[key] === '') errors.push(`Disaster ${row.id || '?'}: missing ${key}`)
    if (!Number.isFinite(row.coordinates?.lat) || !Number.isFinite(row.coordinates?.lon)) errors.push(`Disaster ${row.id}: missing coordinates`)
    if (!row.source?.url || !row.source?.publisher) errors.push(`Disaster ${row.id}: incomplete independent source`)
  }
  const disasterIds = new Set((disasters.events || []).map(x => x.id))
  const geo = await readJson('data/2026/08/observations.geo.json')
  const observationIds = new Set((geo.observations || []).map(x => x.id))
  const correlations = await readJson('data/2026/08/correlations.json')
  for (const row of correlations.reviews || []) {
    if (!disasterIds.has(row.disaster_id)) errors.push(`Correlation ${row.id}: unknown disaster_id`)
    if (row.observation_id && !observationIds.has(row.observation_id)) errors.push(`Correlation ${row.id}: unknown observation_id`)
    if (row.proximity_score === row.repository_causality_score && Number(row.proximity_score) > 20) errors.push(`Correlation ${row.id}: suspicious identical proximity/causality scores`)
  }
} catch {}

try {
  const september = await readJson('data/2026/09/report.json')
  if (september.status !== 'collecting') errors.push('September report must start in collecting state')
  if ((september.observations || []).length !== 0) errors.push('September published observation ledger must start empty')
  const candidates = await readJson('data/2026/09/candidates.json')
  const expected = ['DISCOVERED','SOURCE_CHECK','VERIFIED','ANALYZED','PUBLISHED']
  if (JSON.stringify(candidates.workflow) !== JSON.stringify(expected)) errors.push('September candidate workflow does not match contract')
  for (const row of candidates.candidates || []) if (!expected.includes(row.status)) errors.push(`Candidate ${row.id}: invalid status ${row.status}`)
} catch {}

if (errors.length) {
  console.error(`QA FAILED — ${errors.length} issue(s)`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log('QA PASSED — August frozen report, geography/disaster/correlation contracts, and September pipeline are valid.')
