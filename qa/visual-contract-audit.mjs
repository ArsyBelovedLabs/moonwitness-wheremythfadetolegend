import fs from 'node:fs'

const files = {
  main: fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8'),
  shared: fs.readFileSync(new URL('../src/SharedInstrumentLayer.jsx', import.meta.url), 'utf8'),
  research: fs.readFileSync(new URL('../src/ResearchInstrument.jsx', import.meta.url), 'utf8'),
}

const activeSource = Object.values(files).join('\n')
const failures = []
const requireMatch = (condition, message) => { if (!condition) failures.push(message) }

requireMatch(!activeSource.includes('@arsybelovedlabs/moonwitness-design-system'), 'Active public Web must not consume moonwitness-design-system as reusable runtime UI.')
requireMatch(files.main.includes('@arsybelovedlabs/moonwitness-frontend-platform'), 'Application shell/provider must come from moonwitness-frontend-platform.')

const sharedNav = files.shared.match(/const NAV = \[([\s\S]*?)\n\]/)?.[1] || ''
const sharedNavIds = [...sharedNav.matchAll(/id: '([^']+)'/g)].map(match => match[1])
const expectedNavIds = ['report', 'spread-map', 'disaster-map', 'correlation', 'review', 'evidence', 'revelation', 'pipeline']
requireMatch(JSON.stringify(sharedNavIds) === JSON.stringify(expectedNavIds), `Top-level public navigation must be exactly ${expectedNavIds.join(', ')}; got ${sharedNavIds.join(', ') || 'none'}.`)
requireMatch(!activeSource.includes('Live ResearchRun'), 'Live ResearchRun must not appear as a public top-level navigation surface.')
requireMatch(!sharedNav.includes('research-run'), 'research-run must not be a public top-level navigation item.')

for (const label of ['Monthly Report', 'Spread Map', 'Disaster Map', 'Correlation Engine', 'Practice-Level Review', 'Evidence', 'Four Revelation Lens', 'Candidate Pipeline']) {
  requireMatch(sharedNav.includes(label), `Missing canonical public navigation label: ${label}`)
}

requireMatch(activeSource.includes('Temporal/geographic proximity does not establish causation.'), 'Exact causality guardrail is required in the active UI source.')
requireMatch(activeSource.includes('PRACTICE-LEVEL REVIEW ONLY'), 'Practice review must carry the exact scope guardrail.')
requireMatch(activeSource.includes('FROZEN BASELINE'), 'August 2026 historical state must be explicitly labelled FROZEN BASELINE.')
requireMatch(files.research.includes("const REVELATION_KEYS = ['Q', 'I', 'T', 'Z']"), 'Four Revelation Lens must declare canonical Q/I/T/Z ordering.')
requireMatch(!files.research.includes("if (root === 'research-run')"), 'Detailed public app must not special-case a hidden research-run public route.')

if (failures.length) {
  console.error('Visual contract audit FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Visual contract audit PASS')
console.log(`- public navigation: ${sharedNavIds.length} canonical surfaces`)
console.log('- reusable UI owner: moonwitness-frontend-platform')
console.log('- frozen baseline, practice scope, causality, and four-lens guardrails present')
