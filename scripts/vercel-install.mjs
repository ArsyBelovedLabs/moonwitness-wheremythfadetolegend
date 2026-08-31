import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const candidates = [
  ['MOONWITNESS_PACKAGES_TOKEN', process.env.MOONWITNESS_PACKAGES_TOKEN],
  ['NODE_AUTH_TOKEN', process.env.NODE_AUTH_TOKEN],
  ['NPM_TOKEN', process.env.NPM_TOKEN],
  ['GH_PACKAGES_TOKEN', process.env.GH_PACKAGES_TOKEN],
  ['PACKAGES_TOKEN', process.env.PACKAGES_TOKEN],
]

const credential = candidates.find(([, value]) => typeof value === 'string' && value.trim())
if (!credential) {
  console.error('No GitHub Packages read credential is configured for this Vercel deployment.')
  console.error('Configure one encrypted environment variable: MOONWITNESS_PACKAGES_TOKEN, NODE_AUTH_TOKEN, NPM_TOKEN, GH_PACKAGES_TOKEN, or PACKAGES_TOKEN.')
  process.exit(2)
}

const [credentialName, token] = credential
console.log(`GitHub Packages credential detected via ${credentialName}; token value remains hidden.`)

const directory = await mkdtemp(join(tmpdir(), 'moonwitness-npm-'))
const userConfig = join(directory, '.npmrc')

try {
  await writeFile(
    userConfig,
    `@arsybelovedlabs:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${token}\nalways-auth=true\n`,
    { mode: 0o600 },
  )

  const result = spawnSync('corepack', ['pnpm', 'install', '--no-frozen-lockfile'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NPM_CONFIG_USERCONFIG: userConfig,
      NODE_AUTH_TOKEN: token,
    },
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)

  const lock = await readFile('pnpm-lock.yaml', 'utf8')
  const lines = lock.split('\n')
  const hits = lines
    .map((line, index) => line.includes('@arsybelovedlabs/moonwitness-frontend-platform') ? index : -1)
    .filter(index => index >= 0)

  console.log('Resolved canonical package lock evidence:')
  for (const index of hits) {
    console.log(lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 8)).join('\n'))
  }
} finally {
  await rm(directory, { recursive: true, force: true })
}
