import React, { useEffect, useMemo, useState } from 'react'
import { Search, BarChart3, Database, MapPinned, Archive, RefreshCw, ExternalLink } from 'lucide-react'
import { Badge, Button, Card, CardHeader, CardTitle, CardDescription } from './components/ui.jsx'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs.jsx'

const base = import.meta.env.BASE_URL || './'
const load = async path => { const r = await fetch(`${base}${path}`); if (!r.ok) throw new Error(path); return r.json() }
const scoreTone = n => Number(n) >= 76 ? 'red' : Number(n) >= 41 ? 'orange' : Number(n) >= 26 ? 'yellow' : 'green'

function monthScore(rows, key){ const xs = rows.map(r => Number(r?.[key])).filter(Number.isFinite); return xs.length ? Math.round(xs.reduce((a,b)=>a+b,0)/xs.length) : 0 }

export default function P2Hub(){
  const [registry,setRegistry]=useState(null), [months,setMonths]=useState([]), [active,setActive]=useState('analytics'), [q,setQ]=useState(''), [busy,setBusy]=useState(false), [error,setError]=useState('')
  useEffect(()=>{ load('data/index.json').then(r=>setRegistry(r)).catch(e=>setError(String(e))) },[])
  useEffect(()=>{
    if(!registry?.months)return
    let cancelled=false
    ;(async()=>{
      setBusy(true); setError('')
      try{
        const rows=[]
        for(const m of registry.months){
          const [report,issues,evidence] = await Promise.all([load(m.path),load(m.issues),load(m.evidence)])
          if(!cancelled) rows.push({meta:m,report,issues,evidence})
        }
        if(!cancelled)setMonths(rows)
      }catch(e){if(!cancelled)setError('P2 data load failed')}
      finally{if(!cancelled)setBusy(false)}
    })()
    return ()=>{cancelled=true}
  },[registry])

  const allObs = useMemo(()=>months.flatMap(x=>x.report?.observations||[]).map((o,i)=>({...o,_month:months.find(m=> (m.report?.observations||[]).includes(o))?.meta?.label||'' ,_key:`${o.date||''}|${o.location||''}|${o.practice||''}|${i}`})),[months])
  const allEvidence = useMemo(()=>months.flatMap(x=>x.evidence||[]),[months])
  const allIssues = useMemo(()=>months.flatMap(x=>x.issues||[]),[months])
  const searchResults = useMemo(()=>{
    const needle=q.trim().toLowerCase(); if(!needle)return []
    const results=[]
    allObs.forEach(o=>{const hay=Object.values(o).join(' ').toLowerCase(); if(hay.includes(needle))results.push({type:'Observation',title:o.practice||'Observation',meta:`${o.date||''} · ${o.location||''}`,score:o.tauhid_gap})})
    allEvidence.forEach(e=>{const hay=Object.values(e).join(' ').toLowerCase(); if(hay.includes(needle))results.push({type:'Evidence',title:e.title||'Evidence',meta:e.type||'Source',url:e.url})})
    allIssues.forEach(i=>{const hay=Object.values(i).join(' ').toLowerCase(); if(hay.includes(needle))results.push({type:'Issue',title:i.issue||i.id||'Issue',meta:`${i.priority||''} · ${i.status||''}`})})
    return results.slice(0,80)
  },[q,allObs,allEvidence,allIssues])

  const locations = useMemo(()=>{
    const map=new Map()
    for(const o of allObs){ const key=o.location||'Unknown'; const cur=map.get(key)||{location:key,count:0,avgTauhid:0,values:[]}; cur.count++; if(Number.isFinite(Number(o.tauhid_gap)))cur.values.push(Number(o.tauhid_gap)); map.set(key,cur) }
    return [...map.values()].map(x=>({...x,avgTauhid:x.values.length?Math.round(x.values.reduce((a,b)=>a+b,0)/x.values.length):0})).sort((a,b)=>b.count-a.count)
  },[allObs])

  const mythos = useMemo(()=>{
    const map=new Map();
    for(const o of allObs){ const name=o.practice||'Unspecified'; const key=name.toLowerCase(); const cur=map.get(key)||{name,occurrences:0,locations:new Set(),maxGap:0,months:new Set()}; cur.occurrences++; if(o.location)cur.locations.add(o.location); if(o._month)cur.months.add(o._month); cur.maxGap=Math.max(cur.maxGap,Number(o.tauhid_gap)||0); map.set(key,cur) }
    return [...map.values()].map(x=>({...x,locations:[...x.locations],months:[...x.months]})).sort((a,b)=>b.occurrences-a.occurrences)
  },[allObs])

  const aggregate = useMemo(()=>months.map(({meta,report,issues,evidence})=>({
    ...meta, observations:(report?.observations||[]).length, issues:issues.length, evidence:evidence.length,
    evidenceScore:monthScore(report?.observations||[],'evidence_score'), tauhidGap:monthScore(report?.observations||[],'tauhid_gap'), causality:monthScore(report?.observations||[],'causality'), red:(report?.observations||[]).filter(o=>scoreTone(o.tauhid_gap)==='red').length
  })),[months])

  if(error) return <section className="section"><Card><CardHeader><Badge tone="red">P2 ERROR</Badge><CardTitle>Insight Hub unavailable</CardTitle><CardDescription>{error}</CardDescription></CardHeader></Card></section>
  return <section id="insights" className="section p2-hub">
    <div className="section-heading"><div><div className="eyebrow">P2 · OBSERVATORY INTELLIGENCE</div><h2>Analytics, archive & global search</h2><p>Exploration tools sit above the frozen monthly record; they do not rewrite historical observations.</p></div><Button variant="outline" onClick={()=>setRegistry(null)||setTimeout(()=>load('data/index.json').then(setRegistry).catch(()=>{}),0)}><RefreshCw size={15}/> Refresh</Button></div>
    <Card className="search-hub"><div className="search-hub-input"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search across observations, evidence and issues…" /></div>{q&&<div className="search-results">{searchResults.length?searchResults.map((r,i)=><div className="search-result" key={i}><div><Badge tone="neutral">{r.type}</Badge><strong>{r.title}</strong><small>{r.meta}</small></div>{r.url&&<a href={r.url} target="_blank" rel="noreferrer"><ExternalLink size={14}/></a>}{r.score!=null&&<Badge tone={scoreTone(r.score)}>{r.score}/100</Badge>}</div>):<div className="empty-p2">No matching records.</div>}</div>}</Card>
    <Tabs value={active} onValueChange={setActive}><TabsList><TabsTrigger value="analytics"><BarChart3 size={14}/> Analytics</TabsTrigger><TabsTrigger value="archive"><Archive size={14}/> Archive</TabsTrigger><TabsTrigger value="mythos"><Database size={14}/> Mythos Index</TabsTrigger><TabsTrigger value="geo"><MapPinned size={14}/> Geo Intel</TabsTrigger></TabsList>
      <TabsContent value="analytics"><div className="p2-grid">{aggregate.map(m=><Card key={m.id}><CardHeader><div className="p2-month-row"><Badge tone="neutral">{m.status||'active'}</Badge><span>{m.label}</span></div><CardTitle>{m.observations} observations</CardTitle><CardDescription>{m.evidence} evidence · {m.issues} issues</CardDescription></CardHeader><div className="metric-strip"><div><small>Evidence</small><b>{m.evidenceScore}</b></div><div><small>Tauhid Gap</small><b>{m.tauhidGap}</b></div><div><small>Causality</small><b>{m.causality}</b></div><div><small>Critical</small><b>{m.red}</b></div></div></Card>)}</div>{!aggregate.length&&<div className="empty-p2">No monthly datasets registered yet.</div>}</TabsContent>
      <TabsContent value="archive"><div className="archive-list">{aggregate.map(m=><div className="archive-row" key={m.id}><div><strong>{m.label}</strong><small>{m.id} · {m.status}</small></div><div><Badge tone={m.status==='final'?'green':'yellow'}>{m.status==='final'?'FROZEN':'ACTIVE'}</Badge><span>{m.observations} observations</span><span>{m.evidence} evidence</span></div></div>)}</div></TabsContent>
      <TabsContent value="mythos"><div className="enterprise-table-wrap"><table><thead><tr><th>Mythos / Practice</th><th>Occurrences</th><th>Locations</th><th>Max Tauhid Gap</th><th>Months</th></tr></thead><tbody>{mythos.map((m,i)=><tr key={i}><td><b>{m.name}</b></td><td>{m.occurrences}</td><td>{m.locations.join(', ')||'—'}</td><td><Badge tone={scoreTone(m.maxGap)}>{m.maxGap}/100</Badge></td><td>{m.months.join(', ')||'—'}</td></tr>)}</tbody></table></div>{!mythos.length&&<div className="empty-p2">Mythos index will populate as observations accumulate.</div>}</TabsContent>
      <TabsContent value="geo"><div className="p2-grid">{locations.map((l,i)=><Card key={i}><CardHeader><div className="p2-month-row"><Badge tone={scoreTone(l.avgTauhid)}>{l.avgTauhid}/100</Badge><span>{l.count} records</span></div><CardTitle>{l.location}</CardTitle><CardDescription>Average Tauhid Gap across recorded observations</CardDescription></CardHeader><div className="geo-bar"><i style={{width:`${Math.max(4,l.avgTauhid)}%`}} /></div></Card>)}</div>{!locations.length&&<div className="empty-p2">No location data yet.</div>}</TabsContent>
    </Tabs>
    {busy&&<div className="p2-loading"><RefreshCw className="spin" size={14}/> Updating intelligence index…</div>}
  </section>
}
