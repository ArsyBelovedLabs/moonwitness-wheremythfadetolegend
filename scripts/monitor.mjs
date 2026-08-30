import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const root = process.cwd()
const configPath = join(root, 'data/monitor/queries.json')
const config = JSON.parse(await readFile(configPath, 'utf8'))
const now = new Date()
const pad = n => String(n).padStart(2, '0')
const runId = `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())}/${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`
const outputDir = join(root, 'data/monitor/runs', runId)
const latestPath = join(root, 'data/monitor/latest.json')
const seenPath = join(root, 'data/monitor/seen.json')

await mkdir(outputDir, { recursive: true })
await mkdir(dirname(latestPath), { recursive: true })

let seen = {}
try { seen = JSON.parse(await readFile(seenPath, 'utf8')) } catch {}

const decode = value => value
  .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"').replaceAll('&#39;', "'")
  .trim()

const strip = value => decode(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? strip(m[1]) : ''
}

function itemsFromRss(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\\/item>/gi)].map(m => {
    const body = m[1]
    return {
      title: tag(body, 'title'),
      url: tag(body, 'link'),
      guid: tag(body, 'guid'),
      published: tag(body, 'pubDate'),
      source: tag(body, 'source'),
      description: tag(body, 'description')
    }
  })
}

const collected = []
const errors = []
for (const query of config.queries) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'MoonWitness Observatory Monitor/1.0' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const xml = await response.text()
    const items = itemsFromRss(xml).slice(0, config.maxItemsPerQuery)
    for (const item of items) {
      const key = item.guid || item.url || `${item.title}|${item.published}`
      const parsedTime = Date.parse(item.published)
      if (Number.isFinite(parsedTime) && (now - parsedTime) / 36e5 > config.windowHours) continue
      if (!item.title || !item.url) continue
      if (!seen[key]) {
        seen[key] = now.toISOString()
        collected.push({ ...item, query, collectedAt: now.toISOString(), sourceType: 'news-rss' })
      }
    }
  } catch (error) {
    errors.push({ query, error: String(error), collectedAt: now.toISOString() })
  }
}

const summary = {
  schemaVersion: '1.0.0',
  runId,
  collectedAt: now.toISOString(),
  windowHours: config.windowHours,
  queryCount: config.queries.length,
  newItemCount: collected.length,
  errorCount: errors.length,
  items: collected,
  errors
}

await writeFile(join(outputDir, 'snapshot.json'), JSON.stringify(summary, null, 2) + '\n')
await writeFile(latestPath, JSON.stringify(summary, null, 2) + '\n')
await writeFile(seenPath, JSON.stringify(seen, null, 2) + '\n')

console.log(JSON.stringify({ runId, newItems: collected.length, errors: errors.length }, null, 2))
