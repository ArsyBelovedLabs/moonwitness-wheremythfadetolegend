const defaultBaseUrl = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')

const EMPTY = Object.freeze({
  registry: { months: [] },
  report: { kpis: [], observations: [] },
  list: [],
  revelation: { traditions: [] },
  geography: { observations: [] },
  disasters: { events: [], context_signals: [] },
  correlations: { reviews: [] },
  candidates: { candidates: [] },
})

/**
 * The repository's versioned JSON is the static data boundary. API handlers
 * may expose the same records, but historical pages must not depend on them.
 */
export function describeMonthSource(month) {
  const historical = month?.status === 'final'
  const lifecycle = historical ? 'frozen' : 'collecting'
  return Object.freeze({
    kind: historical ? 'historical' : 'live',
    lifecycle,
    storage: 'static',
    status: month?.status || 'unknown',
    label: `STATIC / ${lifecycle.toUpperCase()}`,
    detail: historical ? 'Git-backed frozen monthly baseline' : 'Git-backed collecting month; candidate signals remain unpublished',
  })
}

export function createStaticDataAdapter({ baseUrl = defaultBaseUrl, fetchImpl = fetch } = {}) {
  const root = String(baseUrl || '').replace(/\/+$/, '')
  const urlFor = path => `${root}/${String(path || '').replace(/^\/+/, '')}`.replace(/([^:]\/)\/+/g, '$1')

  async function read(path, fallback) {
    if (!path) return fallback
    try {
      const response = await fetchImpl(urlFor(path), { cache: 'no-store' })
      return response.ok ? response.json() : fallback
    } catch {
      return fallback
    }
  }

  return Object.freeze({
    readRegistry: () => read('data/index.json', EMPTY.registry),
    readMonitor: (fallback = null) => read('data/monitor/latest.json', fallback),
    readMonth: async month => {
      const [report, issues, evidence, revelation, geography, disasters, correlations, candidates] = await Promise.all([
        read(month?.path, EMPTY.report),
        read(month?.issues, EMPTY.list),
        read(month?.evidence, EMPTY.list),
        read(month?.revelation, EMPTY.revelation),
        read(month?.geography, EMPTY.geography),
        read(month?.disasters, EMPTY.disasters),
        read(month?.correlations, EMPTY.correlations),
        read(month?.candidates, EMPTY.candidates),
      ])
      return { report, issues, evidence, revelation, geography, disasters, correlations, candidates, source: describeMonthSource(month) }
    },
  })
}
