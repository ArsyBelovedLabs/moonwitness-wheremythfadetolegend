export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  res.statusCode = 200
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({
    name: 'WHERE MYTH FADE TO LEGEND Public API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      observations: '/api/observations?month=2026-08',
      geography: '/api/geography?month=2026-08',
      disasters: '/api/disasters?month=2026-08',
      correlations: '/api/correlations?month=2026-08',
      evidence: '/api/evidence?month=2026-08',
      issues: '/api/issues?month=2026-08',
      candidates: '/api/candidates?month=2026-09',
      analysis: '/api/analysis?month=2026-08',
      resolution: '/api/resolution?month=2026-08',
      search: '/api/search?q=medan'
    },
    policy: 'Read-only public API. Geography, disaster and correlation are distinct datasets. Proximity is not causality. Monitoring may create DISCOVERED candidates only; verification remains a separate step.'
  }))
}
