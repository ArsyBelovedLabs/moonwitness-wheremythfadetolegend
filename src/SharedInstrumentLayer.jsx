import React, { useEffect, useMemo, useState } from 'react'
import {
  CausalityGuardrail,
  CausalityLattice,
  MapRift,
  MetricRail,
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

export default function SharedInstrumentLayer() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'report/2026-08')
  const [state, setState] = useState(null)

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || 'report/2026-08')
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const registry = await read('data/index.json', { months: [] })
      const requested = route.match(/report\/(\d{4}-\d{2})/)?.[1]
      const month = registry.months?.find(item => item.id === requested) || registry.months?.find(item => item.id === '2026-08') || registry.months?.[0]
      if (!month) return
      const [report, evidence, revelation, geography, disasters, correlations, candidates] = await Promise.all([
        read(month.path, { kpis: [], observations: [] }),
        read(month.evidence, []),
        read(month.revelation, { traditions: [] }),
        read(month.geography, { observations: [] }),
        read(month.disasters, { events: [] }),
        read(month.correlations, { reviews: [] }),
        read(month.candidates, { candidates: [] }),
      ])
      if (alive) setState({ month, report, evidence, revelation, geography, disasters, correlations, candidates })
    })()
    return () => { alive = false }
  }, [route])

  const root = rootOf(route)
  const view = useMemo(() => {
    if (!state) return null
    const { month, report, evidence, revelation, geography, disasters, correlations, candidates } = state
    const observations = report?.observations || []
    const reviewed = correlations?.reviews || []
    const causal = kpiScore(report)
    const disasterPoints = (disasters?.events || []).map(event => {
      const projected = projectIndonesia(event.coordinates)
      return projected ? { id: event.id, ...projected, label: `${event.location} · ${event.label}`, tone: event.causality?.score > 15 ? 'warning' : 'danger', size: event.severity === 'major' ? 16 : 11 } : null
    }).filter(Boolean)

    if (root === 'disaster-map') {
      return <div className="shared-instrument-grid is-map">
        <MapRift title={`${month.label.toUpperCase()} / DISASTER CONTEXT`} points={disasterPoints} />
        <div className="shared-instrument-side"><SignalBeacon tone="warning" label="INDEPENDENT DATASET"/><ObservationShard eyebrow="MAP CONTRACT" title={`${disasterPoints.length} mapped events`} tone="warning">Disaster events are independently sourced. Observation overlays are contextual only.</ObservationShard><CausalityGuardrail /></div>
      </div>
    }

    if (root === 'correlation') {
      const nodes = [
        { id:'obs', x:14, y:30, label:'OBSERVATION', value:observations.length, tone:'active' },
        { id:'geo', x:35, y:70, label:'PROXIMITY', value:'ΔT / km', tone:'warning' },
        { id:'event', x:58, y:28, label:'DISASTER', value:disasters?.events?.length || 0, tone:'danger' },
        { id:'review', x:84, y:60, label:'REVIEWED', value:reviewed.length, tone:'success' },
      ]
      return <div className="shared-instrument-grid is-correlation"><div><CausalityLattice nodes={nodes} edges={[{from:'obs',to:'geo',strength:.8,dashed:true},{from:'event',to:'geo',strength:.8,dashed:true},{from:'geo',to:'review',strength:.55,dashed:true}]} /></div><div className="shared-instrument-side"><TruthAperture score={causal} label="CAUSAL PROOF" detail="published KPI upper bound" tone="warning"/><CausalityGuardrail /></div></div>
    }

    if (root === 'evidence') {
      const items = evidence.slice(0, 6).map((item, index) => ({ id:`E${String(index+1).padStart(2,'0')}`, type:String(item.type || 'source').toUpperCase(), title:item.title || 'Untitled source', meta:item.description || '', tone:String(item.type || '').toLowerCase().includes('official') ? 'success' : 'active', verified:Boolean(item.url) }))
      return <div className="shared-instrument-grid is-evidence"><div><ProvenanceRail items={items}/></div><div className="shared-instrument-side"><TruthAperture score={Math.min(100, evidence.length * 6)} label="SOURCE DENSITY" detail={`${evidence.length} repository rows`} tone="success"/><ObservationShard eyebrow="EVIDENCE CONTRACT" title="Source ≠ claim">Publisher identity, provenance and the claim it documents remain separately inspectable.</ObservationShard></div></div>
    }

    if (root === 'revelation') {
      const lensItems = (revelation?.traditions || []).slice(0, 4).map(item => ({ key:item.key, name:item.name, reference:(item.references || []).join(' · '), focus:item.focus, tone:item.key === 'Q' ? 'success' : item.key === 'I' ? 'active' : item.key === 'T' ? 'warning' : 'neutral' }))
      return <div className="shared-instrument-single"><RevelationLens items={lensItems}/></div>
    }

    if (root === 'pipeline') {
      const rows = candidates?.candidates || []
      const steps = rows.slice(0, 5).map((item, index) => ({ id:item.id || `candidate-${index}`, label:item.title || item.signal || `Candidate ${index+1}`, detail:item.status || 'DISCOVERED', tone:item.status === 'VERIFIED' ? 'success' : 'active', state:item.status === 'VERIFIED' ? 'complete' : 'active' }))
      return <div className="shared-instrument-single"><WitnessThread steps={steps.length ? steps : [{id:'empty',label:'Candidate collection',detail:'No published candidate rows',state:'idle'}]}/></div>
    }

    if (root === 'review') {
      return <div className="shared-instrument-single"><ObservationShard eyebrow="SCOPE GUARDRAIL" title="PRACTICE-LEVEL REVIEW" tone="warning">Severity flags practices for clarification. It does not classify religions, ethnicities, communities or people.</ObservationShard></div>
    }

    if (root === 'spread-map') {
      const mapped = (geography?.observations || []).filter(item => item?.geography?.map_enabled).length
      return <div className="shared-instrument-single"><MetricRail items={[{label:'OBSERVATIONS',value:observations.length,detail:'published',tone:'active'},{label:'MAPPED',value:mapped,detail:'repository coordinates',tone:'success'},{label:'MODE',value:'SPREAD',detail:'context layer'},{label:'CAUSALITY',value:'SEPARATE',detail:'not inferred',tone:'warning'}]}/></div>
    }

    return <div className="shared-instrument-grid is-report"><div><TruthAperture score={causal} label="CAUSAL PROOF" detail="published KPI upper bound" tone="warning"/></div><div className="shared-instrument-report"><MetricRail items={[{label:'OBSERVATIONS',value:observations.length,detail:'published',tone:'active'},{label:'EVIDENCE',value:evidence.length,detail:'sources',tone:'success'},{label:'DISASTERS',value:disasters?.events?.length || 0,detail:'independent context',tone:'warning'},{label:'REVIEWED',value:reviewed.length,detail:'relations'}]}/><CausalityGuardrail /></div></div>
  }, [root, state])

  if (!view) return null
  return <section className="shared-instrument-layer" aria-label="MoonWitness shared design-system instrument"><div className="shared-instrument-label"><span>SHARED MOONWITNESS INSTRUMENT</span><SignalBeacon tone="success" label="DESIGN SYSTEM / LIVE"/></div>{view}</section>
}
