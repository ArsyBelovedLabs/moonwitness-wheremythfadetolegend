import React, { useEffect, useMemo, useState } from "react"
import { Activity, CalendarDays, ChevronRight, Download, ExternalLink, Menu, Moon, Search, Share2, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const cleanBase = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "")
const loadJson = async (path) => {
  const response = await fetch(`${cleanBase}/${path}`.replace(/([^:]\/)\/+/g, "$1"))
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return response.json()
}

const risk = (value) => Number(value) >= 76 ? "critical" : Number(value) >= 41 ? "high" : Number(value) >= 26 ? "watch" : "low"
const riskVariant = (value) => risk(value) === "critical" ? "destructive" : risk(value) === "high" ? "secondary" : "outline"
const riskLabel = (value) => ({ critical: "Critical", high: "High", watch: "Watch", low: "Low" })[risk(value)]

function ScoreBadge({ value }) {
  return <Badge variant={riskVariant(value)}>{value}/100 · {riskLabel(value)}</Badge>
}

export default function App() {
  const [registry, setRegistry] = useState(null)
  const [month, setMonth] = useState(null)
  const [report, setReport] = useState(null)
  const [issues, setIssues] = useState([])
  const [evidence, setEvidence] = useState([])
  const [revelation, setRevelation] = useState(null)
  const [monitor, setMonitor] = useState(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [drawer, setDrawer] = useState(null)
  const [dark, setDark] = useState(() => localStorage.getItem("wml-theme") === "dark")
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("wml-theme", dark ? "dark" : "light")
  }, [dark])

  useEffect(() => {
    loadJson("data/index.json").then((data) => {
      setRegistry(data)
      setMonth(data.months?.find((entry) => entry.status === "final") || data.months?.[0] || null)
    }).catch(() => setRegistry({ months: [] }))
  }, [])

  useEffect(() => {
    if (!month) return
    setReport(null)
    loadJson(month.path).then(setReport).catch(() => setReport({ month: month.label, scope: "Indonesia", kpis: [], observations: [], causality: [] }))
    loadJson(month.issues).then(setIssues).catch(() => setIssues([]))
    loadJson(month.evidence).then(setEvidence).catch(() => setEvidence([]))
    loadJson(month.revelation).then(setRevelation).catch(() => setRevelation({ traditions: [] }))
  }, [month])

  useEffect(() => {
    loadJson("data/monitor/latest.json").then(setMonitor).catch(() => setMonitor(null))
    const timer = setInterval(() => loadJson("data/monitor/latest.json").then(setMonitor).catch(() => {}), 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  const observations = report?.observations || []
  const filtered = useMemo(() => observations.filter((item) => {
    const text = [item.date, item.location, item.actor, item.practice, item.summary].join(" ").toLowerCase()
    return (!query || text.includes(query.toLowerCase())) && (filter === "all" || risk(item.tauhid_gap) === filter)
  }), [observations, query, filter])

  const open = (kind, item) => setDrawer({ kind, item })
  const share = async () => {
    const payload = { title: "WHERE MYTH FADE TO LEGEND", text: `${month?.label || "Observatory"} — Indonesia Mythos & Ritual Observatory`, url: window.location.href }
    try { if (navigator.share) await navigator.share(payload); else await navigator.clipboard.writeText(window.location.href) } catch {}
  }
  const story = (title) => {
    const canvas = document.createElement("canvas")
    canvas.width = 1080; canvas.height = 1920
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = dark ? "#09090b" : "#ffffff"; ctx.fillRect(0, 0, 1080, 1920)
    ctx.fillStyle = dark ? "#fafafa" : "#09090b"; ctx.font = "700 30px system-ui"; ctx.fillText("WHERE MYTH FADE TO LEGEND", 72, 100)
    ctx.font = "800 74px system-ui"; ctx.fillText(title || month?.label || "August 2026", 72, 230)
    ctx.font = "500 34px system-ui"; ctx.fillStyle = dark ? "#a1a1aa" : "#52525b"; ctx.fillText("Indonesia Mythos & Ritual Observatory", 72, 290)
    ctx.font = "700 30px system-ui"; ctx.fillStyle = dark ? "#fafafa" : "#09090b"; ctx.fillText(`${observations.length} observations · ${evidence.length} evidence · ${issues.length} issues`, 72, 410)
    ctx.font = "500 26px system-ui"; ctx.fillStyle = dark ? "#a1a1aa" : "#71717a"; ctx.fillText("Evidence-first · specific practices, not communities", 72, 1810)
    const link = document.createElement("a"); link.download = "where-myth-fade-to-legend.png"; link.href = canvas.toDataURL("image/png"); link.click()
  }

  if (!report) return <main className="grid min-h-svh place-items-center bg-background text-foreground"><div className="flex flex-col items-center gap-3 text-center"><div className="grid size-12 place-items-center rounded-xl border bg-card font-bold">WM</div><p className="text-sm text-muted-foreground">Loading observatory…</p></div></main>

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <a href="#top" className="flex min-w-0 items-center gap-3 no-underline">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">WM</span>
            <span className="hidden min-w-0 sm:block"><span className="block truncate text-xs font-bold tracking-wide">WHERE MYTH FADE TO LEGEND</span><span className="block text-[10px] text-muted-foreground">INDONESIA OBSERVATORY</span></span>
          </a>
          <nav className={`${menu ? "absolute left-4 right-4 top-16 flex flex-col rounded-lg border bg-popover p-2 shadow-lg md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none" : "hidden md:flex"} flex-1 items-start gap-1 md:items-center md:gap-4`}>
            {['dashboard','timeline','observations','issues','evidence','map','revelation'].map((item) => <a key={item} href={`#${item}`} onClick={() => setMenu(false)} className="rounded-md px-2 py-1.5 text-xs font-medium capitalize text-muted-foreground hover:bg-accent hover:text-accent-foreground">{item}</a>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline"><span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" /> LIVE</Badge>
            <select aria-label="Month" value={month?.id || ""} onChange={(e) => setMonth(registry.months.find((entry) => entry.id === e.target.value))} className="hidden h-9 rounded-md border bg-background px-2 text-xs md:block">
              {(registry?.months || []).map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
            </select>
            <Button variant="outline" size="icon" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</Button>
            <Button variant="outline" size="icon" onClick={() => setMenu((value) => !value)} className="md:hidden" aria-label="Menu">{menu ? <X /> : <Menu />}</Button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <section className="grid gap-8 border-b py-10 md:grid-cols-[1.5fr_.5fr] md:py-16">
          <div className="flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">MONTHLY OBSERVATORY · {month?.label?.toUpperCase()}</div>
            <h1 className="mt-4 text-5xl font-extrabold tracking-[-0.05em] sm:text-7xl lg:text-8xl">Where <span className="text-primary">Myth</span><br />Fade to Legend</h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">Evidence-first monitoring of mythos, ritual, religious context, revelation references, media and causality across Indonesia.</p>
            <div className="mt-6 flex flex-wrap gap-2"><Button onClick={share}><Share2 /> Share dashboard</Button><Button variant="outline" onClick={() => story(month?.label)}><Download /> Generate Image</Button></div>
          </div>
          <Card className="self-end">
            <CardHeader><CardDescription>BOARD STATUS</CardDescription><div className="flex items-center justify-between gap-3"><CardTitle>Evidence-led</CardTitle><Badge variant="secondary">{report.month}</Badge></div></CardHeader>
            <CardContent className="space-y-4"><Progress value={88} /><div className="grid grid-cols-2 gap-4 text-sm"><div><div className="text-muted-foreground">Observations</div><div className="mt-1 text-2xl font-bold">{observations.length}</div></div><div><div className="text-muted-foreground">Evidence</div><div className="mt-1 text-2xl font-bold">{evidence.length}</div></div><div><div className="text-muted-foreground">Issues</div><div className="mt-1 text-2xl font-bold">{issues.length}</div></div><div><div className="text-muted-foreground">Critical</div><div className="mt-1 text-2xl font-bold">{observations.filter((o) => risk(o.tauhid_gap) === "critical").length}</div></div></div></CardContent>
          </Card>
        </section>

        <section id="dashboard" className="py-10"><SectionTitle eyebrow="01 · LIVE OVERVIEW" title="August at a glance" description="Scores describe specific practices, not religions or people." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(report.kpis || []).slice(0, 8).map((kpi) => <Card key={kpi.label}><CardHeader className="pb-2"><CardDescription>{kpi.label}</CardDescription><CardTitle className="text-2xl">{kpi.value}</CardTitle></CardHeader><CardContent className="pt-0"><p className="text-xs text-muted-foreground">{kpi.note}</p></CardContent></Card>)}</div></section>

        <section id="timeline" className="py-10"><SectionTitle eyebrow="02 · TIMELINE" title="What happened, when" description="Open any observation for its evidence context." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{observations.map((item, index) => <button key={`${item.date}-${index}`} onClick={() => open("observation", item)} className="rounded-lg border bg-card p-4 text-left shadow-sm transition hover:bg-accent"><div className="flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{item.date}</span><ScoreBadge value={item.tauhid_gap} /></div><div className="mt-3 text-sm font-medium">{item.location}</div><div className="mt-1 text-sm font-semibold">{item.practice}</div><div className="mt-2 text-xs text-muted-foreground line-clamp-2">{item.summary}</div></button>)}</div></section>

        <section id="observations" className="py-10"><div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><SectionTitle eyebrow="03 · OBSERVATIONS" title="Live observation board" description="Search and filter the verified monthly dataset." /><Button variant="outline" onClick={() => story("Observations")}><Download /> Generate Image</Button></div><div className="mb-3 flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search location, ritual, actor…" className="pl-9" /></div><select aria-label="Risk filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm sm:w-40"><option value="all">All levels</option><option value="critical">Critical</option><option value="high">High</option><option value="watch">Watch</option><option value="low">Low</option></select></div><div className="rounded-lg border bg-card"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Location</TableHead><TableHead>Practice</TableHead><TableHead>Evidence</TableHead><TableHead>Tauhid Gap</TableHead><TableHead>Causality</TableHead><TableHead>4 Revelation</TableHead><TableHead /></TableRow></TableHeader><TableBody>{filtered.map((item, index) => <TableRow key={`${item.date}-${index}`}><TableCell>{item.date}</TableCell><TableCell><div className="font-medium">{item.location}</div><div className="text-xs text-muted-foreground">{item.actor}</div></TableCell><TableCell><div className="font-medium">{item.practice}</div><div className="max-w-xs whitespace-normal text-xs text-muted-foreground">{item.summary}</div></TableCell><TableCell><Badge variant="outline">{item.evidence_score}/100</Badge></TableCell><TableCell><ScoreBadge value={item.tauhid_gap} /></TableCell><TableCell><Badge variant="outline">{item.causality}/100</Badge></TableCell><TableCell><div className="grid gap-1 text-[10px]"><span>Q · {item.revelation_refs?.Q || "112:1–4"}</span><span>I · {item.revelation_refs?.I || "Mark 12:29–31"}</span><span>T · {item.revelation_refs?.T || "Deut. 6:4–5"}</span><span>Z · {item.revelation_refs?.Z || "Ps. 86:10"}</span></div></TableCell><TableCell><Button size="sm" variant="ghost" onClick={() => open("observation", item)}>Open <ChevronRight /></Button></TableCell></TableRow>)}</TableBody></Table></div></section>

        <section className="grid gap-4 py-10 lg:grid-cols-2"><Card><CardHeader><CardTitle>Risk distribution</CardTitle><CardDescription>Current observation set by Tauhid Gap severity.</CardDescription></CardHeader><CardContent className="space-y-4">{["low","watch","high","critical"].map((level) => { const count = observations.filter((item) => risk(item.tauhid_gap) === level).length; return <div key={level}><div className="mb-2 flex justify-between text-sm"><span className="capitalize">{level}</span><span className="font-medium">{count}</span></div><Progress value={observations.length ? (count / observations.length) * 100 : 0} /></div> })}</CardContent></Card><Card><CardHeader><CardTitle>Causality review</CardTitle><CardDescription>Temporal proximity is not treated as causal proof.</CardDescription></CardHeader><CardContent className="space-y-1">{(report.causality || []).map((item) => <button key={item.name} onClick={() => open("causality", item)} className="flex w-full items-start justify-between gap-4 rounded-md px-2 py-3 text-left hover:bg-accent"><span><span className="block text-sm font-medium">{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{item.finding}</span></span><Badge variant={item.score >= 76 ? "destructive" : "outline"}>{item.score}/100</Badge></button>)}</CardContent></Card></section>

        <section id="map" className="py-10"><SectionTitle eyebrow="04 · GEOGRAPHY" title="Indonesia observation map" description="Approximate locations for orientation." /><Card><CardContent className="relative min-h-72 overflow-hidden p-0"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--muted)),transparent_65%)]" /><div className="relative grid min-h-72 place-items-center"><div className="rounded-full border border-dashed px-10 py-20 text-center text-muted-foreground"><CalendarDays className="mx-auto mb-2" /><div className="text-sm font-medium">Indonesia</div><div className="text-xs">{observations.length} documented observations</div></div>{observations.slice(0, 12).map((item, index) => <button key={`${item.location}-${index}`} onClick={() => open("observation", item)} className={`absolute grid size-7 place-items-center rounded-full border-2 border-background text-[10px] font-bold shadow-sm ${risk(item.tauhid_gap) === "critical" ? "bg-destructive text-destructive-foreground" : risk(item.tauhid_gap) === "high" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`} style={{ left: `${18 + (index * 31) % 64}%`, top: `${20 + (index * 47) % 58}%` }}>{index + 1}</button>)}</div></CardContent></Card></section>

        <section id="revelation" className="py-10"><SectionTitle eyebrow="05 · FOUR REVELATION LENS" title="Reference the question back to God" description="Theological comparison, not a claim that scripture predicts modern events." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{(revelation?.traditions || []).map((item) => <Card key={item.key}><CardHeader><Badge variant="outline">{item.key}</Badge><CardTitle className="text-base">{item.name}</CardTitle><CardDescription>{item.references?.join(" · ")}</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">{item.focus}</p>{item.url && <a className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline" href={item.url} target="_blank" rel="noreferrer">Open source <ExternalLink className="size-3.5" /></a>}</CardContent></Card>)}</div></section>

        <section id="issues" className="py-10"><div className="mb-4 flex items-end justify-between gap-3"><SectionTitle eyebrow="06 · ISSUE CENTER" title="Resolution queue" description="Evidence → analysis → constructive clarification." /><Button variant="outline" onClick={() => story("Issues")}><Download /> Generate Image</Button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{issues.map((item) => <button key={item.id} onClick={() => open("issue", item)} className="rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent"><div className="flex items-center justify-between gap-2"><Badge variant={item.priority === "CRITICAL" ? "destructive" : "secondary"}>{item.priority}</Badge><span className="text-xs text-muted-foreground">{item.status || "OPEN"}</span></div><div className="mt-3 text-sm font-semibold">{item.title || item.issue}</div><p className="mt-2 text-xs text-muted-foreground">{item.summary || item.description || item.resolution}</p></button>)}</div></section>

        <section id="evidence" className="py-10"><div className="mb-4 flex items-end justify-between gap-3"><SectionTitle eyebrow="07 · EVIDENCE LEDGER" title="Source trail" description="Primary, official and media sources tied to observations." /><Button variant="outline" onClick={() => story("Evidence") }><Download /> Generate Image</Button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{evidence.map((item, index) => <Card key={item.id || item.url || index}><CardHeader><div className="flex items-center justify-between gap-2"><Badge variant="outline">{item.type || "SOURCE"}</Badge><span className="text-xs text-muted-foreground">{item.source || "Public source"}</span></div><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{item.claim || item.description}</p>{item.url && <a className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline" href={item.url} target="_blank" rel="noreferrer">Open evidence <ExternalLink className="size-3.5" /></a>}</CardContent></Card>)}</div></section>

        <section className="py-10"><Card><CardHeader><CardTitle>Live monitoring</CardTitle><CardDescription>Background scans run every 6 hours. Detected signals remain unreviewed until verification.</CardDescription></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-4"><Metric label="New signals" value={monitor?.newItemCount ?? 0} /><Metric label="Mythos" value={monitor?.items?.filter((item) => /myth|legend|folklore|astrology|zodiac|supernatural/i.test(`${item.title} ${item.description}`)).length ?? 0} /><Metric label="Ritual" value={monitor?.items?.filter((item) => /worship|pray|offering|sacrifice|invoke|amulet|divination|spirit|ancestor/i.test(`${item.title} ${item.description}`)).length ?? 0} /><Metric label="Status" value={monitor ? "DETECTED" : "WAITING"} /></div><div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Activity className="size-4" />{monitor?.collectedAt ? `Last scan ${new Date(monitor.collectedAt).toLocaleString()}` : "Waiting for first scan"}</div></CardContent></Card></section>
      </main>

      <Sheet open={Boolean(drawer)} onOpenChange={(value) => !value && setDrawer(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>{drawer?.kind === "observation" ? drawer.item?.practice : drawer?.kind === "issue" ? (drawer.item?.title || drawer.item?.issue) : drawer?.kind === "causality" ? drawer.item?.name : "Evidence detail"}</SheetTitle><SheetDescription>Evidence context and analysis. Scores apply to the specific item, not to people or communities.</SheetDescription></SheetHeader>
          <div className="space-y-6 px-6 pb-8">
            {drawer?.item && <><div className="rounded-lg border bg-muted/40 p-4 text-sm">{drawer.item.summary || drawer.item.finding || drawer.item.description || drawer.item.resolution || drawer.item.claim}</div>{drawer.kind === "observation" && <div className="grid gap-3 sm:grid-cols-3"><Card><CardHeader className="p-4"><CardDescription>Evidence</CardDescription><CardTitle className="text-lg">{drawer.item.evidence_score}/100</CardTitle></CardHeader></Card><Card><CardHeader className="p-4"><CardDescription>Tauhid Gap</CardDescription><CardTitle className="text-lg"><ScoreBadge value={drawer.item.tauhid_gap} /></CardTitle></CardHeader></Card><Card><CardHeader className="p-4"><CardDescription>Causality</CardDescription><CardTitle className="text-lg">{drawer.item.causality}/100</CardTitle></CardHeader></Card></div>}{drawer.item.source && <Button asChild variant="outline"><a href={drawer.item.source} target="_blank" rel="noreferrer">Open source <ExternalLink /></a></Button>}{drawer.item.url && <Button asChild variant="outline"><a href={drawer.item.url} target="_blank" rel="noreferrer">Open evidence <ExternalLink /></a></Button>}</>}
          </div>
        </SheetContent>
      </Sheet>

      <footer className="border-t py-8"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6"><span className="font-medium text-foreground">WHERE MYTH FADE TO LEGEND</span><span>Evidence-first · Mobile-first · Specific practices, not communities</span></div></footer>
    </div>
  )
}

function SectionTitle({ eyebrow, title, description }) {
  return <div className="mb-5"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</div><h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>{description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>
}
function Metric({ label, value }) { return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div> }
