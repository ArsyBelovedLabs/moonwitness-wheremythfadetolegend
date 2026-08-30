import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Database,
  FileSearch,
  Flame,
  Globe2,
  MapPinned,
  Menu,
  Moon,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Waves,
  X,
  Zap,
} from 'lucide-react'

const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
const get = async (path) => {
  const response = await fetch(`${base}/${path}`.replace(/([^:]\/)\/+/g, '$1'), { cache: 'no-store' })
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return response.json()
}

const NAV = [
  ['report', 'August Report', FileSearch],
  ['spread-map', 'Spread Map', MapPinned],
  ['disaster-map', 'Disaster Map', AlertTriangle],
  ['review', 'Tauhid Review', ShieldCheck],
  ['evidence', 'Evidence', Database],
  ['revelation', 'Revelation Lens', BookOpen],
]

const COORDS = {
  Tengger: [-7.942, 112.953],
  Karanganyar: [-7.596, 110.951],
  Banyumas: [-7.515, 109.294],
  'Barito Utara': [-0.78, 114.74],
  Tuban: [-6.897, 112.064],
  Bangka: [-2.15, 106.12],
  Medan: [3.595, 98.672],
  Mempawah: [0.35, 108.95],
  'Palangka Raya': [-2.21, 113.92],
  Cibubur: [-6.37, 106.88],
  Dieng: [-7.21, 109.92],
  Trenggalek: [-8.05, 111.7],
  Indonesia: [-2.5, 118],
  Online: [0, 0],
  'Berbagai daerah': [-2.5, 118],
}

const scoreBand = (value) => {
  const n = Number(value)
  if (n >= 76) return 'critical'
  if (n >= 41) return 'high'
  if (n >= 26) return 'watch'
  return 'low'
}

const BAND = {
  low: { label: 'LOW', range: '0–25', color: '#79f264' },
  watch: { label: 'WATCH', range: '26–40', color: '#ffd52f' },
  high: { label: 'HIGH', range: '41–75', color: '#ff861d' },
  critical: { label: 'CRITICAL', range: '76–100', color: '#ff4038' },
}

const KPI_TONES = ['green', 'amber', 'violet', 'red', 'violet', 'blue', 'cyan', 'amber']

const evidenceTone = (score) => {
  const n = Number(score)
  if (n >= 95) return 'excellent'
  if (n >= 85) return 'strong'
  if (n >= 70) return 'moderate'
  return 'weak'
}

const priorityBand = (priority) => {
  const p = String(priority || '').toUpperCase()
  if (p === 'CRITICAL') return 'critical'
  if (p === 'HIGH') return 'high'
  if (p === 'MEDIUM') return 'watch'
  return 'low'
}

function disasterContext(report) {
  const source = report?.causality || []
  const find = (name) => source.find((x) => x.name === name)
  return [
    {
      id: 'bangka-fire',
      location: 'Bangka',
      context: 'Chit Ngiat Pan',
      type: 'wildfire',
      label: 'Wildfire / Karhutla',
      coords: COORDS.Bangka,
      relation: find('Chit Ngiat Pan → karhutla Bangka'),
    },
    {
      id: 'mempawah-fire',
      location: 'Mempawah',
      context: 'Chiong Si Ku',
      type: 'wildfire',
      label: 'Wildfire / Karhutla',
      coords: COORDS.Mempawah,
      relation: find('Chiong Si Ku → karhutla Mempawah'),
    },
    {
      id: 'flores-quake',
      location: 'Flores',
      context: 'Aftershock sequence',
      type: 'earthquake',
      label: 'Earthquake',
      coords: [-8.65, 121.1],
      relation: find('Ritual → gempa Flores'),
    },
    {
      id: 'multi-flood',
      location: 'Multi-region',
      context: 'Flood reports',
      type: 'flood',
      label: 'Flood / Hydrometeorological',
      coords: null,
      relation: find('Ritual → banjir'),
    },
  ].filter((x) => x.relation)
}

function go(route) {
  window.location.hash = route
}

export default function App() {
  const [registry, setRegistry] = useState({ months: [] })
  const [month, setMonth] = useState(null)
  const [report, setReport] = useState(null)
  const [issues, setIssues] = useState([])
  const [evidence, setEvidence] = useState([])
  const [revelation, setRevelation] = useState({ traditions: [] })
  const [monitor, setMonitor] = useState(null)
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'report')
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.slice(1) || 'report')
      setMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    get('data/index.json')
      .then((data) => {
        setRegistry(data)
        setMonth(data.months?.find((item) => item.id === '2026-08') || data.months?.[0] || null)
      })
      .catch(console.error)
    get('data/monitor/latest.json').then(setMonitor).catch(() => {})
  }, [])

  useEffect(() => {
    if (!month) return
    Promise.all([get(month.path), get(month.issues), get(month.evidence), get(month.revelation)])
      .then(([nextReport, nextIssues, nextEvidence, nextRevelation]) => {
        setReport(nextReport)
        setIssues(nextIssues)
        setEvidence(nextEvidence)
        setRevelation(nextRevelation)
      })
      .catch(console.error)
  }, [month])

  const observations = report?.observations || []
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return observations
      .filter((item) => [item.date, item.location, item.actor, item.practice, item.summary].join(' ').toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, observations])

  if (!report) {
    return (
      <div className="wm-loading">
        <div className="loading-orbit"><Moon size={30} /><span>Synchronizing Where Myth Fade to Legend…</span></div>
      </div>
    )
  }

  return (
    <div className="wm-app">
      <div className="cosmic-noise" />
      <aside className={`wm-sidebar ${menuOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        <button className="wm-brand" onClick={() => go('report')}>
          <span className="brand-orbit"><Moon size={23} /></span>
          <span className="brand-copy">
            <small>MOONWITNESS SUBMODULE</small>
            <strong>WHERE MYTH FADE TO LEGEND</strong>
            <em>COUNTER-MYTHOS OBSERVATORY</em>
          </span>
        </button>
        <div className="brand-rule" />
        <nav className="wm-nav">
          {NAV.map(([key, label, Icon], index) => (
            <button key={key} className={route === key ? 'active' : ''} onClick={() => go(key)}>
              <span className="nav-index">{String(index + 1).padStart(2, '0')}</span>
              <Icon size={17} />
              <span>{label}</span>
              <ChevronRight className="nav-arrow" size={14} />
            </button>
          ))}
        </nav>
        <div className="sidebar-doctrine">
          <Sparkles size={16} />
          <div><strong>COUNTER-MYTHOS MISSION</strong><span>Observe patterns. Verify claims. Clarify context. Purify unsupported certainty.</span></div>
        </div>
        <div className="sidebar-status">
          <span className="pulse-dot" />
          <div><strong>{monitor?.status === 'WAITING_FOR_FIRST_SCHEDULED_SCAN' ? 'MONITOR READY' : 'MONITOR ACTIVE'}</strong><small>{monitor?.status || 'Repository-grounded'}</small></div>
        </div>
      </aside>

      <main className="wm-main">
        <header className="wm-topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
          <div className="top-context">
            <span>WHERE MYTH FADE TO LEGEND</span>
            <i>•</i>
            <strong>{month?.label || report.month || 'August 2026'}</strong>
          </div>
          <div className="top-actions">
            <div className="wm-search">
              <Search size={15} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search observation…" aria-label="Search observation" />
              {searchResults.length > 0 && (
                <div className="search-popover">
                  {searchResults.map((item) => (
                    <button key={`${item.date}-${item.practice}`} onClick={() => { setQuery(''); go('report') }}>
                      <span>{item.location}</span><b>{item.practice}</b><small>{item.date} · Tauhid Gap {item.tauhid_gap}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select value={month?.id || ''} onChange={(event) => setMonth(registry.months.find((item) => item.id === event.target.value))}>
              {registry.months.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <div className="repo-chip"><CircleDot size={13} /> REPOSITORY-GROUNDED</div>
          </div>
        </header>

        <div className="wm-content">
          {route === 'report' && <ReportPage report={report} observations={observations} issues={issues} evidence={evidence} go={go} />}
          {route === 'spread-map' && <SpreadMapPage report={report} observations={observations} />}
          {route === 'disaster-map' && <DisasterMapPage report={report} observations={observations} />}
          {route === 'review' && <ReviewPage report={report} issues={issues} observations={observations} />}
          {route === 'evidence' && <EvidencePage evidence={evidence} />}
          {route === 'revelation' && <RevelationPage revelation={revelation} />}
          {!NAV.some(([key]) => key === route) && <ReportPage report={report} observations={observations} issues={issues} evidence={evidence} go={go} />}
        </div>

        <footer className="wm-footer">
          <div><strong>WHERE MYTH FADE TO LEGEND</strong><span>MoonWitness submodule · counter-mythos observatory</span></div>
          <div className="footer-doctrine">OBSERVE • VERIFY • CLARIFY • PURIFY</div>
          <div className="footer-guardrail">Practice-level review only. Temporal proximity is not causation.</div>
        </footer>
      </main>
    </div>
  )
}

function PageTitle({ code, title, subtitle, children }) {
  return (
    <div className="page-title">
      <div><span className="page-code">{code}</span><h1>{title}</h1><p>{subtitle}</p></div>
      {children}
    </div>
  )
}

function ScoreBadge({ value, compact = false }) {
  const band = scoreBand(value)
  return <span className={`score-badge ${band} ${compact ? 'compact' : ''}`}><i />{value}{compact ? '' : '/100'}<small>{BAND[band].label}</small></span>
}

function EvidenceBadge({ value }) {
  return <span className={`evidence-badge ${evidenceTone(value)}`}><ShieldCheck size={13} />{value}</span>
}

function ReportPage({ report, observations, issues, evidence, go: navigate }) {
  return (
    <section className="report-page">
      <PageTitle code="01 / 06" title="August 2026 — Master Report" subtitle="Complete repository-grounded observation ledger for Indonesia. Data is rendered directly from the frozen August report.">
        <div className="report-period"><CalendarDays size={18} /><span>REPORT PERIOD</span><strong>{report.month || 'August 2026'}</strong></div>
      </PageTitle>

      <section className="kpi-grid">
        {(report.kpis || []).slice(0, 8).map((item, index) => (
          <article className={`kpi-card tone-${KPI_TONES[index % KPI_TONES.length]}`} key={item.label}>
            <div className="kpi-top"><span>{item.label}</span><Zap size={16} /></div>
            <strong>{item.value}</strong>
            <p>{item.note}</p>
          </article>
        ))}
      </section>

      <section className="section-panel observation-panel">
        <div className="section-heading">
          <div><span>OBSERVATION LEDGER</span><strong>{observations.length} repository rows</strong></div>
          <div className="section-actions"><button onClick={() => navigate('spread-map')}><MapPinned size={15} /> Open spread map</button><button onClick={() => navigate('disaster-map')}><AlertTriangle size={15} /> Disaster map</button></div>
        </div>
        <div className="data-table-wrap">
          <table className="data-table observation-table">
            <thead><tr><th>Date</th><th>Location</th><th>Actor</th><th>Practice / Observation</th><th>Evidence</th><th>Tauhid Gap</th><th>Causality</th><th>Source</th></tr></thead>
            <tbody>
              {observations.map((item) => (
                <tr key={`${item.date}-${item.location}-${item.practice}`}>
                  <td className="date-cell">{item.date}</td>
                  <td><strong>{item.location}</strong></td>
                  <td className="actor-cell">{item.actor}</td>
                  <td className="practice-cell"><strong>{item.practice}</strong><span>{item.summary}</span></td>
                  <td><EvidenceBadge value={item.evidence_score} /></td>
                  <td className={`gap-cell ${scoreBand(item.tauhid_gap)}`}><ScoreBadge value={item.tauhid_gap} compact /></td>
                  <td><span className="causal-score">{item.causality}</span></td>
                  <td><a className="source-link" href={item.source} target="_blank" rel="noreferrer">Source <ArrowUpRight size={12} /></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="report-summary-grid">
        <article className="summary-card"><span>ISSUE REGISTER</span><strong>{issues.length}</strong><p>Practice-level clarification items queued for review.</p><button onClick={() => navigate('review')}>Open Tauhid Review <ArrowUpRight size={14} /></button></article>
        <article className="summary-card"><span>EVIDENCE LEDGER</span><strong>{evidence.length}</strong><p>Official, media, local and primary-text source entries.</p><button onClick={() => navigate('evidence')}>Open Evidence <ArrowUpRight size={14} /></button></article>
        <article className="summary-card warning"><span>CAUSAL PROOF</span><strong>{report.kpis?.find((x) => x.label === 'Causal Proof')?.value || '0–15/100'}</strong><p>Ritual → disaster is not established by the August repository.</p><button onClick={() => navigate('disaster-map')}>Inspect context <ArrowUpRight size={14} /></button></article>
      </div>
    </section>
  )
}

function LeafletMap({ observations, disasters = [], mode = 'spread' }) {
  const elementRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!elementRef.current) return undefined
    if (mapRef.current) mapRef.current.remove()

    const map = L.map(elementRef.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).setView([-2.8, 117.2], 4.35)
    mapRef.current = map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map)

    observations.forEach((item) => {
      const coords = COORDS[item.location]
      if (!coords || item.location === 'Online' || item.location === 'Indonesia' || item.location === 'Berbagai daerah') return
      const band = scoreBand(item.tauhid_gap)
      const color = BAND[band].color
      L.circleMarker(coords, { radius: mode === 'disaster' ? 5 : 7, weight: 2, color, fillColor: color, fillOpacity: mode === 'disaster' ? 0.28 : 0.72, opacity: mode === 'disaster' ? 0.45 : 0.9 })
        .bindTooltip(`<div class="map-tooltip"><strong>${item.location}</strong><span>${item.practice}</span><b>Tauhid Gap ${item.tauhid_gap}</b></div>`, { direction: 'top' })
        .addTo(map)
    })

    disasters.filter((item) => item.coords).forEach((item) => {
      const icon = item.type === 'wildfire' ? '🔥' : item.type === 'earthquake' ? '⌁' : '≋'
      const marker = L.marker(item.coords, { icon: L.divIcon({ className: `disaster-marker ${item.type}`, html: `<span>${icon}</span>`, iconSize: [42, 42], iconAnchor: [21, 21] }) })
      marker.bindTooltip(`<div class="map-tooltip disaster-tip"><strong>${item.location}</strong><span>${item.label}</span><b>Causality score ${item.relation?.score}/100</b></div>`, { direction: 'top' }).addTo(map)
    })

    setTimeout(() => map.invalidateSize(), 80)
    return () => { map.remove(); mapRef.current = null }
  }, [observations, disasters, mode])

  return <div ref={elementRef} className="leaflet-stage" />
}

function Legend() {
  return (
    <div className="severity-legend">
      <div className="legend-title"><TargetIcon /> <span>TAUHID-GAP SEVERITY</span></div>
      {Object.entries(BAND).map(([key, item]) => <div className="legend-row" key={key}><i className={key} /><span><strong>{item.label}</strong><small>{item.range}</small></span></div>)}
    </div>
  )
}

function TargetIcon() {
  return <span className="target-icon"><CircleDot size={16} /></span>
}

function SpreadMapPage({ observations }) {
  const local = observations.filter((item) => COORDS[item.location] && !['Online', 'Indonesia', 'Berbagai daerah'].includes(item.location))
  const nonLocal = observations.filter((item) => !COORDS[item.location] || ['Online', 'Indonesia', 'Berbagai daerah'].includes(item.location))
  const ranked = [...local].sort((a, b) => Number(b.tauhid_gap) - Number(a.tauhid_gap))
  return (
    <section>
      <PageTitle code="02 / 06" title="August 2026 — Mythos Spread Map" subtitle="Geographic spread of repository-grounded observations. Marker color represents Tauhid-Gap severity, not a verdict on a community." />
      <div className="map-dashboard">
        <div className="map-shell spread-shell"><div className="map-ribbon"><span>INDONESIA</span><i>•</i><span>REPOSITORY-GROUNDED OBSERVATIONS</span><i>•</i><strong>AUGUST 2026</strong></div><LeafletMap observations={observations} mode="spread" /><Legend /></div>
        <aside className="map-aside">
          <section className="mini-panel"><div className="mini-heading"><Globe2 size={17} /><span>REGIONAL SPREAD SUMMARY</span></div><div className="region-list">
            <RegionRow label="Java cluster" value={local.filter((x) => ['Tengger', 'Karanganyar', 'Banyumas', 'Tuban', 'Cibubur', 'Dieng', 'Trenggalek'].includes(x.location)).length} tone="cyan" />
            <RegionRow label="Kalimantan cluster" value={local.filter((x) => ['Barito Utara', 'Palangka Raya', 'Mempawah'].includes(x.location)).length} tone="green" />
            <RegionRow label="Sumatra cluster" value={local.filter((x) => x.location === 'Medan').length} tone="red" />
            <RegionRow label="Bangka Belitung" value={local.filter((x) => x.location === 'Bangka').length} tone="orange" />
            <RegionRow label="Non-local / national" value={nonLocal.length} tone="violet" />
          </div></section>
          <section className="mini-panel"><div className="mini-heading"><AlertTriangle size={17} /><span>HIGH-ALERT NODES</span></div><div className="hotspot-list">{ranked.slice(0, 7).map((item) => <div key={`${item.location}-${item.practice}`}><i className={scoreBand(item.tauhid_gap)} /><span><strong>{item.location}</strong><small>{item.practice}</small></span><EvidenceBadge value={item.evidence_score} /><ScoreBadge value={item.tauhid_gap} compact /></div>)}</div></section>
        </aside>
      </div>
      <section className="section-panel compact-table-panel"><div className="section-heading"><div><span>LOCALITY REGISTER</span><strong>{local.length} place-based rows</strong></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>#</th><th>Locality</th><th>Practice</th><th>Evidence</th><th>Tauhid Gap</th><th>Severity</th></tr></thead><tbody>{local.map((item, index) => <tr key={`${item.location}-${item.practice}`}><td>{String(index + 1).padStart(2, '0')}</td><td><strong>{item.location}</strong></td><td>{item.practice}</td><td><EvidenceBadge value={item.evidence_score} /></td><td className={`gap-cell ${scoreBand(item.tauhid_gap)}`}><ScoreBadge value={item.tauhid_gap} compact /></td><td><span className={`severity-label ${scoreBand(item.tauhid_gap)}`}>{BAND[scoreBand(item.tauhid_gap)].label}</span></td></tr>)}</tbody></table></div></section>
    </section>
  )
}

function RegionRow({ label, value, tone }) {
  return <div className={`region-row ${tone}`}><span className="region-dot"><MapPinned size={15} /></span><strong>{label}</strong><b>{value}</b><small>{value === 1 ? 'observation' : 'observations'}</small></div>
}

function DisasterMapPage({ report, observations }) {
  const disasters = disasterContext(report)
  return (
    <section>
      <PageTitle code="03 / 06" title="August 2026 — Disaster Map" subtitle="Disaster context is overlaid only where the August repository contains a causality finding. The map does not assert ritual → disaster causation." />
      <div className="map-dashboard disaster-layout">
        <div className="map-shell disaster-shell"><div className="map-ribbon"><span>INDONESIA</span><i>•</i><span>AUGUST 2026 DISASTER CONTEXT</span><i>•</i><strong>CAUSALITY REVIEW</strong></div><LeafletMap observations={observations} disasters={disasters} mode="disaster" /><div className="disaster-legend"><div><span className="fire-symbol">🔥</span><strong>WILDFIRE / KARHUTLA</strong></div><div><span className="quake-symbol">⌁</span><strong>EARTHQUAKE</strong></div><div><span className="flood-symbol">≋</span><strong>FLOOD / HYDROMETEOROLOGICAL</strong></div></div></div>
        <aside className="map-aside"><section className="mini-panel disaster-summary"><div className="mini-heading"><AlertTriangle size={17} /><span>AUGUST DISASTER SUMMARY</span></div>{disasters.map((item) => <article key={item.id} className={`disaster-summary-row ${item.type}`}><span className="disaster-type-icon">{item.type === 'wildfire' ? '🔥' : item.type === 'earthquake' ? '⌁' : '≋'}</span><div><strong>{item.label}</strong><small>{item.location} · {item.context}</small><p>{item.relation.finding}</p></div></article>)}</section><section className="disclaimer-card"><ShieldCheck size={28} /><div><strong>EVIDENCE-FIRST DISCLAIMER</strong><p>Temporal proximity is not proof of causation. Natural and human causes remain primary unless independently established.</p></div></section></aside>
      </div>
      <section className="section-panel compact-table-panel disaster-register"><div className="section-heading"><div><span>DISASTER CONTEXT REGISTER</span><strong>August 2026</strong></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>ID</th><th>Location / Context</th><th>Disaster type</th><th>Causality score</th><th>Repository finding</th></tr></thead><tbody>{disasters.map((item, index) => <tr key={item.id}><td>{String(index + 1).padStart(2, '0')}</td><td><strong>{item.location}</strong><small>{item.context}</small></td><td><span className={`disaster-chip ${item.type}`}>{item.type === 'wildfire' ? <Flame size={14} /> : item.type === 'earthquake' ? <Radio size={14} /> : <Waves size={14} />}{item.label}</span></td><td><span className="causal-score large">{item.relation.score}</span></td><td>{item.relation.finding}</td></tr>)}</tbody></table></div></section>
    </section>
  )
}

function ReviewPage({ report, issues, observations }) {
  const bands = Object.keys(BAND).map((key) => ({ key, count: observations.filter((item) => scoreBand(item.tauhid_gap) === key).length }))
  const distribution = report.gap_distribution || []
  return (
    <section>
      <PageTitle code="04 / 06" title="August 2026 — Tauhid Review" subtitle="Color-coded practice-level review. High Tauhid Gap flags a practice for clarification; it is not a judgment on a religion, ethnicity or community." />
      <div className="review-top-grid"><section className="gap-orbit-card"><div className="orbit-core"><Moon size={30} /><span>TAUHID</span><strong>GAP</strong></div><div className="orbit-rings" /><div className="distribution-list">{distribution.map((item, index) => { const key = ['low', 'watch', 'high', 'critical'][index] || 'low'; return <div key={item.label}><i className={key} /><span><strong>{item.label}</strong><small>repository value</small></span><b>{item.value}</b></div> })}</div></section><section className="section-panel causality-panel"><div className="section-heading"><div><span>CAUSALITY — REPOSITORY FINDINGS</span><strong>{report.causality?.length || 0} rows</strong></div></div><div className="causality-list">{(report.causality || []).map((item) => <article key={item.name}><div><strong>{item.name}</strong><span>{item.finding}</span></div><b className={`causality-score-tag ${Number(item.score) >= 80 ? 'signal' : 'low'}`}>{item.score}</b></article>)}</div></section></div>
      <section className="section-panel issue-register"><div className="section-heading"><div><span>TAUHID ISSUE REGISTER</span><strong>{issues.length} rows</strong></div><div className="band-counts">{bands.map((item) => <span className={item.key} key={item.key}>{item.count} {BAND[item.key].label}</span>)}</div></div><div className="data-table-wrap"><table className="data-table review-table"><thead><tr><th>ID</th><th>Priority</th><th>Target</th><th>Issue</th><th>Status</th><th>Resolution</th></tr></thead><tbody>{issues.map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td><span className={`priority-chip ${priorityBand(item.priority)}`}><AlertTriangle size={13} />{item.priority}</span></td><td>{item.target}</td><td className="issue-cell">{item.issue}</td><td>{item.status}</td><td className="resolution-cell">{item.resolution}</td></tr>)}</tbody></table></div></section>
    </section>
  )
}

function EvidencePage({ evidence }) {
  return (
    <section>
      <PageTitle code="05 / 06" title="August 2026 — Evidence Ledger" subtitle="Source ledger used by the observatory. Source type is visually separated from the underlying claim so evidence quality is not confused with theological scoring." />
      <section className="section-panel evidence-ledger"><div className="section-heading"><div><span>EVIDENCE LEDGER</span><strong>{evidence.length} repository sources</strong></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Type</th><th>Title</th><th>Description</th><th>Source</th></tr></thead><tbody>{evidence.map((item) => <tr key={`${item.type}-${item.title}`}><td><SourceTypeBadge type={item.type} /></td><td><strong>{item.title}</strong></td><td>{item.description}</td><td><a className="source-link cyan" href={item.url} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={12} /></a></td></tr>)}</tbody></table></div></section>
    </section>
  )
}

function SourceTypeBadge({ type }) {
  const t = String(type || 'Source').toLowerCase()
  const tone = t.includes('official') ? 'official' : t.includes('video') ? 'video' : t.includes('photo') ? 'photo' : t.includes('radio') ? 'radio' : t.includes('religious') ? 'religious' : t.includes('primary') ? 'primary' : t.includes('narrative') ? 'narrative' : 'media'
  return <span className={`source-type ${tone}`}><span>{tone === 'official' ? '⬡' : tone === 'video' ? '▶' : tone === 'photo' ? '▣' : tone === 'radio' ? '◉' : tone === 'primary' ? '▤' : '◆'}</span>{type}</span>
}

function RevelationPage({ revelation }) {
  const tone = { Q: 'quran', I: 'gospel', T: 'torah', Z: 'psalms' }
  return (
    <section>
      <PageTitle code="06 / 06" title="August 2026 — Four Revelation Lens" subtitle={revelation?.principle || 'Cross-reference framework for Tawhid comparison points.'} />
      <div className="revelation-board">{(revelation?.traditions || []).map((item) => <article className={`revelation-row ${tone[item.key] || ''}`} key={item.key}><div className="revelation-key">{item.key}</div><div className="revelation-name"><span>{item.name}</span><strong>{(item.references || []).join(' · ')}</strong></div><p>{item.focus}</p><a href={item.url} target="_blank" rel="noreferrer">Open reference <ArrowUpRight size={13} /></a></article>)}</div>
      <section className="method-card"><FileSearch size={24} /><div><strong>Comparison, not retroactive prediction</strong><p>Revelation references are theological comparison points for Tawhid. They are not evidence that the text directly describes a modern August 2026 event.</p></div></section>
    </section>
  )
}
