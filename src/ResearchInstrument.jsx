import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import {
  AlertTriangle, ArrowUpRight, BookOpen, CalendarDays, ChevronRight, CircleDot, Database,
  FileSearch, Flame, GitCompareArrows, Globe2, MapPinned, Menu, Moon, Radio, Search,
  ShieldCheck, Sparkles, Waves, X, Zap, Workflow,
} from 'lucide-react'
import { buildCorrelationRows, proximityBand, workflowCounts, WORKFLOW } from './lib/correlation.js'

const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
const get = async (path, fallback) => {
  if (!path) return fallback
  const response = await fetch(`${base}/${path}`.replace(/([^:]\/)\/+/g, '$1'), { cache: 'no-store' })
  if (!response.ok) {
    if (fallback !== undefined) return fallback
    throw new Error(`${path}: ${response.status}`)
  }
  return response.json()
}

const NAV = [
  ['report', 'Monthly Report', FileSearch],
  ['spread-map', 'Spread Map', MapPinned],
  ['disaster-map', 'Disaster Map', AlertTriangle],
  ['correlation', 'Correlation Engine', GitCompareArrows],
  ['review', 'Tauhid Review', ShieldCheck],
  ['evidence', 'Evidence', Database],
  ['revelation', 'Revelation Lens', BookOpen],
  ['pipeline', 'Candidate Pipeline', Workflow],
]

const BAND = {
  low: { label: 'LOW', range: '0–25', color: '#79f264' },
  watch: { label: 'WATCH', range: '26–40', color: '#ffd52f' },
  high: { label: 'HIGH', range: '41–75', color: '#ff861d' },
  critical: { label: 'CRITICAL', range: '76–100', color: '#ff4038' },
}
const KPI_TONES = ['green', 'amber', 'violet', 'red', 'violet', 'blue', 'cyan', 'amber']
const scoreBand = value => Number(value) >= 76 ? 'critical' : Number(value) >= 41 ? 'high' : Number(value) >= 26 ? 'watch' : 'low'
const priorityBand = p => String(p || '').toUpperCase() === 'CRITICAL' ? 'critical' : String(p || '').toUpperCase() === 'HIGH' ? 'high' : String(p || '').toUpperCase() === 'MEDIUM' ? 'watch' : 'low'
const evidenceTone = score => Number(score) >= 95 ? 'excellent' : Number(score) >= 85 ? 'strong' : Number(score) >= 70 ? 'moderate' : 'weak'
const routeRoot = route => route.split('/')[0]
const reportRoute = month => `report/${month?.id || '2026-08'}`
const observationKey = item => `${item.date}|${item.location}|${item.practice}`

function enrichObservations(report, geography) {
  const geoByMatch = new Map((geography?.observations || []).map(item => [`${item.match.date}|${item.match.location}|${item.match.practice}`, item]))
  return (report?.observations || []).map(item => {
    const meta = geoByMatch.get(observationKey(item))
    return {
      ...item,
      _id: meta?.id || observationKey(item),
      _geo: meta?.geography || null,
      _date_start: meta?.date_start || null,
      _date_end: meta?.date_end || meta?.date_start || null,
    }
  })
}

function go(route) { window.location.hash = route }

export default function App() {
  const [registry, setRegistry] = useState({ months: [] })
  const [month, setMonth] = useState(null)
  const [report, setReport] = useState(null)
  const [issues, setIssues] = useState([])
  const [evidence, setEvidence] = useState([])
  const [revelation, setRevelation] = useState({ traditions: [] })
  const [geography, setGeography] = useState({ observations: [] })
  const [disasters, setDisasters] = useState({ events: [], context_signals: [] })
  const [correlations, setCorrelations] = useState({ reviews: [] })
  const [candidates, setCandidates] = useState({ candidates: [] })
  const [monitor, setMonitor] = useState(null)
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'report/2026-08')
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onHash = () => { setRoute(window.location.hash.slice(1) || 'report/2026-08'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    get('data/index.json').then(data => {
      setRegistry(data)
      const requested = window.location.hash.match(/report\/(\d{4}-\d{2})/)?.[1]
      setMonth(data.months?.find(x => x.id === requested) || data.months?.find(x => x.id === '2026-08') || data.months?.[0] || null)
    }).catch(console.error)
    get('data/monitor/latest.json', null).then(setMonitor)
  }, [])

  useEffect(() => {
    if (!month) return
    setReport(null)
    Promise.all([
      get(month.path), get(month.issues, []), get(month.evidence, []), get(month.revelation, { traditions: [] }),
      get(month.geography, { observations: [] }), get(month.disasters, { events: [], context_signals: [] }),
      get(month.correlations, { reviews: [] }), get(month.candidates, { candidates: [] }),
    ]).then(([a,b,c,d,e,f,g,h]) => {
      setReport(a); setIssues(b); setEvidence(c); setRevelation(d); setGeography(e); setDisasters(f); setCorrelations(g); setCandidates(h)
    }).catch(console.error)
  }, [month])

  const observations = useMemo(() => enrichObservations(report, geography), [report, geography])
  const relationRows = useMemo(() => buildCorrelationRows(observations, disasters.events || [], correlations.reviews || []), [observations, disasters, correlations])
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase(); if (!q) return []
    return observations.filter(x => [x.date,x.location,x.actor,x.practice,x.summary].join(' ').toLowerCase().includes(q)).slice(0,8)
  }, [query, observations])

  if (!report) return <div className="wm-loading"><div className="loading-orbit"><Moon size={30}/><span>Synchronizing research instrument…</span></div></div>
  const root = routeRoot(route)

  return <div className="wm-app research-app">
    <div className="cosmic-noise"/>
    <aside className={`wm-sidebar ${menuOpen ? 'open' : ''}`}>
      <button className="sidebar-close" onClick={()=>setMenuOpen(false)} aria-label="Close navigation"><X size={20}/></button>
      <button className="wm-brand" onClick={()=>go(reportRoute(month))}><span className="brand-orbit"><Moon size={23}/></span><span className="brand-copy"><small>MOONWITNESS SUBMODULE</small><strong>WHERE MYTH FADE TO LEGEND</strong><em>COUNTER-MYTHOS OBSERVATORY</em></span></button>
      <div className="brand-rule"/>
      <nav className="wm-nav">{NAV.map(([key,label,Icon],i)=><button key={key} className={root===key?'active':''} onClick={()=>go(key==='report'?reportRoute(month):key)}><span className="nav-index">{String(i+1).padStart(2,'0')}</span><Icon size={17}/><span>{label}</span><ChevronRight className="nav-arrow" size={14}/></button>)}</nav>
      <div className="sidebar-doctrine"><Sparkles size={16}/><div><strong>COUNTER-MYTHOS MISSION</strong><span>Observe patterns. Verify claims. Clarify context. Purify unsupported certainty.</span></div></div>
      <div className="sidebar-status"><span className="pulse-dot"/><div><strong>{month.status==='collecting'?'COLLECTING':'REPOSITORY-GROUNDED'}</strong><small>{monitor?.status || 'Git-backed monthly archive'}</small></div></div>
    </aside>

    <main className="wm-main">
      <header className="wm-topbar">
        <button className="menu-button" onClick={()=>setMenuOpen(true)} aria-label="Open navigation"><Menu size={19}/></button>
        <div className="top-context"><span>WHERE MYTH FADE TO LEGEND</span><i>•</i><strong>{month.label}</strong></div>
        <div className="top-actions">
          <div className="wm-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search observation…" aria-label="Search observation"/>{searchResults.length>0&&<div className="search-popover">{searchResults.map(item=><button key={item._id} onClick={()=>{setQuery('');go(reportRoute(month))}}><span>{item.location}</span><b>{item.practice}</b><small>{item.date} · Gap {item.tauhid_gap}</small></button>)}</div>}</div>
          <select value={month.id} onChange={e=>{const next=registry.months.find(x=>x.id===e.target.value);setMonth(next);go(reportRoute(next))}}>{registry.months.map(item=><option key={item.id} value={item.id}>{item.label}{item.status==='collecting'?' · Collecting':''}</option>)}</select>
          <div className="repo-chip"><CircleDot size={13}/>{month.status==='final'?'FINAL DATASET':'COLLECTING'}</div>
        </div>
      </header>

      <div className="wm-content">
        {root==='report'&&<UnifiedReport month={month} report={report} observations={observations} issues={issues} evidence={evidence} revelation={revelation} disasters={disasters} relationRows={relationRows}/>} 
        {root==='spread-map'&&<SpreadMapPage month={month} observations={observations}/>} 
        {root==='disaster-map'&&<DisasterMapPage month={month} observations={observations} disasters={disasters}/>} 
        {root==='correlation'&&<CorrelationPage month={month} rows={relationRows}/>} 
        {root==='review'&&<ReviewPage month={month} report={report} issues={issues} observations={observations}/>} 
        {root==='evidence'&&<EvidencePage month={month} evidence={evidence}/>} 
        {root==='revelation'&&<RevelationPage month={month} revelation={revelation}/>} 
        {root==='pipeline'&&<PipelinePage month={month} candidates={candidates.candidates||[]}/>} 
        {!NAV.some(([key])=>key===root)&&<UnifiedReport month={month} report={report} observations={observations} issues={issues} evidence={evidence} revelation={revelation} disasters={disasters} relationRows={relationRows}/>} 
      </div>
      <footer className="wm-footer"><div><strong>WHERE MYTH FADE TO LEGEND</strong><span>MoonWitness submodule · counter-mythos observatory</span></div><div className="footer-doctrine">OBSERVE • VERIFY • CLARIFY • PURIFY</div><div className="footer-guardrail">Proximity ≠ causality. Practices are reviewed separately from people or communities.</div></footer>
    </main>
  </div>
}

function PageTitle({code,title,subtitle,children}) { return <div className="page-title"><div><span className="page-code">{code}</span><h1>{title}</h1><p>{subtitle}</p></div>{children}</div> }
function ScoreBadge({value,compact=false}) { const band=scoreBand(value); return <span className={`score-badge ${band} ${compact?'compact':''}`}><i/>{value}{compact?'':'/100'}<small>{BAND[band].label}</small></span> }
function EvidenceBadge({value}) { return <span className={`evidence-badge ${evidenceTone(value)}`}><ShieldCheck size={13}/>{value}</span> }
function Empty({title='No published rows yet',text='This month is still collecting candidate signals.'}) { return <div className="research-empty"><Radio size={22}/><strong>{title}</strong><span>{text}</span></div> }
function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})}

function UnifiedReport({month,report,observations,issues,evidence,revelation,disasters,relationRows}) {
  const sections=[['overview','Overview'],['observations','Observations'],['tauhid','Tauhid Gap'],['spread','Spread Map'],['disasters','Disasters'],['correlation-report','Correlation'],['evidence-report','Evidence'],['revelation-report','Revelation']]
  return <section>
    <PageTitle code="PUBLIC MONTHLY REPORT" title={`${month.label} — Observatory Report`} subtitle="One auditable report surface: observations, geography, disaster context, Tauhid review, correlation, evidence and Four Revelation Lens."><div className="report-period"><CalendarDays size={18}/><span>DATA STATE</span><strong>{month.status.toUpperCase()}</strong></div></PageTitle>
    <div className="report-section-nav">{sections.map(([id,label])=><button key={id} onClick={()=>scrollToId(id)}>{label}</button>)}</div>
    <section id="overview" className="report-anchor"><Kpis report={report}/><div className="instrument-summary"><SummaryMetric label="Observations" value={observations.length}/><SummaryMetric label="Disasters" value={disasters.events?.length||0}/><SummaryMetric label="TAU issues" value={issues.length}/><SummaryMetric label="Evidence" value={evidence.length}/><SummaryMetric label="Reviewed relations" value={relationRows.filter(x=>x.kind==='reviewed').length}/></div></section>
    <section id="observations" className="report-anchor"><SectionTitle title="Observation Ledger" note={`${observations.length} published rows`}/><ObservationTable observations={observations}/></section>
    <section id="tauhid" className="report-anchor"><SectionTitle title="Tauhid Gap Review" note="Practice-level severity"/><GapOverview report={report} observations={observations}/></section>
    <section id="spread" className="report-anchor"><SectionTitle title="Mythos Spread Map" note="Repository-owned locality coordinates"/><div className="map-shell report-map"><LeafletMap observations={observations}/><Legend/></div></section>
    <section id="disasters" className="report-anchor"><SectionTitle title="Disaster Map" note={`${disasters.events?.length||0} independently sourced events`}/><div className="map-shell report-map"><LeafletMap observations={observations} disasters={disasters.events||[]} mode="disaster"/><DisasterLegend/></div><DisasterCards events={disasters.events||[]}/></section>
    <section id="correlation-report" className="report-anchor"><SectionTitle title="Correlation / Timeline Engine" note="Proximity score is not causality"/><CorrelationTable rows={relationRows.slice(0,12)}/></section>
    <section id="evidence-report" className="report-anchor"><SectionTitle title="Evidence Ledger" note={`${evidence.length} sources`}/><EvidenceTable evidence={evidence}/></section>
    <section id="revelation-report" className="report-anchor"><SectionTitle title="Four Revelation Lens" note="Theological comparison points"/><RevelationBoard revelation={revelation}/></section>
  </section>
}

function Kpis({report}) { return <section className="kpi-grid">{(report.kpis||[]).slice(0,8).map((item,i)=><article className={`kpi-card tone-${KPI_TONES[i%KPI_TONES.length]}`} key={item.label}><div className="kpi-top"><span>{item.label}</span><Zap size={16}/></div><strong>{item.value}</strong><p>{item.note}</p></article>)}</section> }
function SummaryMetric({label,value}){return <div><span>{label}</span><strong>{value}</strong></div>}
function SectionTitle({title,note}){return <div className="standalone-heading"><div><span>{title}</span><small>{note}</small></div></div>}

function ObservationTable({observations}) {
  if(!observations.length) return <Empty/>
  return <section className="section-panel"><div className="data-table-wrap"><table className="data-table observation-table"><thead><tr><th>ID</th><th>Date</th><th>Location</th><th>Practice / Observation</th><th>Evidence</th><th>Tauhid Gap</th><th>Cause</th><th>Geo</th><th>Source</th></tr></thead><tbody>{observations.map(item=><tr key={item._id}><td><strong>{item._id.replace('OBS-2026-08-','OBS-')}</strong></td><td className="date-cell">{item.date}</td><td><strong>{item.location}</strong><small>{item._geo?.province||item._geo?.scope||'—'}</small></td><td className="practice-cell"><strong>{item.practice}</strong><span>{item.summary}</span></td><td><EvidenceBadge value={item.evidence_score}/></td><td className={`gap-cell ${scoreBand(item.tauhid_gap)}`}><ScoreBadge value={item.tauhid_gap} compact/></td><td><span className="causal-score">{item.causality}</span></td><td><span className={`geo-state ${item._geo?.map_enabled?'mapped':'nonlocal'}`}>{item._geo?.map_enabled?'MAPPED':'NON-LOCAL'}</span></td><td><a className="source-link" href={item.source} target="_blank" rel="noreferrer">Source <ArrowUpRight size={12}/></a></td></tr>)}</tbody></table></div></section>
}

function GapOverview({report,observations}) {
  const counts=Object.keys(BAND).map(key=>({key,count:observations.filter(x=>scoreBand(x.tauhid_gap)===key).length}))
  return <div className="review-top-grid"><section className="gap-orbit-card"><div className="orbit-core"><Moon size={30}/><span>TAUHID</span><strong>GAP</strong></div><div className="orbit-rings"/><div className="distribution-list">{(report.gap_distribution||[]).map((item,i)=>{const key=['low','watch','high','critical'][i]||'low';return <div key={item.label}><i className={key}/><span><strong>{item.label}</strong><small>repository value</small></span><b>{item.value}</b></div>})}</div></section><section className="section-panel causality-panel"><div className="section-heading"><div><span>OBSERVED SEVERITY COUNTS</span><strong>published observations</strong></div></div><div className="severity-count-grid">{counts.map(x=><div className={x.key} key={x.key}><span>{BAND[x.key].label}</span><strong>{x.count}</strong><small>{BAND[x.key].range}</small></div>)}</div></section></div>
}

function LeafletMap({observations=[],disasters=[],mode='spread'}) {
  const ref=useRef(null), mapRef=useRef(null)
  useEffect(()=>{
    if(!ref.current)return undefined
    mapRef.current?.remove()
    const map=L.map(ref.current,{zoomControl:true,scrollWheelZoom:false}).setView([-2.8,117.2],4.35);mapRef.current=map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19,subdomains:'abcd',attribution:'&copy; OpenStreetMap &copy; CARTO'}).addTo(map)
    observations.filter(x=>x._geo?.map_enabled).forEach((item,index)=>{const color=BAND[scoreBand(item.tauhid_gap)].color;const jitter=(index%3-1)*0.025;const coords=[item._geo.lat+jitter,item._geo.lon+jitter];L.circleMarker(coords,{radius:mode==='disaster'?4:7,weight:2,color,fillColor:color,fillOpacity:mode==='disaster'?.2:.75,opacity:mode==='disaster'?.38:.95}).bindTooltip(`<strong>${item.location}</strong><br/>${item.practice}<br/>Tauhid Gap ${item.tauhid_gap}`).addTo(map)})
    disasters.filter(x=>x.coordinates).forEach(item=>{const glyph=item.type==='wildfire'?'🔥':item.type==='earthquake'?'⌁':'≋';L.marker([item.coordinates.lat,item.coordinates.lon],{icon:L.divIcon({className:`disaster-marker ${item.type}`,html:`<span>${glyph}</span>`,iconSize:[42,42],iconAnchor:[21,21]})}).bindTooltip(`<strong>${item.location}</strong><br/>${item.label}<br/>Causality ${item.causality?.score ?? '—'}/100`).addTo(map)})
    setTimeout(()=>map.invalidateSize(),80);return()=>{map.remove();mapRef.current=null}
  },[observations,disasters,mode])
  return <div ref={ref} className="leaflet-stage"/>
}
function Legend(){return <div className="severity-legend"><div className="legend-title"><CircleDot size={16}/><span>TAUHID-GAP SEVERITY</span></div>{Object.entries(BAND).map(([key,item])=><div className="legend-row" key={key}><i className={key}/><span><strong>{item.label}</strong><small>{item.range}</small></span></div>)}</div>}
function DisasterLegend(){return <div className="disaster-legend"><div><span className="fire-symbol">🔥</span><strong>WILDFIRE / KARHUTLA</strong></div><div><span className="quake-symbol">⌁</span><strong>EARTHQUAKE</strong></div><div><span className="flood-symbol">≋</span><strong>FLOOD</strong></div></div>}

function SpreadMapPage({month,observations}) {
  const local=observations.filter(x=>x._geo?.map_enabled), nonLocal=observations.filter(x=>!x._geo?.map_enabled)
  return <section><PageTitle code="02 / 08" title={`${month.label} — Mythos Spread Map`} subtitle="All map points come from repository geography metadata; non-local and online records are kept off the geographic layer."/><div className="map-dashboard"><div className="map-shell"><div className="map-ribbon"><span>INDONESIA</span><i>•</i><span>REPOSITORY GEOGRAPHY</span><i>•</i><strong>{month.label.toUpperCase()}</strong></div><LeafletMap observations={observations}/><Legend/></div><aside className="map-aside"><section className="mini-panel"><div className="mini-heading"><Globe2 size={17}/><span>GEOGRAPHY STATUS</span></div><div className="region-list"><RegionRow label="Mapped observations" value={local.length} tone="green"/><RegionRow label="Non-local / national" value={nonLocal.length} tone="violet"/><RegionRow label="Repository coordinates" value={local.length} tone="cyan"/></div></section></aside></div><ObservationTable observations={observations}/></section>
}
function RegionRow({label,value,tone}){return <div className={`region-row ${tone}`}><span className="region-dot"><MapPinned size={15}/></span><strong>{label}</strong><b>{value}</b><small>records</small></div>}

function DisasterMapPage({month,observations,disasters}) {
  const events=disasters.events||[]
  return <section><PageTitle code="03 / 08" title={`${month.label} — Disaster Map`} subtitle="A dedicated disaster dataset, independently sourced from the ritual ledger. Observation points are intentionally faint; disaster points remain primary."/><div className="map-dashboard disaster-layout"><div className="map-shell disaster-shell"><div className="map-ribbon"><span>INDONESIA</span><i>•</i><span>DISASTER DATASET</span><i>•</i><strong>NO CAUSAL ASSUMPTION</strong></div><LeafletMap observations={observations} disasters={events} mode="disaster"/><DisasterLegend/></div><aside className="map-aside"><section className="mini-panel disaster-summary"><div className="mini-heading"><AlertTriangle size={17}/><span>DISASTER SUMMARY</span></div>{events.map(item=><article key={item.id} className={`disaster-summary-row ${item.type}`}><span className="disaster-type-icon">{item.type==='wildfire'?'🔥':item.type==='earthquake'?'⌁':'≋'}</span><div><strong>{item.label}</strong><small>{item.location} · evidence {item.evidence_score}</small><p>{item.causality?.finding}</p></div></article>)}</section><section className="disclaimer-card"><ShieldCheck size={28}/><div><strong>EVIDENCE-FIRST DISCLAIMER</strong><p>Temporal proximity is not proof of causation. Natural and human mechanisms remain primary unless independently established.</p></div></section></aside></div><DisasterRegister events={events}/></section>
}
function DisasterCards({events}){if(!events.length)return <Empty title="No disaster rows yet"/>;return <div className="disaster-card-grid">{events.map(item=><article key={item.id} className={item.type}><span>{item.id}</span><strong>{item.location}</strong><b>{item.label}</b><p>{item.natural_or_human_cause}</p><a href={item.source?.url} target="_blank" rel="noreferrer">{item.source?.publisher} <ArrowUpRight size={12}/></a></article>)}</div>}
function DisasterRegister({events}){if(!events.length)return <Empty title="No disaster events published yet"/>;return <section className="section-panel compact-table-panel"><div className="section-heading"><div><span>DISASTER REGISTER</span><strong>{events.length} independently sourced events</strong></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>ID</th><th>Date</th><th>Location</th><th>Type</th><th>Evidence</th><th>Causality</th><th>Cause / mechanism</th><th>Source</th></tr></thead><tbody>{events.map(item=><tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.date_start?.slice(0,10)}</td><td><strong>{item.location}</strong><small>{item.admin_area}</small></td><td><span className={`disaster-chip ${item.type}`}>{item.type==='wildfire'?<Flame size={14}/>:item.type==='earthquake'?<Radio size={14}/>:<Waves size={14}/>} {item.label}</span></td><td><EvidenceBadge value={item.evidence_score}/></td><td><span className="causal-score large">{item.causality?.score}</span></td><td>{item.natural_or_human_cause}</td><td><a className="source-link cyan" href={item.source?.url} target="_blank" rel="noreferrer">{item.source?.publisher} <ArrowUpRight size={12}/></a></td></tr>)}</tbody></table></div></section>}

function CorrelationPage({month,rows}) { return <section><PageTitle code="04 / 08" title={`${month.label} — Correlation / Timeline Engine`} subtitle="The engine detects temporal and geographic proximity, then keeps that score separate from reviewed causality. Automatic rows are discovery aids only."/><div className="engine-flow"><span>MYTHOS</span><i>→</i><span>RITUAL</span><i>→</i><span>MEDIA</span><i>→</i><span>DISASTER</span><i>→</i><span>ΔT + DISTANCE</span><i>→</i><strong>CAUSALITY REVIEW</strong></div><CorrelationTable rows={rows}/></section> }
function CorrelationTable({rows}){if(!rows.length)return <Empty title="No correlation rows yet" text="Reviewed relations appear only after independent observation and disaster data exist."/>;return <section className="section-panel correlation-panel"><div className="section-heading"><div><span>CORRELATION REGISTER</span><strong>{rows.length} reviewed + proximity-only rows</strong></div></div><div className="data-table-wrap"><table className="data-table correlation-table"><thead><tr><th>State</th><th>Relation</th><th>ΔT</th><th>Distance</th><th>Proximity</th><th>Causality</th><th>Finding / guardrail</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} className={row.kind}><td><span className={`relation-state ${row.kind}`}>{row.kind==='reviewed'?'REVIEWED':'AUTO ONLY'}</span></td><td><strong>{row.relation}</strong><small>{row.status}</small></td><td>{row.deltaHours==null?'—':`${row.deltaHours} h`}</td><td>{row.distanceKm==null?'—':`${row.distanceKm} km`}</td><td><span className={`proximity-chip ${proximityBand(row.proximityScore)}`}>{row.proximityScore}/100</span></td><td>{row.causalityScore==null?<span className="unreviewed">UNREVIEWED</span>:<span className="causal-score large">{row.causalityScore}</span>}</td><td><strong>{row.finding}</strong><small>{row.guardrail}</small>{row.competingExplanations?.length>0&&<ul>{row.competingExplanations.slice(0,3).map(x=><li key={x}>{x}</li>)}</ul>}</td></tr>)}</tbody></table></div></section>}

function ReviewPage({month,report,issues,observations}) { return <section><PageTitle code="05 / 08" title={`${month.label} — Tauhid Review`} subtitle="Color-coded practice-level review. High Tauhid Gap flags a practice for clarification; it is not a judgment on a religion, ethnicity or community."/><GapOverview report={report} observations={observations}/>{issues.length?<section className="section-panel issue-register"><div className="section-heading"><div><span>TAUHID ISSUE REGISTER</span><strong>{issues.length} rows</strong></div></div><div className="data-table-wrap"><table className="data-table review-table"><thead><tr><th>ID</th><th>Priority</th><th>Target</th><th>Issue</th><th>Status</th><th>Resolution</th></tr></thead><tbody>{issues.map(item=><tr key={item.id}><td><strong>{item.id}</strong></td><td><span className={`priority-chip ${priorityBand(item.priority)}`}><AlertTriangle size={13}/>{item.priority}</span></td><td>{item.target}</td><td className="issue-cell">{item.issue}</td><td>{item.status}</td><td className="resolution-cell">{item.resolution}</td></tr>)}</tbody></table></div></section>:<Empty title="No issues published yet"/>}</section> }

function EvidencePage({month,evidence}) { return <section><PageTitle code="06 / 08" title={`${month.label} — Evidence Ledger`} subtitle="Source types remain separate from the claims they document."/><EvidenceTable evidence={evidence}/></section> }
function EvidenceTable({evidence}){if(!evidence.length)return <Empty title="Evidence ledger is empty"/>;return <section className="section-panel evidence-ledger"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Type</th><th>Title</th><th>Description</th><th>Source</th></tr></thead><tbody>{evidence.map(item=><tr key={`${item.type}-${item.title}`}><td><SourceTypeBadge type={item.type}/></td><td><strong>{item.title}</strong></td><td>{item.description}</td><td><a className="source-link cyan" href={item.url} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={12}/></a></td></tr>)}</tbody></table></div></section>}
function SourceTypeBadge({type}){const t=String(type||'Source').toLowerCase();const tone=t.includes('official')?'official':t.includes('video')?'video':t.includes('photo')?'photo':t.includes('radio')?'radio':t.includes('religious')?'religious':t.includes('primary')?'primary':t.includes('narrative')?'narrative':'media';return <span className={`source-type ${tone}`}><span>{tone==='official'?'⬡':tone==='video'?'▶':tone==='photo'?'▣':tone==='radio'?'◉':tone==='primary'?'▤':'◆'}</span>{type}</span>}

function RevelationPage({month,revelation}) { return <section><PageTitle code="07 / 08" title={`${month.label} — Four Revelation Lens`} subtitle={revelation?.principle||'Cross-reference framework for Tawhid comparison points.'}/><RevelationBoard revelation={revelation}/></section> }
function RevelationBoard({revelation}){const tone={Q:'quran',I:'gospel',T:'torah',Z:'psalms'};return <div className="revelation-board">{(revelation?.traditions||[]).map(item=><article className={`revelation-row ${tone[item.key]||''}`} key={item.key}><div className="revelation-key">{item.key}</div><div className="revelation-name"><span>{item.name}</span><strong>{(item.references||[]).join(' · ')}</strong></div><p>{item.focus}</p><a href={item.url} target="_blank" rel="noreferrer">Open reference <ArrowUpRight size={13}/></a></article>)}</div>}

function PipelinePage({month,candidates}) { const counts=workflowCounts(candidates); return <section><PageTitle code="08 / 08" title={`${month.label} — Candidate Pipeline`} subtitle="Automated monitoring may create DISCOVERED candidates only. Publication requires explicit source verification and analysis."/><div className="pipeline-flow">{WORKFLOW.map((stage,i)=><React.Fragment key={stage}><div className={`pipeline-stage stage-${stage.toLowerCase()}`}><span>{String(i+1).padStart(2,'0')}</span><strong>{stage}</strong><b>{counts.find(x=>x.stage===stage)?.count||0}</b></div>{i<WORKFLOW.length-1&&<i>→</i>}</React.Fragment>)}</div>{candidates.length?<section className="section-panel"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>ID</th><th>Status</th><th>Type</th><th>Title</th><th>Source check</th><th>Verification</th><th>First seen</th></tr></thead><tbody>{candidates.map(item=><tr key={item.id}><td><strong>{item.id}</strong></td><td><span className={`candidate-status ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.type}</td><td><a className="source-link cyan" href={item.url} target="_blank" rel="noreferrer">{item.title} <ArrowUpRight size={12}/></a></td><td>{item.sourceCheck?.status||'PENDING'}</td><td>{item.verification?.status||'NOT_VERIFIED'}</td><td>{item.firstSeen?.slice(0,10)||'—'}</td></tr>)}</tbody></table></div></section>:<Empty title="No candidate signals yet" text="The six-hour monitor will populate DISCOVERED candidates when the selected month is active."/>}</section> }
