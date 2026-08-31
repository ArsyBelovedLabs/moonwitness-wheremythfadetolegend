import React from 'react'
import {
  CausalityGuardrail,
  EvidenceSpine,
  ObservationShard,
  OrbitalCore,
  ReliabilityPrism,
  SignalBeacon,
  TemporalOrrery,
} from '@arsybelovedlabs/moonwitness-design-system'

const average = values => {
  const nums = values.map(Number).filter(Number.isFinite)
  return nums.length ? Math.round(nums.reduce((sum, value) => sum + value, 0) / nums.length) : 0
}

export function DatasetBeacon({ status }) {
  const final = status === 'final'
  return <div className="repo-chip signature-beacon"><SignalBeacon tone={final ? 'success' : 'warning'} label={final ? 'DATASET / FINAL' : 'DATASET / COLLECTING'} /></div>
}

export function ObservatoryAperture({ month, report, observations, disasters, issues, evidence, relationRows }) {
  const mapped = observations.filter(item => item._geo?.map_enabled).length
  const reviewed = relationRows.filter(item => item.kind === 'reviewed').length
  const avgEvidence = average(observations.map(item => item.evidence_score))
  const causalKpi = (report?.kpis || []).find(item => String(item.label).toLowerCase().includes('causal'))
  const uniqueDates = [...new Set(observations.map(item => item.date).filter(Boolean))].slice(0, 7)
  const points = uniqueDates.length
    ? uniqueDates.map(date => ({ label: date.slice(5), detail: 'OBS' }))
    : [{ label: month.label, detail: month.status.toUpperCase() }]

  const nodes = [
    { id: 'observations', label: 'OBS', value: observations.length, tone: observations.length ? 'active' : 'neutral' },
    { id: 'evidence', label: 'EVIDENCE', value: evidence.length, tone: evidence.length ? 'success' : 'neutral' },
    { id: 'issues', label: 'REVIEW', value: issues.length, tone: issues.length ? 'warning' : 'neutral' },
    { id: 'disasters', label: 'DISASTER', value: disasters.events?.length || 0, tone: disasters.events?.length ? 'danger' : 'neutral' },
    { id: 'causality', label: 'CAUSAL', value: reviewed, tone: reviewed ? 'success' : 'neutral' },
  ]

  const spine = [
    { label: 'MONTH LEDGER', detail: `${observations.length} observation rows`, state: observations.length ? 'complete' : 'active' },
    { label: 'GEOGRAPHY', detail: `${mapped} mapped observation rows`, state: mapped ? 'complete' : 'idle' },
    { label: 'EVIDENCE', detail: `${evidence.length} source rows`, state: evidence.length ? 'complete' : 'idle' },
    { label: 'CAUSALITY REVIEW', detail: `${reviewed} reviewed relations`, state: reviewed ? 'complete' : 'active' },
    { label: 'ARCHIVE', detail: month.status === 'final' ? 'frozen dataset' : 'collecting', state: month.status === 'final' ? 'complete' : 'active' },
  ]

  return <section className="signature-aperture" aria-label="MoonWitness observatory signature">
    <div className="signature-aperture__core">
      <div className="signature-aperture__header"><span>OBSERVATORY APERTURE</span><SignalBeacon tone={month.status === 'final' ? 'success' : 'warning'} label={month.status === 'final' ? 'ARCHIVE LOCKED' : 'LIVE COLLECTION'} /></div>
      <OrbitalCore title="TRUTH" subtitle="evidence machine" nodes={nodes} activeId="causality" />
      <div className="signature-aperture__metrics">
        <ObservationShard eyebrow="CAUSALITY / SOURCE KPI" title={`Causal Proof ${causalKpi?.value ?? '—'}`} meta="Published monthly KPI">Proximity measurements remain discovery aids; causal review is kept separate.</ObservationShard>
        <ReliabilityPrism score={avgEvidence} label="AVG OBS. EVIDENCE" />
      </div>
    </div>
    <div className="signature-aperture__spine"><EvidenceSpine steps={spine} /></div>
    <div className="signature-aperture__time"><TemporalOrrery points={points} activeIndex={points.length - 1} /><CausalityGuardrail /></div>
  </section>
}

export function EvidenceSignature({ evidence }) {
  const steps = evidence.slice(0, 5).map(item => ({
    label: String(item.type || 'SOURCE').toUpperCase(),
    detail: item.title,
    state: 'complete',
  }))
  return <section className="evidence-signature" aria-label="Evidence provenance instrument">
    <ObservationShard eyebrow="PROVENANCE INSTRUMENT" title={`${evidence.length} SOURCE ROWS`} meta="Repository evidence ledger">Source type, title, description and outbound reference remain independently inspectable.</ObservationShard>
    <EvidenceSpine steps={steps.length ? steps : [{ label: 'SOURCE', detail: 'No published evidence rows', state: 'idle' }]} />
  </section>
}

export function CausalitySignature({ children }) {
  return <div className="causality-signature"><CausalityGuardrail>{children}</CausalityGuardrail></div>
}
