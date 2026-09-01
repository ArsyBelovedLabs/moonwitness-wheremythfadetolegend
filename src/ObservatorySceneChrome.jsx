import React, { useEffect, useState } from 'react'
import { MoonWitnessIcon } from '@arsybelovedlabs/moonwitness-frontend-platform'
import './observatory-scene-chrome.css'

const TASKS = {
  report: ['Monthly Report', 'observation'],
  'spread-map': ['Spread Map', 'coordinate'],
  'disaster-map': ['Disaster Map', 'epicenter'],
  correlation: ['Correlation Engine', 'correlation'],
  review: ['Practice-Level Review', 'inspect'],
  evidence: ['Evidence', 'evidence'],
  revelation: ['Four Revelation Lens', 'source'],
  pipeline: ['Candidate Pipeline', 'trace'],
}

const routeRoot = () => (window.location.hash.slice(1) || 'report/2026-08').split('/')[0]

export default function ObservatorySceneChrome() {
  const [root, setRoot] = useState(routeRoot)

  useEffect(() => {
    const onHash = () => setRoot(routeRoot())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  const [label, icon] = TASKS[root] || TASKS.report

  return <div className="observatory-scene-chrome" aria-label="Observatory scene state">
    <div className="observatory-scene-chrome__calibration" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
    </div>

    <div className="observatory-scene-chrome__cell is-mode">
      <MoonWitnessIcon name="observation" size={17} />
      <span><small>OPERATING MODE</small><strong>OBSERVE</strong></span>
    </div>

    <div className="observatory-scene-chrome__cell is-task">
      <MoonWitnessIcon name={icon} size={18} />
      <span><small>ACTIVE INSTRUMENT</small><strong>{label}</strong></span>
    </div>

    <div className="observatory-scene-chrome__cell is-state">
      <MoonWitnessIcon name="chronology" size={17} />
      <span><small>DATA STATE</small><strong>FROZEN BASELINE · AUGUST 2026</strong></span>
    </div>

    <div className="observatory-scene-chrome__guardrail">
      <MoonWitnessIcon name="verified" size={15} />
      <strong>EVIDENCE-FIRST</strong>
      <i aria-hidden="true" />
      <span>Temporal/geographic proximity does not establish causation.</span>
    </div>
  </div>
}
