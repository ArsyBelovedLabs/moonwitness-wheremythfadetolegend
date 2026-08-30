const DAY = 24 * 60 * 60 * 1000

const ms = value => value ? Date.parse(value) : NaN

export function intervalGapHours(aStart, aEnd, bStart, bEnd) {
  const a0 = ms(aStart), a1 = ms(aEnd || aStart), b0 = ms(bStart), b1 = ms(bEnd || bStart)
  if (![a0, a1, b0, b1].every(Number.isFinite)) return null
  if (a0 <= b1 && b0 <= a1) return 0
  const gap = a1 < b0 ? b0 - a1 : a0 - b1
  return Math.round(gap / 36e5)
}

export function haversineKm(a, b) {
  if (!a || !b || !Number.isFinite(a.lat) || !Number.isFinite(a.lon) || !Number.isFinite(b.lat) || !Number.isFinite(b.lon)) return null
  const r = 6371
  const rad = n => n * Math.PI / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const lat1 = rad(a.lat), lat2 = rad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return Math.round(r * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
}

export function proximityScore({ deltaHours, distanceKm, observationEvidence = 0, disasterEvidence = 0 }) {
  let temporal = 0
  if (deltaHours === 0) temporal = 45
  else if (deltaHours != null && deltaHours <= 24) temporal = 40
  else if (deltaHours != null && deltaHours <= 72) temporal = 30
  else if (deltaHours != null && deltaHours <= 168) temporal = 18
  else if (deltaHours != null && deltaHours <= 336) temporal = 8

  let geographic = 0
  if (distanceKm != null && distanceKm <= 25) geographic = 35
  else if (distanceKm != null && distanceKm <= 75) geographic = 30
  else if (distanceKm != null && distanceKm <= 150) geographic = 24
  else if (distanceKm != null && distanceKm <= 500) geographic = 14
  else if (distanceKm != null && distanceKm <= 1200) geographic = 7

  const evidence = Math.round(Math.min(Number(observationEvidence) || 0, Number(disasterEvidence) || 0) * 0.2)
  return Math.min(100, temporal + geographic + evidence)
}

export function proximityBand(score) {
  if (score >= 75) return 'very-close'
  if (score >= 50) return 'close'
  if (score >= 25) return 'near'
  return 'distant'
}

export function buildCorrelationRows(observations, disasterEvents, reviews = []) {
  const obsById = new Map(observations.map(item => [item._id, item]))
  const disById = new Map(disasterEvents.map(item => [item.id, item]))
  const reviewedPairs = new Set()

  const reviewed = reviews.map(review => {
    const observation = review.observation_id ? obsById.get(review.observation_id) : null
    const disaster = disById.get(review.disaster_id) || null
    if (review.observation_id && review.disaster_id) reviewedPairs.add(`${review.observation_id}|${review.disaster_id}`)
    const computedDelta = observation && disaster ? intervalGapHours(observation._date_start, observation._date_end, disaster.date_start, disaster.date_end) : null
    const distanceKm = observation && disaster ? haversineKm(observation._geo, disaster.coordinates) : null
    const computedProximity = observation && disaster ? proximityScore({
      deltaHours: computedDelta,
      distanceKm,
      observationEvidence: observation.evidence_score,
      disasterEvidence: disaster.evidence_score,
    }) : Number(review.proximity_score || 0)
    return {
      id: review.id,
      kind: 'reviewed',
      status: review.status,
      relation: review.relation,
      observation,
      disaster,
      deltaHours: review.delta_hours ?? computedDelta,
      distanceKm,
      proximityScore: Number(review.proximity_score ?? computedProximity),
      causalityScore: review.repository_causality_score,
      competingExplanations: review.competing_explanations || [],
      finding: review.finding,
      guardrail: 'Reviewed repository relation. Proximity and causality remain separate scores.',
    }
  })

  const automatic = []
  for (const observation of observations) {
    if (!observation._geo?.map_enabled) continue
    for (const disaster of disasterEvents) {
      if (!disaster.coordinates) continue
      const pairKey = `${observation._id}|${disaster.id}`
      if (reviewedPairs.has(pairKey)) continue
      const deltaHours = intervalGapHours(observation._date_start, observation._date_end, disaster.date_start, disaster.date_end)
      const distanceKm = haversineKm(observation._geo, disaster.coordinates)
      if (deltaHours == null || distanceKm == null || deltaHours > 168 || distanceKm > 500) continue
      const score = proximityScore({ deltaHours, distanceKm, observationEvidence: observation.evidence_score, disasterEvidence: disaster.evidence_score })
      automatic.push({
        id: `AUTO-${observation._id}-${disaster.id}`,
        kind: 'automatic',
        status: 'AUTO_PROXIMITY_ONLY',
        relation: `${observation.practice} ↔ ${disaster.label}`,
        observation,
        disaster,
        deltaHours,
        distanceKm,
        proximityScore: score,
        causalityScore: null,
        competingExplanations: [],
        finding: 'Temporal/geographic proximity detected automatically. This row has not been reviewed for causality.',
        guardrail: 'AUTO_PROXIMITY_ONLY is a discovery aid, never a causal conclusion.',
      })
    }
  }

  automatic.sort((a, b) => b.proximityScore - a.proximityScore)
  return [...reviewed, ...automatic.slice(0, 30)]
}

export function workflowCounts(candidates = []) {
  const stages = ['DISCOVERED', 'SOURCE_CHECK', 'VERIFIED', 'ANALYZED', 'PUBLISHED']
  return stages.map(stage => ({ stage, count: candidates.filter(item => item.status === stage).length }))
}

export const WORKFLOW = ['DISCOVERED', 'SOURCE_CHECK', 'VERIFIED', 'ANALYZED', 'PUBLISHED']
export const MAX_AUTO_WINDOW_HOURS = 168
export const MAX_AUTO_DISTANCE_KM = 500
export const ONE_DAY_MS = DAY
