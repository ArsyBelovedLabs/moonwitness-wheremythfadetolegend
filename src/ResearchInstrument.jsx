import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import {
  AlertTriangle, ArrowUpRight, BookOpen, CalendarDays, CircleDot, Database,
  FileSearch, Flame, GitCompareArrows, Globe2, MapPinned, Moon, Radio,
  ShieldCheck, Waves, Zap, Workflow,
} from 'lucide-react'
import { buildCorrelationRows, proximityBand, workflowCounts, WORKFLOW } from './lib/correlation.js'
import { createStaticDataAdapter, describeMonthSource } from './lib/static-data-adapter.js'

const dataAdapter = createStaticDataAdapter()

const NAV = [
  ['report', 'Monthly Report', FileSearch],
  ['spread-map', 'Spread Map', MapPinned],
  ['disaster-map', 'Disaster Map', AlertTriangle],
  ['correlation', 'Correlation Engine', GitCompareArrows],
  ['review', 'Practice-Level Review', ShieldCheck],
  ['evidence', 'Evidence', Database],
  ['revelation', 'Four Revelation Lens', BookOpen],
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
const observationKey = item => `${item.date}|${item.location}|${item.practice}`

function enrichObservations(report, geography) {
  const geoByMatch = new Map((geography?.observations || []).map(item => [observationKey(item.match || {}), item]))
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
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'report/2026-08')

  useEffect(() => {
    const onHash = () => {
      const nextRoute = window.location.hash.slice(1) || 'report/2026-08'
      const nextMonthId = nextRoute.match(/report\/(\d{4}-\d{2})/)?.[1]
      const nextMonth = registry.months.find(item => item.id === nextMonthId)
      setRoute(nextRoute)
      if (nextMonth) setMonth(current => current?.id === nextMonth.id ? current : nextMonth)
      window.scrollTo({ top: 0, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [registry.months])

  useEffect(() => {
    dataAdapter.readRegistry().then(data => {
      setRegistry(data)
      const requested = window.location.hash.match(/report\/(\d{4}-\d{2})/)?.[1]
      setMonth(data.months?.find(x => x.id === requested) || data.months?.find(x => x.id === '2026-08') || data.months?.[0] || null)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (!month) return
    setReport(null)
    dataAdapter.readMonth(month).then(({ report: nextReport, issues: nextIssues, evidence: nextEvidence, revelation: nextRevelation, geography: nextGeography, disasters: nextDisasters, correlations: nextCorrelations, candidates: nextCandidates }) => {
      setReport(nextReport); setIssues(nextIssues); setEvidence(nextEvidence); setRevelation(nextRevelation); setGeography(nextGeography); setDisasters(nextDisasters); setCorrelations(nextCorrelations); setCandidates(nextCandidates)
    }).catch(console.error)
  }, [month])

  const observations = useMemo(() => enrichObservations(report, geography), [report, geography])
  const relationRows = useMemo(() => buildCorrelationRows(observations, disasters.events || [], correlations.reviews || []), [observations, disasters, correlations])
  const requestedRoot = routeRoot(route)
  const root = NAV.some(([key]) => key === requestedRoot) ? requestedRoot : 'report'
  if (!report) return <div className="wm-loading"><div className="loading-orbit"><Moon size={30}/><span>Synchronizing research instrument…</span></div></div>

  return <div className="research-app">
    <main className="wm-main">
      <div className="wm-content">
        {root==='report'&&<UnifiedReport month={month} report={report} observations={observations} issues={issues} evidence={evidence} revelation={revelation} disasters={disasters} relationRows={relationRows}/>} 
        {root==='spread-map'&&<SpreadMapPage month={month} observations={observations}/>} 
        {root==='disaster-map'&&<DisasterMapPage month={month} observations={observations} disasters={disasters}/>} 
        {root==='correlation'&&<CorrelationPage month={month} rows={relationRows}/>} 
        {root==='review'&&<ReviewPage month={month} report={report} issues={issues} observations={observations}/>} 
        {root==='evidence'&&<EvidencePage month={month} evidence={evidence}/>} 
        {root==='revelation'&&<RevelationPage month={month} revelation={revelation}/>} 
        {root==='pipeline'&&<PipelinePage month={month} candidates={candidates.candidates||[]}/>} 
      </div>
    </main>
  </div>
}

function PageTitle({code,title,subtitle,children}) { return <div className="page-title"><div><span className="page-code">{code}</span><h1>{title}</h1><p>{subtitle}</p></div>{children}</div> }
function ScoreBadge({value,compact=false}) { const band=scoreBand(value); return <span className={`score-badge ${band} ${compact?'compact':''}`}><i/>{value}{compact?'':'/100'}<small>{BAND[band].label}</small></span> }
function EvidenceBadge({value}) { return <span className={`evidence-badge ${evidenceTone(value)}`}><ShieldCheck size={13}/>{value}</span> }
function Empty({title='No published rows yet',text='This month is still collecting candidate signals.'}) { return <div className="research-empty"><Radio size={22}/><strong>{title}</strong><span>{text}</span></div> }
function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'})}

function UnifiedReport({month,report,observations,issues,evidence,revelation,disasters,relationRows}) {
  const sections=[['overview','Overview'],['observations','Observations'],['tauhid','Practice Review'],['spread','Spread Map'],['disasters','Disasters'],['correlation-report','Correlation'],['evidence-report','Evidence'],['revelation-report','Revelation']]
  const source = describeMonthSource(month)
  return <section>
    <PageTitle code="PUBLIC MONTHLY REPORT" title={`${month.label} — Monthly Report`} subtitle="Default Observatory Home Experience: observations, geography, disaster context, practice-level review, correlation, evidence and Four Revelation Lens on one frozen auditable surface."><div className="report-period"><CalendarDays size={18}/><span>DATA SOURCE</span><strong>{source.label}</strong></div></PageTitle>
    <div className="report-section-nav">{sections.map(([id,label])=><button key={id} onClick={()=>scrollToId(id)}>{label}</button>)}</div>
    <section id="overview" className="report-anchor"><Kpis report={report}/><div className="instrument-summary"><SummaryMetric label="Observations" value={observations.length}/><SummaryMetric label="Disasters" value={disasters.events?.length||0}/><SummaryMetric label="Practice issues" value={issues.length}/><SummaryMetric label="Evidence" value={evidence.length}/><SummaryMetric label="Reviewed relations" value={relationRows.filter(x=>x.kind==='reviewed').length}/></div></section>
    <section id="observations" className="report-anchor"><SectionTitle title="Observation Ledger" note={`${observations.length} published rows`}/><ObservationTable observations={observations}/></section>
    <section id="tauhid" className="report-anchor"><SectionTitle title="Practice-Level Review" note="Tauhid Gap is a practice-level severity metric; no person or faith judgment"/><GapOverview report={report} observations={observations}/></section>
    <section id="spread" className="report-anchor"><SectionTitle title="Spread Map" note="Repository-owned observation geography"/><div className="map-shell report-map"><LeafletMap observations={observations}/><Legend/></div></section>
    <section id="disasters" className="report-anchor"><SectionTitle title="Disaster Map" note={`${disasters.events?.length||0} independently sourced events`}/><div className="map-shell report-map"><LeafletMap observations={observations} disasters={disasters.events||[]} mode="disaster"/><DisasterLegend/></div><DisasterCards events={disasters.events||[]}/></section>
    <section id="correlation-report" className="report-anchor"><SectionTitle title="Correlation Engine" note="Chronology is contextual; proximity is not causality"/><CorrelationTable rows={relationRows.slice(0,12)}/></section>
    <section id="evidence-report" className="report-anchor"><SectionTitle title="Evidence Ledger" note={`${evidence.length} sources`}/><EvidenceTable evidence={evidence}/></section>
    <section id="revelation-report" className="report-anchor"><SectionTitle title="Four Revelation Lens" note="Exactly four canonical comparison lenses"/><RevelationBoard revelation={revelation}/></section>
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
    const resizeTimer=window.setTimeout(()=>{if(mapRef.current===map&&ref.current)map.invalidateSize()},80);return()=>{window.clearTimeout(resizeTimer);map.remove();mapRef.current=null}
  },[observations,disasters,mode])
  return <div ref={ref} className="leaflet-stage"/>
}
function Legend(){return <div className="severity-legend"><div className="legend-title"><CircleDot size={16}/><span>TAUHID-GAP SEVERITY</span></div>{Object.entries(BAND).map(([key,item])=><div className="legend-row" key={key}><i className={key}/><span><strong>{item.label}</strong><small>{item.range}</small></span></div>)}</div>}
function DisasterLegend(){return <div className="disaster-legend"><div><span className="fire-symbol">🔥</span><strong>WILDFIRE / KARHUTLA</strong></div><div><span className="quake-symbol">⌁</span><strong>EARTHQUAKE</strong></div><div><span className="flood-symbol">≋</span><strong>FLOOD</strong></div></div>}

function SpreadMapPage({month,observations}) {
  const local=observations.filter(x=>x._geo?.map_enabled), nonLocal=observations.filter(x=>!x._geo?.map_enabled)
  return <section><PageTitle code="02 / 08" title={`${month.label} — Spread Map`} subtitle="Observation geography only. All map points come from repository geography metadata; non-local and online records are kept off the geographic layer."/><div className="map-dashboard"><div className="map-shell"><div className="map-ribbon"><span>INDONESIA</span><i>•</i><span>OBSERVATION GEOGRAPHY</span><i>•</i><strong>{month.label.toUpperCase()}</strong></div><LeafletMap observations={observations}/><Legend/></div><aside className="map-aside"><section className="mini-panel"><div className="mini-heading"><Globe2 size={17}/><span>GEOGRAPHY STATUS</span></div><div className="region-list"><RegionRow label="Mapped observations" value={local.length} tone="green"/><RegionRow label="Non-local / national" value={nonLocal.length} tone="violet"/><RegionRow label="Repository coordinates" value={local.length} tone="cyan"/></div></section></aside></div><ObservationTable observations={observations}/></section>
}
function RegionRow({label,value,tone}){return <div className={`region-row ${tone}`}><span className="region-dot"><MapPinned size={15}/></span><strong>{label}</strong><b>{value}</b><small>records</small></div>}

function DisasterMapPage({month,observations,disasters}) {
  const events=disasters.events||[]
  return <section><PageTitle code="03 / 08" title={`${month.label} — Disaster Map`} subtitle="A dedicated disaster dataset, independently sourced from the observation ledger. Observation points are intentionally faint; disaster points remain primary."/><div className="map-dashboard disaster-layout"><div className="map-shell disaster-shell"><div className="map-ribbon"><span>INDONESIA</span><i>•</i><span>DISASTER DATASET</span><i>•</i><strong>NO CAUSAL ASSUMPTION</strong></div><LeafletMap observations={observations} disasters={events} mode="disaster"/><DisasterLegend/></div><aside className="map-aside"><section className="mini-panel disaster-summary"><div className="mini-heading"><AlertTriangle size={17}/><span>DISASTER SUMMARY</span></div>{events.map(item=><article key={item.id} className={`disaster-summary-row ${item.type}`}><span className="disaster-type-icon">{item.type==='wildfire'?'🔥':item.type==='earthquake'?'⌁':'≋'}</span><div><strong>{item.label}</strong><small>{item.location} · evidence {item.evidence_score}</small><p>{item.causality?.finding}</p></div></article>)}</section><section className="disclaimer-card"><ShieldCheck size={28}/><div><strong>EVIDENCE-FIRST DISCLAIMER</strong><p>Temporal/geographic proximity does not establish causation. Natural and human mechanisms remain primary unless independently established.</p></div></section></aside></div><DisasterRegister events={events}/></section>
}
function DisasterCards({events}){if(!events.length)return <Empty title="No disaster rows yet"/>;return <div className="disaster-card-grid">{events.map(item=><article key={item.id} className={item.type}><span>{item.id}</span><strong>{item.location}</strong><b>{item.label}</b><p>{item.natural_or_human_cause}</p><a href={item.source?.url} target="_blank" rel="noreferrer">{item.source?.publisher} <ArrowUpRight size={12}/></a></article>)}</div>}
function DisasterRegister({events}){if(!events.length)return <Empty title="No disaster events published yet"/>;return <section className="section-panel compact-table-panel"><div className="section-heading"><div><span>DISASTER REGISTER</span><strong>{events.length} independently sourced events</strong></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>ID</th><th>Date</th><th>Location</th><th>Type</th><th>Evidence</th><th>Causality</th><th>Cause / mechanism</th><th>Source</th></tr></thead><tbody>{events.map(item=><tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.date_start?.slice(0,10)}</td><td><strong>{item.location}</strong><small>{item.admin_area}</small></td><td><span className={`disaster-chip ${item.type}`}>{item.type==='wildfire'?<Flame size={14}/>:item.type==='earthquake'?<Radio size={14}/>:<Waves size={14}/>} {item.label}</span></td><td><EvidenceBadge value={item.evidence_score}/></td><td><span className="causal-score large">{item.causality?.score}</span></td><td>{item.natural_or_human_cause}</td><td><a className="source-link cyan" href={item.source?.url} target="_blank" rel="noreferrer">{item.source?.publisher} <ArrowUpRight size={12}/></a></td></tr>)}</tbody></table></div></section>}

function CorrelationPage({month,rows}) { return <section><PageTitle code="04 / 08" title={`${month.label} — Correlation Engine`} subtitle="The engine detects temporal and geographic proximity, then keeps that score separate from reviewed causality. Temporal/geographic proximity does not establish causation."/><div className="engine-flow"><span>MYTHOS</span><i>→</i><span>RITUAL</span><i>→</i><span>MEDIA</span><i>→</i><span>DISASTER</span><i>→</i><span>ΔT + DISTANCE</span><i>→</i><strong>CAUSALITY REVIEW</strong></div><CorrelationTable rows={rows}/></section> }
function CorrelationTable({rows}){if(!rows.length)return <Empty title="No correlation rows yet" text="Reviewed relations appear only after independent observation and disaster data exist."/>;return <section className="section-panel correlation-panel"><div className="section-heading"><div><span>CORRELATION REGISTER</span><strong>{rows.length} reviewed + proximity-only rows</strong></div></div><div className="data-table-wrap"><table className="data-table correlation-table"><thead><tr><th>State</th><th>Relation</th><th>ΔT</th><th>Distance</th><th>Proximity</th><th>Causality</th><th>Finding / guardrail</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} className={row.kind}><td><span className={`relation-state ${row.kind}`}>{row.kind==='reviewed'?'REVIEWED':'AUTO ONLY'}</span></td><td><strong>{row.relation}</strong><small>{row.status}</small></td><td>{row.deltaHours==null?'—':`${row.deltaHours} h`}</td><td>{row.distanceKm==null?'—':`${row.distanceKm} km`}</td><td><span className={`proximity-chip ${proximityBand(row.proximityScore)}`}>{row.proximityScore}/100</span></td><td>{row.causalityScore==null?<span className="unreviewed">UNREVIEWED</span>:<span className="causal-score large">{row.causalityScore}</span>}</td><td><strong>{row.finding}</strong><small>{row.guardrail}</small>{row.competingExplanations?.length>0&&<ul>{row.competingExplanations.slice(0,3).map(x=><li key={x}>{x}</li>)}</ul>}</td></tr>)}</tbody></table></div></section>}

function ReviewPage({month,report,issues,observations}) { return <section><PageTitle code="05 / 08" title={`${month.label} — Practice-Level Review`} subtitle="PRACTICE-LEVEL REVIEW ONLY. Tauhid Gap flags a practice for clarification; it is not a judgment on a person, religion, ethnicity or community."/><GapOverview report={report} observations={observations}/>{issues.length?<section className="section-panel issue-register"><div className="section-heading"><div><span>PRACTICE REVIEW ISSUE REGISTER</span><strong>{issues.length} rows</strong></div></div><div className="data-table-wrap"><table className="data-table review-table"><thead><tr><th>ID</th><th>Priority</th><th>Target</th><th>Issue</th><th>Status</th><th>Resolution</th></tr></thead><tbody>{issues.map(item=><tr key={item.id}><td><strong>{item.id}</strong></td><td><span className={`priority-chip ${priorityBand(item.priority)}`}><AlertTriangle size={13}/>{item.priority}</span></td><td>{item.target}</td><td className="issue-cell">{item.issue}</td><td>{item.status}</td><td className="resolution-cell">{item.resolution}</td></tr>)}</tbody></table></div></section>:<Empty title="No practice-review issues published yet"/>}</section> }

function EvidencePage({month,evidence}) { return <section><PageTitle code="06 / 08" title={`${month.label} — Evidence Ledger`} subtitle="Source types remain separate from the claims they document."/><EvidenceTable evidence={evidence}/></section> }
function EvidenceTable({evidence}){if(!evidence.length)return <Empty title="Evidence ledger is empty"/>;return <section className="section-panel evidence-ledger"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Type</th><th>Title</th><th>Description</th><th>Source</th></tr></thead><tbody>{evidence.map(item=><tr key={`${item.type}-${item.title}`}><td><SourceTypeBadge type={item.type}/></td><td><strong>{item.title}</strong></td><td>{item.description}</td><td><a className="source-link cyan" href={item.url} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={12}/></a></td></tr>)}</tbody></table></div></section>}
function SourceTypeBadge({type}){const t=String(type||'Source').toLowerCase();const tone=t.includes('official')?'official':t.includes('video')?'video':t.includes('photo')?'photo':t.includes('radio')?'radio':t.includes('religious')?'religious':t.includes('primary')?'primary':t.includes('narrative')?'narrative':'media';return <span className={`source-type ${tone}`}><span>{tone==='official'?'⬡':tone==='video'?'▶':tone==='photo'?'▣':tone==='radio'?'◉':tone==='primary'?'▤':'◆'}</span>{type}</span>}

function RevelationPage({month,revelation}) { return <section><PageTitle code="07 / 08" title={`${month.label} — Four Revelation Lens`} subtitle={revelation?.principle||'Cross-reference framework across exactly four canonical revelation channels.'}/><RevelationBoard revelation={revelation}/></section> }
function RevelationBoard({revelation}){
  const tone={Q:'quran',I:'gospel',T:'torah',Z:'psalms'}
  const traditions=REVELATION_KEYS.map(key=>(revelation?.traditions||[]).find(item=>item.key===key))
  if(traditions.some(item=>!item)) return <Empty title="Four Revelation Lens unavailable" text="The selected month must provide canonical Q / I / T / Z entries."/>
  return <div className="revelation-board">{traditions.map(item=><article className={`revelation-row ${tone[item.key]}`} key={item.key}><div className="revelation-key">{item.key}</div><div className="revelation-name"><span>{item.name}</span><strong>{(item.references||[]).join(' · ')}</strong></div><p>{item.focus}</p><a href={item.url} target="_blank" rel="noreferrer">Open reference <ArrowUpRight size={13}/></a></article>)}</div>
}

function PipelinePage({month,candidates}) { const counts=workflowCounts(candidates); return <section><PageTitle code="08 / 08" title={`${month.label} — Candidate Pipeline`} subtitle="Automated monitoring may create DISCOVERED candidates only. Publication requires explicit source verification and analysis."/><div className="pipeline-flow">{WORKFLOW.map((stage,i)=><React.Fragment key={stage}><div className={`pipeline-stage stage-${stage.toLowerCase()}`}><span>{String(i+1).padStart(2,'0')}</span><strong>{stage}</strong><b>{counts.find(x=>x.stage===stage)?.count||0}</b></div>{i<WORKFLOW.length-1&&<i>→</i>}</React.Fragment>)}</div>{candidates.length?<section className="section-panel"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>ID</th><th>Status</th><th>Type</th><th>Title</th><th>Source check</th><th>Verification</th><th>First seen</th></tr></thead><tbody>{candidates.map(item=><tr key={item.id}><td><strong>{item.id}</strong></td><td><span className={`candidate-status ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.type}</td><td><a className="source-link cyan" href={item.url} target="_blank" rel="noreferrer">{item.title} <ArrowUpRight size={12}/></a></td><td>{item.sourceCheck?.status||'PENDING'}</td><td>{item.verification?.status||'NOT_VERIFIED'}</td><td>{item.firstSeen?.slice(0,10)||'—'}</td></tr>)}</tbody></table></div></section>:<Empty title="No candidate signals yet" text="The six-hour monitor will populate DISCOVERED candidates when the selected month is active."/>}</section> }
