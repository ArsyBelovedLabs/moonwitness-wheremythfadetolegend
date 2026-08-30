import { readFile } from 'node:fs/promises'

const data = JSON.parse(await readFile('data/monitor/latest.json', 'utf8'))
const collected = Date.parse(data.collectedAt || '')
if (!Number.isFinite(collected)) throw new Error('latest.json has no valid collectedAt')
const ageHours = (Date.now() - collected) / 36e5
console.log(JSON.stringify({ collectedAt: data.collectedAt, ageHours: Number(ageHours.toFixed(2)), newItemCount: data.newItemCount || 0, errorCount: data.errorCount || 0 }, null, 2))
if (ageHours > 7) throw new Error(`Monitoring snapshot is stale: ${ageHours.toFixed(2)}h old`)
