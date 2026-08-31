import React, { useEffect, useMemo, useState } from 'react'
import {
  ArchiveGate,
  CausalityGuardrail,
  CausalityLattice,
  ChronologyTrack,
  InspectorDock,
  InspectorRows,
  InstrumentHeader,
  MapRift,
  MetricRail,
  MissionRail,
  ObservationShard,
  ProvenanceRail,
  RevelationLens,
  SignalBeacon,
  TruthAperture,
  WitnessThread,
} from '@arsybelovedlabs/moonwitness-design-system'
import './shared-instrument-layer.css'

const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
const read = async (path, fallback) => {
  if (!path) return fallback
  try {
    const response = await fetch(`${base}/${path}`.replace(/([^:]\/)\/+/g, '$1'), { cache: 'no-store' })
    return response.ok ? response.json() : fallback
  } catch {
    return fallback
  }
}

const NAV = [
  { id: 'report', label: 'Monthly Report', meta: 'auditable ledger' },
  { id: 'spread-map', label: 'Spread Map', meta: 'observation geography' },
  { id: 'disaster-map', label: 'Disaster Map', meta: 'independent context' },
  { id: 'correlation', label: 'Correlation Engine', meta: 'proximity ≠ cause' },
  { id: 'review', label: 'Tauhid Review', meta: 'practice-level only' },
  { id: 'evidence', label: 'Evidence', meta: 'source provenance' },
  { id: 'revelation', label: 'Revelation Lens', meta: 'four-source lens' },
  { id: 'pipeline', label: 'Candidate Pipeline', meta: 'collect → verify' },
]

const PAGE = {
  report: ['01 / 08', 'Observatory Report', 'One auditable surface for observations, evidence, geography, disaster context and reviewed causality.'],
  'spread-map': ['02 / 08', 'Mythos Spread Map', 'Repository-owned locality coordinates. Geography is context, not proof of causation.'],
  'disaster-map': ['03 / 08', 'Disaster Map', 'Independent disaster rows stay separate from ritual and mythos observations.'],
  correlation: ['04 / 08', 'Correlation / Timeline Engine', 'Temporal and geographic proximity are discovery aids; reviewed causality remains a separate field.'],
  review: ['05 / 08', 'Tauhid Review', 'Practice-level clarification only; no religion, ethnicity, community or person is classified.'],
  evidence: ['06 / 08', 'Evidence Ledger', 'Publisher, provenance and the claim being documented remain independently inspectable.'],
  revelation: ['07 / 08', 'Four Revelation Lens', 'Al-Qur’an, Injil/Gospel, Taurat/Torah and Zabur/Psalms remain four distinct comparison lenses.'],
  pipeline: ['08 / 08', 'Candidate Pipeline', 'Candidate signals remain unpublished until source checks, verification and analysis are complete.'],
}

const rootOf = route => String(route || '').split('/')[0]
const clamp = value => Math.max(5, Math.min(95, value))
const projectIndonesia = coordinates => {
  const lon = Number(coordinates?.lon)
  const lat = Number(coordinates?.lat)
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null
  return { x: clamp(((lon - 94) / 47) * 100), y: clamp(((6 - lat) / 17) * 100) }
}

const kpiScore = report => {
  const value = (report?.kpis || []).find(item => String(item.label).toLowerCase().includes('causal'))?.value
  const nums = String(value ?? '').split('/')[0].match(/\d+(?:\.\d+)?/g)?.map(Number) || []
  return nums.length ? Math.max(...nums.filter(number => number <= 100)) : 0
}

const toneForKpi = label => {
  const value = String(label || '').toLowerCase()
  if (value.includes('causal')) return 'warning'
  if (value.includes('evidence') || value.includes('source')) return 'success'
  if (value.includes('disaster') || value.includes('risk')) return 'danger'
  return 'active'
}

const dateValue = value => {
  const parsed = Date.parse(value || '')
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

export default function SharedInstrumentLayer() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'report/2026-08')
  const [selectedMonthId, setSelectedMonthId] = useState(() => window.location.hash.match(/report\/(\d{4}-\d{2})/)?.[1] || '2026-08')
  const [query, setQuery] = useState('')
  const [state, setState] = useState(null)

  useEffect(() => {
    const onHash = () => {
      const next = window.location.hash.slice(1) || 'report/2026-08'
      setRoute(next)
      const monthId = next.match(/report\/(\d{4}-\d{2})/)?.[1]
      if (monthId) setSelectedMonthId(monthId)
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const registry = await read('data/index.json', { months: [] })
      const month = registry.months?.find(item => item.id === selectedMonthId)
        || registry.months?.find(item => item.id === '2026-08')
        || registry.months?.[0]
      if (!month) return
      const [report, issues, evidence, revelation, geography, disasters, correlations, candidates] = await Promise.all([
        read(month.path, { kpis: [], observations: [] }),
        read(month.issues, []),
        read(month.evidence, []),
        read(month.revelation, { traditions: [] }),
        read(month.geography, { observations: [] }),
        read(month.disasters, { events: [] }),
        read(month.correlations, { reviews: [] }),
        read(month.candidates, { candidates: [] }),
      ])
      if (alive) setState({ registry, month, report, issues, evidence, revelation, geography, disasters, correlations, candidates })
    })()
    return () => { alive = false }
  }, [selectedMonthId])

  const root = rootOf(route)
  const go = id => {
    const target = id === 'report' ? `report/${state?.month?.id || selectedMonthId}` : id
    window.location.hash = target
  }

  const searchResults = useMemo(() => {
    if (!state || !query.trim()) return []
    const needle = query.trim().toLowerCase()
    return (state.report?.observations || []).filter(item =>
      [item.date, item.location, item.actor, item.practice, item.summary]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    ).slice(0, 8)
  }, [query, state])

  const view = useMemo(() => {
    if (!state) return null
    const { month, report, issues, evidence, revelation, geography, disasters, correlations, candidates } = state
    const observations = report?.observations || []
    const reviewed = correlations?.reviews || []
    const causal = kpiScore(report)
    const disasterPoints = (disasters?.events || []).map(event => {
      const projected = projectIndonesia(event.coordinates)
      return projected
        ? {
            id: event.id,
            ...projected,
            label: `${event.location} · ${event.label}`,
            tone: event.causality?.score > 15 ? 'warning' : 'danger',
            size: event.severity === 'major' ? 16 : 11,
          }
        : null
    }).filter(Boolean)

    if (root === 'disaster-map') {
      return <div className="shared-instrument-grid is-map">
        <MapRift title={`${month.label.toUpperCase()} / DISASTER CONTEXT`} points={disasterPoints} />
        <div className="shared-instrument-side">
          <SignalBeacon tone="warning" label="INDEPENDENT DATASET" />
          <ObservationShard eyebrow="MAP CONTRACT" title={`${disasterPoints.length} mapped events`} tone="warning">
            Disaster events are independently sourced. Observation overlays are contextual only.
          </ObservationShard>
          <CausalityGuardrail />
        </div>
      </div>
    }

    if (root === 'correlation') {
      const nodes = [
        { id: 'obs', x: 14, y: 30, label: 'OBSERVATION', value: observations.length, tone: 'active' },
        { id: 'geo', x: 35, y: 70, label: 'PROXIMITY', value: 'ΔT / km', tone: 'warning' },
        { id: 'event', x: 58, y: 28, label: 'DISASTER', value: disasters?.events?.length || 0, tone: 'danger' },
        { id: 'review', x: 84, y: 60, label: 'REVIEWED', value: reviewed.length, tone: 'success' },
      ]
      const chronology = [
        ...observations.map((item, index) => ({
          id: `obs-${index}`,
          label: item.practice || item.location || 'Observation',
          date: item.date,
          detail: item.location || 'Observation',
          tone: 'active',
        })),
        ...(disasters?.events || []).map(event => ({
          id: event.id,
          label: event.label || event.type || 'Disaster context',
          date: event.date_start,
          detail: event.location,
          tone: 'danger',
        })),
      ].sort((a, b) => dateValue(a.date) - dateValue(b.date)).slice(0, 9)

      return <div className="shared-correlation-stack">
        <div className="shared-instrument-grid is-correlation">
          <CausalityLattice
            nodes={nodes}
            edges={[
              { from: 'obs', to: 'geo', strength: .8, dashed: true },
              { from: 'event', to: 'geo', strength: .8, dashed: true },
              { from: 'geo', to: 'review', strength: .55, dashed: true },
            ]}
          />
          <div className="shared-instrument-side">
            <TruthAperture score={causal} label="CAUSAL PROOF" detail="published KPI upper bound" tone="warning" />
            <CausalityGuardrail />
          </div>
        </div>
        <ChronologyTrack points={chronology} />
      </div>
    }

    if (root === 'evidence') {
      const items = evidence.slice(0, 8).map((item, index) => ({
        id: `E${String(index + 1).padStart(2, '0')}`,
        type: String(item.type || 'source').toUpperCase(),
        title: item.title || 'Untitled source',
        meta: item.description || '',
        tone: String(item.type || '').toLowerCase().includes('official') ? 'success' : 'active',
        verified: Boolean(item.url),
      }))
      return <div className="shared-instrument-grid is-evidence">
        <ProvenanceRail items={items} />
        <div className="shared-instrument-side">
          <TruthAperture score={Math.min(100, evidence.length * 6)} label="SOURCE DENSITY" detail={`${evidence.length} repository rows`} tone="success" />
          <ObservationShard eyebrow="EVIDENCE CONTRACT" title="SOURCE ≠ CLAIM">
            Publisher identity, provenance and the claim it documents remain separately inspectable.
          </ObservationShard>
        </div>
      </div>
    }

    if (root === 'revelation') {
      const order = ['Q', 'I', 'T', 'Z']
      const lensItems = order.map(key => (revelation?.traditions || []).find(item => item.key === key)).filter(Boolean).map(item => ({
        key: item.key,
        name: item.name,
        reference: (item.references || []).join(' · '),
        focus: item.focus,
        tone: item.key === 'Q' ? 'success' : item.key === 'I' ? 'active' : item.key === 'T' ? 'warning' : 'neutral',
      }))
      return <div className="shared-instrument-single">
        <RevelationLens items={lensItems} />
        {lensItems.length !== 4
          ? <ObservationShard eyebrow="DATA CONTRACT" title="FOUR LENSES REQUIRED" tone="warning">The repository currently exposes {lensItems.length} of 4 canonical Revelation Lens entries.</ObservationShard>
          : null}
      </div>
    }

    if (root === 'pipeline') {
      const rows = candidates?.candidates || []
      const steps = rows.slice(0, 5).map((item, index) => ({
        id: item.id || `candidate-${index}`,
        label: item.title || item.signal || `Candidate ${index + 1}`,
        detail: item.status || 'DISCOVERED',
        tone: item.status === 'VERIFIED' ? 'success' : 'active',
        state: item.status === 'VERIFIED' ? 'complete' : 'active',
      }))
      const workflow = steps.length ? steps : [
        { id: 'discover', label: 'DISCOVERED', detail: 'candidate intake', state: 'idle' },
        { id: 'source', label: 'SOURCE_CHECK', detail: 'provenance gate', state: 'idle' },
        { id: 'verify', label: 'VERIFIED', detail: 'evidence threshold', state: 'idle' },
        { id: 'analyze', label: 'ANALYZED', detail: 'methodology review', state: 'idle' },
        { id: 'publish', label: 'PUBLISHED', detail: 'public truth boundary', state: 'idle' },
      ]
      return <div className="shared-instrument-single"><WitnessThread steps={workflow} /></div>
    }

    if (root === 'review') {
      const counts = issues.reduce((acc, item) => {
        const key = String(item.priority || 'LOW').toUpperCase()
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      return <div className="shared-instrument-single">
        <MetricRail items={[
          { label: 'CRITICAL', value: counts.CRITICAL || 0, detail: 'practice flags', tone: 'danger' },
          { label: 'HIGH', value: counts.HIGH || 0, detail: 'practice flags', tone: 'warning' },
          { label: 'TOTAL', value: issues.length, detail: 'review rows', tone: 'active' },
          { label: 'SCOPE', value: 'PRACTICE', detail: 'not communities', tone: 'success' },
        ]} />
        <ObservationShard eyebrow="SCOPE GUARDRAIL" title="PRACTICE-LEVEL REVIEW" tone="warning">
          Severity flags practices for clarification. It does not classify religions, ethnicities, communities or people.
        </ObservationShard>
      </div>
    }

    if (root === 'spread-map') {
      const mapped = (geography?.observations || []).filter(item => item?.geography?.map_enabled).length
      return <div className="shared-instrument-single">
        <MetricRail items={[
          { label: 'OBSERVATIONS', value: observations.length, detail: 'published', tone: 'active' },
          { label: 'MAPPED', value: mapped, detail: 'repository coordinates', tone: 'success' },
          { label: 'MODE', value: 'SPREAD', detail: 'context layer' },
          { label: 'CAUSALITY', value: 'SEPARATE', detail: 'not inferred', tone: 'warning' },
        ]} />
      </div>
    }

    const kpis = (report?.kpis || []).slice(0, 8).map(item => ({
      label: String(item.label || 'KPI').toUpperCase(),
      value: item.value,
      detail: item.note,
      tone: toneForKpi(item.label),
    }))
    return <div className="shared-report-stack">
      <div className="shared-instrument-grid is-report">
        <TruthAperture score={causal} label="CAUSAL PROOF" detail="published KPI upper bound" tone="warning" />
        <div className="shared-instrument-report">
          <MetricRail items={kpis.length ? kpis : [
            { label: 'OBSERVATIONS', value: observations.length, detail: 'published', tone: 'active' },
            { label: 'EVIDENCE', value: evidence.length, detail: 'sources', tone: 'success' },
            { label: 'DISASTERS', value: disasters?.events?.length || 0, detail: 'independent context', tone: 'warning' },
            { label: 'REVIEWED', value: reviewed.length, detail: 'relations' },
          ]} />
          <CausalityGuardrail />
        </div>
      </div>
      <MetricRail items={[
        { label: 'OBSERVATIONS', value: observations.length, detail: 'published rows', tone: 'active' },
        { label: 'EVIDENCE', value: evidence.length, detail: 'source rows', tone: 'success' },
        { label: 'DISASTERS', value: disasters?.events?.length || 0, detail: 'independent context', tone: 'warning' },
        { label: 'REVIEWED', value: reviewed.length, detail: 'causality relations' },
      ]} />
    </div>
  }, [root, state])

  if (!state) return null

  const { registry, month, report, evidence, disasters, correlations } = state
  const observations = report?.observations || []
  const page = PAGE[root] || PAGE.report
  const title = `${month.label} — ${page[1]}`

  return <section className="canonical-observatory" aria-label="MoonWitness canonical observatory chrome">
    <aside className="canonical-mission-shell">
      <div className="canonical-brand">
        <small>MOONWITNESS SUBMODULE</small>
        <strong>WHERE MYTH FADE TO LEGEND</strong>
        <span>COUNTER-MYTHOS OBSERVATORY</span>
      </div>
      <MissionRail items={NAV} activeId={root} onSelect={go} />
      <div className="canonical-mission-foot">
        <SignalBeacon tone={month.status === 'final' ? 'success' : 'warning'} label={month.status === 'final' ? 'ARCHIVE / FINAL' : 'DATA / COLLECTING'} />
        <small>OBSERVE • VERIFY • CLARIFY • PURIFY</small>
      </div>
    </aside>

    <div className="canonical-route-shell">
      <InstrumentHeader
        code={page[0]}
        title={title}
        subtitle={page[2]}
        status={<SignalBeacon tone={month.status === 'final' ? 'success' : 'warning'} label={month.status === 'final' ? 'REPOSITORY / GROUNDED' : 'COLLECTING'} />}
      />

      <div className="canonical-control-grid">
        <div className="canonical-search-shell">
          <ArchiveGate
            label="ARCHIVE GATE"
            placeholder="Search observation, location, actor, practice…"
            value={query}
            onChange={setQuery}
            trailing={
              <select
                aria-label="Research month"
                value={month.id}
                onChange={event => {
                  const id = event.target.value
                  setSelectedMonthId(id)
                  window.location.hash = `report/${id}`
                }}
              >
                {(registry?.months || []).map(item => <option key={item.id} value={item.id}>{item.label}{item.status === 'collecting' ? ' · Collecting' : ''}</option>)}
              </select>
            }
          />
          {searchResults.length
            ? <div className="canonical-search-results" role="listbox" aria-label="Observation search results">
                {searchResults.map((item, index) => <button
                  type="button"
                  key={`${item.date}-${item.location}-${item.practice}-${index}`}
                  onClick={() => {
                    setQuery('')
                    window.location.hash = `report/${month.id}`
                    setTimeout(() => document.querySelector('.observation-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
                  }}
                >
                  <span>{item.location || 'Unknown location'}</span>
                  <strong>{item.practice || item.summary || 'Observation'}</strong>
                  <small>{item.date || 'Undated'}{item.actor ? ` · ${item.actor}` : ''}</small>
                </button>)}
              </div>
            : null}
        </div>

        <InspectorDock title="RESEARCH STATE" eyebrow="LIVE REPOSITORY READ">
          <InspectorRows rows={[
            { label: 'MONTH', value: month.label, tone: 'active' },
            { label: 'OBSERVATIONS', value: observations.length, tone: 'active' },
            { label: 'EVIDENCE', value: evidence.length, tone: 'success' },
            { label: 'DISASTER CONTEXT', value: disasters?.events?.length || 0, tone: 'warning' },
            { label: 'REVIEWED RELATIONS', value: correlations?.reviews?.length || 0, tone: 'neutral' },
          ]} />
        </InspectorDock>
      </div>

      <div className="shared-instrument-layer" aria-label="MoonWitness shared design-system instrument">
        <div className="shared-instrument-label">
          <span>CANONICAL MOONWITNESS INSTRUMENT</span>
          <SignalBeacon tone="success" label="SHARED UI / LIVE" />
        </div>
        {view}
      </div>
    </div>
  </section>
}
