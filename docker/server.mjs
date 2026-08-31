import { createServer } from 'node:http'
import { access, readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const port = Number(process.env.PORT || 8080)
const root = process.cwd()
const distRoot = resolve(root, 'dist')
const apiRoot = resolve(root, 'api')

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
])

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.statusCode = statusCode
  res.setHeader('Content-Type', contentType)
  res.end(body)
}

async function apiHandler(req, res, url) {
  const relative = url.pathname === '/api' || url.pathname === '/api/'
    ? 'index'
    : url.pathname.slice('/api/'.length)

  if (!/^[a-z0-9-]+$/i.test(relative)) {
    send(res, 404, JSON.stringify({ error: 'API route not found' }), 'application/json; charset=utf-8')
    return
  }

  const modulePath = resolve(apiRoot, `${relative}.js`)
  if (!modulePath.startsWith(`${apiRoot}${sep}`)) {
    send(res, 404, JSON.stringify({ error: 'API route not found' }), 'application/json; charset=utf-8')
    return
  }

  try {
    await access(modulePath)
    req.query = Object.fromEntries(url.searchParams.entries())
    const module = await import(pathToFileURL(modulePath).href)
    if (typeof module.default !== 'function') throw new Error('Invalid API module')
    await module.default(req, res)
  } catch (error) {
    if (!res.headersSent) {
      send(res, 404, JSON.stringify({ error: 'API route not found' }), 'application/json; charset=utf-8')
    } else if (!res.writableEnded) {
      res.end()
    }
  }
}

async function staticHandler(req, res, url) {
  let pathname = decodeURIComponent(url.pathname)
  if (pathname === '/') pathname = '/index.html'

  const requested = resolve(distRoot, `.${pathname}`)
  const safePath = requested === distRoot || requested.startsWith(`${distRoot}${sep}`)
  if (!safePath) {
    send(res, 400, 'Bad request')
    return
  }

  try {
    const info = await stat(requested)
    if (!info.isFile()) throw new Error('Not a file')
    const body = await readFile(requested)
    const type = contentTypes.get(extname(requested).toLowerCase()) || 'application/octet-stream'
    res.statusCode = 200
    res.setHeader('Content-Type', type)
    if (pathname.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      res.setHeader('Cache-Control', 'no-cache')
    }
    res.end(body)
  } catch {
    const index = await readFile(resolve(distRoot, 'index.html'))
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.end(index)
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  try {
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      await apiHandler(req, res, url)
    } else {
      await staticHandler(req, res, url)
    }
  } catch (error) {
    console.error('[moonwitness-docker]', error)
    if (!res.headersSent) send(res, 500, 'Internal server error')
    else if (!res.writableEnded) res.end()
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`MoonWitness Myth Fade listening on :${port}`)
})

function shutdown(signal) {
  console.log(`Received ${signal}; closing server`)
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
