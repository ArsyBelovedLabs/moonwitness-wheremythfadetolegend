const DEFAULT_API_URL = 'https://api.moonwitness.biz.id'

export class MoonClientError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'MoonClientError'
    this.status = details.status ?? null
    this.requestId = details.requestId ?? null
    this.code = details.code ?? null
  }
}

const apiUrl = () => String(import.meta.env.VITE_MOONWITNESS_API_URL || DEFAULT_API_URL).replace(/\/$/, '')

async function readError(response) {
  let body = null
  try { body = await response.clone().json() } catch { /* Problem Details is optional */ }
  const detail = body && typeof body === 'object' ? body : {}
  const safeMessage = response.status === 503
    ? 'Live API is temporarily degraded.'
    : response.status === 404
      ? 'The requested live resource was not found.'
      : response.status === 403
        ? 'This live operation is not authorized.'
        : response.status >= 500
          ? 'Live API is temporarily unavailable.'
          : 'The live request could not be completed.'
  return new MoonClientError(
    safeMessage,
    { status: response.status, requestId: detail.requestId || response.headers.get('x-request-id'), code: detail.code },
  )
}

export function createMoonClient({ baseUrl = apiUrl(), fetcher = globalThis.fetch, getAccessToken, credentials } = {}) {
  const root = String(baseUrl).replace(/\/$/, '')
  if (typeof fetcher !== 'function') throw new MoonClientError('Live API is unavailable in this browser.')
  const resolveAccessToken = async () => {
    if (!getAccessToken) return undefined
    const token = typeof getAccessToken === 'function' ? await getAccessToken() : getAccessToken
    return typeof token === 'string' ? token.trim() || undefined : undefined
  }

  const request = async (path, init = {}) => {
    let response
    try {
      const token = await resolveAccessToken()
      const headers = new Headers(init.headers)
      headers.set('accept', headers.get('accept') || 'application/json')
      if (token) headers.set('authorization', `Bearer ${token}`)
      response = await fetcher(`${root}${path}`, {
        ...init,
        headers,
        ...(credentials ? { credentials } : {}),
      })
    } catch {
      throw new MoonClientError('Live API is offline or unreachable.')
    }
    if (!response.ok) throw await readError(response)
    return response
  }

  return {
    getHealth: async () => (await request('/v1/health')).json(),
    getReadiness: async () => (await request('/v1/readiness')).json(),
    createResearchRun: async (payload, idempotencyKey) => (await request('/v1/research-runs', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
      body: JSON.stringify(payload),
    })).json(),
    getResearchRun: async id => (await request(`/v1/research-runs/${encodeURIComponent(id)}`)).json(),
    cancelResearchRun: async (id, idempotencyKey) => (await request(`/v1/research-runs/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
    })).json(),
    listResearchRuns: async ({ limit, cursor } = {}) => {
      const query = new URLSearchParams()
      if (limit !== undefined) query.set('limit', String(limit))
      if (cursor) query.set('cursor', cursor)
      return (await request(`/v1/research-runs${query.size ? `?${query}` : ''}`)).json()
    },
    getResearchRunEvents: async id => (await request(`/v1/research-runs/${encodeURIComponent(id)}/events`, { headers: { accept: 'text/event-stream' } })).text(),
  }
}

export const moonClient = createMoonClient()
