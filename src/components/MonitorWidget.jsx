import React, { useEffect, useMemo, useState } from "react"
import { Activity, Clock3, ExternalLink, RefreshCw, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const repoBase = import.meta.env.BASE_URL || "/"
const loadJson = (path) => fetch(`${repoBase}${path}`.replace(/([^:]\/)\/+/g, "$1")).then((r) => {
  if (!r.ok) throw new Error(`${path}: ${r.status}`)
  return r.json()
})

export default function MonitorWidget() {
  const [snapshot, setSnapshot] = useState(null)
  const [signals, setSignals] = useState(null)
  const [error, setError] = useState("")
  const refresh = async () => {
    try {
      const [latest, classified] = await Promise.all([
        loadJson("data/monitor/latest.json"),
        loadJson("data/monitor/signals.json").catch(() => ({ signals: [], alerts: [] })),
      ])
      setSnapshot(latest)
      setSignals(classified)
      setError("")
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    refresh()
    const timer = window.setInterval(refresh, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  const items = useMemo(() => (signals?.signals || []).slice(0, 8), [signals])
  const counts = useMemo(() => items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {}), [items])
  const collectedAt = snapshot?.collectedAt ? new Date(snapshot.collectedAt) : null

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-sm backdrop-blur">
      <CardHeader className="border-b border-border/70 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" /> Live monitor
            </div>
            <CardTitle className="text-lg">Mythos & ritual signals</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={refresh} aria-label="Refresh monitor" title="Refresh monitor"><RefreshCw className="size-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {error ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground"><ShieldAlert className="size-4" /> Monitor unavailable</div>
            Monitoring will resume on the next scheduled run. No unverified claim is added to observations.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">New signals</div><div className="mt-1 text-xl font-bold">{snapshot?.newItemCount ?? 0}</div></div>
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Mythos</div><div className="mt-1 text-xl font-bold">{counts.MYTHOS || 0}</div></div>
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Ritual</div><div className="mt-1 text-xl font-bold">{counts.RITUAL || 0}</div></div>
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Review</div><div className="mt-1 text-xl font-bold">{signals?.signals?.filter((s) => s.reviewRequired).length ?? 0}</div></div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> {collectedAt ? collectedAt.toLocaleString() : "Waiting for first scan"}</span>
              <Badge variant="outline">DETECTED</Badge>
              <span>Detected ≠ verified</span>
            </div>
            {(signals?.alerts || []).length > 0 && <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 text-xs dark:border-amber-900/50 dark:bg-amber-950/20"><b>Alert:</b> {signals.alerts[0].message}</div>}
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No new candidate signals in the latest snapshot.</div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <a key={item.signalId} href={item.url} target="_blank" rel="noreferrer" className="block rounded-lg border p-3 transition-colors hover:bg-muted/40">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Badge variant="secondary">{item.type}</Badge>
                      <ExternalLink className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-sm font-medium leading-snug">{item.title}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.source || "Public source"} · {item.published || ""}</div>
                  </a>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground"><Activity className="size-4" /> Automatic scans run every 6 hours. Candidate signals require human verification before observation or doctrinal analysis.</div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
