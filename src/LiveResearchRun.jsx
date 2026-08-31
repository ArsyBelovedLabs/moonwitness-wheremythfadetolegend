import React, { useEffect, useState } from 'react'
import { CausalityGuardrail, InspectorRows, InstrumentHeader, MetricRail, ObservationShard, SignalBeacon, WitnessThread } from '@arsybelovedlabs/moonwitness-design-system'
import { MoonClientError, moonClient } from './lib/moon-client.js'

const stages = ['queued', 'running', 'succeeded', 'failed', 'cancelled']

export default function LiveResearchRun() {
  const [form, setForm] = useState({ caseId: '', correlationId: '', traceId: '' })
  const [run, setRun] = useState(null)
  const [runs, setRuns] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    moonClient.listResearchRuns({ limit: 8 }).then(page => {
      if (active) setRuns(page.items || [])
    }).catch(() => { /* live surface remains useful in offline mode */ })
    return () => { active = false }
  }, [])

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const create = async event => {
    event.preventDefault()
    setStatus('creating')
    setError('')
    try {
      const next = await moonClient.createResearchRun(
        Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() || null])),
        crypto.randomUUID(),
      )
      setRun(next)
      setRuns(current => [next, ...current.filter(item => item.id !== next.id)].slice(0, 8))
      setStatus(next.status || 'queued')
    } catch (cause) {
      setStatus(cause instanceof MoonClientError ? 'offline' : 'error')
      setError(cause.message || 'Unable to create ResearchRun.')
    }
  }

  const load = async id => {
    setStatus('loading')
    setError('')
    try {
      const next = await moonClient.getResearchRun(id)
      setRun(next)
      setStatus(next.status || 'queued')
    } catch (cause) {
      setStatus('error')
      setError(cause.message || 'Unable to load ResearchRun.')
    }
  }

  const activeStage = run?.status || status
  const thread = stages.map(stage => ({ id: stage, label: stage.toUpperCase(), detail: stage === activeStage ? 'current state' : 'ResearchRun lifecycle', state: stage === activeStage ? 'active' : stages.indexOf(stage) < stages.indexOf(activeStage) ? 'complete' : 'idle', tone: stage === 'failed' ? 'danger' : stage === 'succeeded' ? 'success' : 'active' }))

  return <section className="live-research-instrument" aria-label="Live ResearchRun operational instrument">
    <InstrumentHeader code="LIVE / 01" title="ResearchRun Operations" subtitle="Operational API state is kept distinct from the frozen historical observatory." status={<SignalBeacon tone={status === 'offline' || status === 'error' ? 'danger' : 'active'} label={`LIVE / ${status.toUpperCase()}`} />} />
    <div className="live-research-grid">
      <form className="live-research-form" onSubmit={create}>
        <span className="live-research-kicker">CREATE RESEARCH RUN</span>
        <label>CASE ID<input name="caseId" value={form.caseId} onChange={update} placeholder="optional case identifier" /></label>
        <label>CORRELATION ID<input name="correlationId" value={form.correlationId} onChange={update} placeholder="optional correlation id" /></label>
        <label>TRACE ID<input name="traceId" value={form.traceId} onChange={update} placeholder="optional trace id" /></label>
        <button type="submit" disabled={status === 'creating'}>{status === 'creating' ? 'Submitting…' : 'Create ResearchRun'}</button>
        {error ? <p role="alert" className="live-research-error">{error}</p> : null}
      </form>
      <div className="live-research-state">
        <WitnessThread steps={thread} />
        <MetricRail items={[{ label: 'VISIBLE RUNS', value: runs.length, detail: 'API page', tone: 'active' }, { label: 'CURRENT', value: run?.id ? run.id.slice(0, 8) : '—', detail: run?.status || 'no selection', tone: 'success' }, { label: 'SOURCE', value: 'API', detail: 'MoonClient boundary', tone: 'warning' }]} />
        <CausalityGuardrail />
      </div>
    </div>
    <div className="live-research-history">
      <ObservationShard eyebrow="LIVE / RESEARCH RUNS" title="Operational state, not historical evidence" meta="Runs come from moonwitness-api and never overwrite frozen repository data." />
      {runs.length ? <div className="live-research-run-list">{runs.map(item => <button type="button" key={item.id} onClick={() => load(item.id)}><strong>{item.id}</strong><span>{item.status}</span><small>{item.createdAt || 'timestamp unavailable'}</small></button>)}</div> : <p className="live-research-empty">No live runs available. The historical observatory remains available offline.</p>}
    </div>
    {run ? <InspectorRows rows={[{ label: 'RUN ID', value: run.id, tone: 'active' }, { label: 'STATUS', value: run.status, tone: run.status === 'failed' ? 'danger' : 'success' }, { label: 'CASE', value: run.caseId || 'not supplied', tone: 'neutral' }, { label: 'CORRELATION', value: run.correlationId || 'not supplied', tone: 'neutral' }]} /> : null}
  </section>
}
