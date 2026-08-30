import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = [
  'data/index.json',
  'data/2026/08/report.json',
  'data/2026/08/issues.json',
  'data/2026/08/evidence.json',
  'data/2026/08/revelation.json',
];

const readJson = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const errors = [];
for (const file of required) {
  try { await readJson(file); } catch (error) { errors.push(`${file}: ${error.message}`); }
}

try {
  const registry = await readJson('data/index.json');
  if (!Array.isArray(registry.months) || !registry.months.length) errors.push('data/index.json: months must be a non-empty array');
  for (const month of registry.months || []) {
    for (const key of ['path','issues','evidence','revelation']) {
      if (!month[key]) errors.push(`${month.id || 'unknown month'}: missing ${key}`);
    }
  }
} catch {}

try {
  const report = await readJson('data/2026/08/report.json');
  if (!Array.isArray(report.observations) || !report.observations.length) errors.push('August report: observations must be a non-empty array');
  for (const [i, row] of (report.observations || []).entries()) {
    for (const key of ['date','location','practice','evidence_score','tauhid_gap','causality','source']) {
      if (row[key] === undefined || row[key] === '') errors.push(`August observation ${i}: missing ${key}`);
    }
  }
} catch {}

if (errors.length) {
  console.error(`QA FAILED — ${errors.length} issue(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('QA PASSED — registry and August core datasets are valid.');
