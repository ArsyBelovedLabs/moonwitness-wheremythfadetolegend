import React, { useEffect, useMemo, useState } from 'react'
import {
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
const observationKey = item => `${item?.date || ''}|${item?.location || ''}|${item?.practice || ''}`
const enrichObservations = (report, geography) => {
  const geoByMatch = new Map((geography?.observations || []).map(item => [observationKey(item.match || {}), item]))
  return (report?.observations || []).map(item => {
    const meta = geoByMatch.get(observationKey(item))
    return {
      ...item,
      _date_start: meta?.date_start || null,
      _date_end: meta?.date_end || meta?.date_start || null,
    }
  })
}
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

const workflowStages = ['DISCOVERED', 'SOURCE_CHECK', 'VERIFIED', 'ANALYZED', 'PUBLISHED']
const stageTone = stage => ({
  DISCOVERED: 'active',
  SOURCE_CHECK: 'warning',
  VERIFIED: 'success',
  ANALYZED: 'active',
  PUBLISHED: 'success',
}[stage] || 'neutral')

const scrollBehavior = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

const REPORT_SURFACES = [
  { id: 'spread-map', code: '02', label: 'Spread Map', meta: 'repository geography', key: 'observations' },
  { id: 'disaster-map', code: '03', label: 'Disaster Map', meta: 'independent context', key: 'disasters' },
  { id: 'correlation', code: '04', label: 'Correlation', meta: 'proximity ≠ causation', key: 'reviewed' },
  { id: 'review', code: '05', label: 'Tauhid Review', meta: 'practice-level flags', key: 'issues' },
  { id: 'evidence', code: '06', label: 'Evidence', meta: 'source provenance', key: 'evidence' },
  { id: 'revelation', code: '07', label: 'Revelation Lens', meta: 'four exact lenses', key: 'lenses' },
  { id: 'pipeline', code: '08', label: 'Candidate Pipeline', meta: 'collect → verify', key: 'candidates' },
]

function ReportSurfaceDeck({ go, observations, disasters, reviewed, issues, evidence, revelation, candidates }) {
  const values = {
    observations: observations.length,
    disasters: disasters?.events?.length || 0,
    reviewed: reviewed.length,
    issues: issues.length,
    evidence: evidence.length,
    lenses: ['Q', 'I', 'T', 'Z'].filter(key => (revelation?.traditions || []).some(item => item.key === key)).length,
    candidates: candidates?.candidates?.length || 0,
  }

  return <section className="report-surface-deck" aria-label="Monthly report surface index">
    <div className="report-surface-deck__heading">
      <div>
        <span>REPORT SURFACE INDEX</span>
        <strong>Choose a research instrument</strong>
      </div>
      <small>Seven linked views · one repository state</small>
    </div>
    <div className="report-surface-deck__grid">
      {REPORT_SURFACES.map(surface => <button
        type="button"
        className={`report-surface-card is-${surface.id}`}
        key={surface.id}
        onClick={() => go(surface.id)}
        aria-label={`${surface.label}: ${surface.meta}`}
      >
        <span className="report-surface-card__code">{surface.code}</span>
        <span className="report-surface-card__copy">
          <strong>{surface.label}</strong>
          <small>{surface.meta}</small>
        </span>
        <b>{values[surface.key]}</b>
        <i aria-hidden="true">↗</i>
      </button>)}
    </div>
  </section>
}

function SearchGate({ value, onChange, expanded, resultsId, trailing }) {
  return <div className="mw-archive-gate">
    <span className="mw-archive-gate__label">ARCHIVE GATE</span>
    <div className="mw-archive-gate__field">
      <span aria-hidden="true">⌁</span>
      <input
        type="search"
        aria-label="ARCHIVE GATE"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={resultsId}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        value={value}
        placeholder="Search observation, location, actor, practice…"
        onChange={event => onChange(event.target.value)}
      />
      {trailing}
    </div>
  </div>
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
    const chronologyObservations = enrichObservations(report, geography)
    const reviewed = correlations?.reviews || []
    const causal = kpiScore(report)
    const observationPoints = (geography?.observations || []).map(item => {
      const projected = item?.geography?.map_enabled ? projectIndonesia(item.geography) : null
      return projected
        ? {
            id: item.id || `${item.match?.location || 'observation'}-${item.match?.practice || 'row'}`,
            ...projected,
            label: `${item.match?.location || 'Unknown locality'} · ${item.match?.practice || 'Observation'}`,
            tone: 'active',
            size: 11,
          }
        : null
    }).filter(Boolean)
    const disasterPoints = (disasters?.events || []).map(event => {
      const projected = projectIndonesia(event.coordinates)
      return projected
        ? {
            id: event.id,
            ...projected,
            label: `${event.location} · ${event.label}`,
            tone: event.severity === 'major' ? 'danger' : event.type === 'wildfire' ? 'warning' : 'active',
            size: event.severity === 'major' ? 16 : 11,
          }
        : null
    }).filter(Boolean)

    if (root === 'disaster-map') {
      return <div className="shared-instrument-grid is-map">
        <MapRift title={`${month.label.toUpperCase()} / DISASTER CONTEXT`} points={disasterPoints} />
        <div className="shared-instrument-side">
          <SignalBeacon tone="warning" label="INDEPENDENT DATASET" />
          <ObservationShard eyebrow="MAP CONTRACT" title={`${disasterPoints.length} mapped events`} meta={`${disasters?.events?.length || 0} independent rows`} tone="warning">
            Disaster events are independently sourced. Observation overlays are contextual only; no ritual-to-disaster relation is inferred by the map.
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
        ...chronologyObservations.map((item, index) => ({
          id: `obs-${index}`,
          label: item.practice || item.location || 'Observation',
          date: item.date,
          sortDate: item._date_start || item.date,
          detail: item.location || 'Observation',
          tone: 'active',
        })),
        ...(disasters?.events || []).map(event => ({
          id: event.id,
          label: event.label || event.type || 'Disaster context',
          date: event.date_start,
          sortDate: event.date_start,
          detail: event.location,
          tone: 'danger',
        })),
      ].sort((a, b) => dateValue(a.sortDate) - dateValue(b.sortDate)).slice(0, 9)

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
      const workflow = workflowStages.map((stage, index) => {
        const count = rows.filter(item => item.status === stage).length
        return {
          id: stage,
          label: stage,
          detail: `${count} ${count === 1 ? 'record' : 'records'}`,
          tone: stageTone(stage),
          state: count > 0 ? 'complete' : index === 0 && rows.length === 0 ? 'active' : 'idle',
        }
      })
      return <div className="shared-instrument-single">
        <WitnessThread steps={workflow} />
        <ObservationShard eyebrow="PIPELINE CONTRACT" title="DISCOVERY IS NOT PUBLICATION" meta={`${rows.length} candidate signal${rows.length === 1 ? '' : 's'} in the selected month`} tone="warning">
          Automated monitoring may create DISCOVERED candidates only. Source checking, verification and analysis remain explicit gates before publication.
        </ObservationShard>
      </div>
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
      return <div className="shared-instrument-grid is-map">
        <MapRift title={`${month.label.toUpperCase()} / OBSERVATION GEOGRAPHY`} points={observationPoints} />
        <div className="shared-instrument-side">
          <SignalBeacon tone="success" label="REPOSITORY COORDINATES" />
          <MetricRail items={[
            { label: 'OBSERVATIONS', value: observations.length, detail: 'published', tone: 'active' },
            { label: 'MAPPED', value: observationPoints.length, detail: 'repository coordinates', tone: 'success' },
            { label: 'MODE', value: 'SPREAD', detail: 'context layer' },
            { label: 'CAUSALITY', value: 'SEPARATE', detail: 'not inferred', tone: 'warning' },
          ]} />
          <CausalityGuardrail />
        </div>
      </div>
    }

    const kpis = (report?.kpis || []).slice(0, 8).map(item => ({
      label: String(item.label || 'KPI').toUpperCase(),
      value: item.value,
      detail: item.note,
      tone: toneForKpi(item.label),
    }))
    if (root === 'report') {
      return <div className="shared-report-stack">
        <div className="shared-instrument-grid is-report">
          <TruthAperture score={causal} label="CAUSAL PROOF" detail="published KPI upper bound" tone="warning" />
          <div className="shared-instrument-report">
            <div className="report-readout">
              <span>MONTHLY OBSERVATORY / {month.label.toUpperCase()}</span>
              <strong>One auditable surface for the current field register.</strong>
              <small>Evidence, geography, disaster context and review remain separate by contract.</small>
            </div>
            <MetricRail items={kpis.length ? kpis : [
              { label: 'OBSERVATIONS', value: observations.length, detail: 'published', tone: 'active' },
              { label: 'EVIDENCE', value: evidence.length, detail: 'sources', tone: 'success' },
              { label: 'DISASTERS', value: disasters?.events?.length || 0, detail: 'independent context', tone: 'warning' },
              { label: 'REVIEWED', value: reviewed.length, detail: 'relations' },
            ]} />
            <CausalityGuardrail />
          </div>
        </div>
        <ReportSurfaceDeck
          go={go}
          observations={observations}
          disasters={disasters}
          reviewed={reviewed}
          issues={issues}
          evidence={evidence}
          revelation={revelation}
          candidates={candidates}
        />
        <MetricRail items={[
          { label: 'OBSERVATIONS', value: observations.length, detail: 'published rows', tone: 'active' },
          { label: 'EVIDENCE', value: evidence.length, detail: 'source rows', tone: 'success' },
          { label: 'DISASTERS', value: disasters?.events?.length || 0, detail: 'independent context', tone: 'warning' },
          { label: 'REVIEWED', value: reviewed.length, detail: 'causality relations' },
        ]} />
      </div>
    }
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
          <SearchGate
            value={query}
            onChange={setQuery}
            expanded={searchResults.length > 0}
            resultsId="canonical-search-results"
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
          <div id="canonical-search-results" className="canonical-search-results" role="listbox" aria-label="Observation search results" hidden={!searchResults.length}>
                {searchResults.map((item, index) => <button
                  type="button"
                  role="option"
                  aria-selected="false"
                  key={`${item.date}-${item.location}-${item.practice}-${index}`}
                  onClick={() => {
                    setQuery('')
                    window.location.hash = `report/${month.id}`
                    setTimeout(() => document.querySelector('.observation-table')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }), 120)
                  }}
                >
                  <span>{item.location || 'Unknown location'}</span>
                  <strong>{item.practice || item.summary || 'Observation'}</strong>
                  <small>{item.date || 'Undated'}{item.actor ? ` · ${item.actor}` : ''}</small>
                </button>)}
              </div>
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
