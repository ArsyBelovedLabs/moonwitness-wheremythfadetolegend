import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const path = 'pnpm-lock.yaml'
const expectedSha256 = 'b4bc5325ce09aa6c249608afa3396237fe07dfd019c138943a91a402b3ba55e7'
const source = await readFile(path, 'utf8')
const lines = source.split('\n')

function isHeader(line, indent) {
  return line.startsWith(' '.repeat(indent)) && !line.startsWith(' '.repeat(indent + 1)) && line.trim().endsWith(':')
}

function filterBlocks(sectionLines, shouldDrop, indent) {
  const out = []
  for (let i = 0; i < sectionLines.length;) {
    if (!isHeader(sectionLines[i], indent)) {
      out.push(sectionLines[i++])
      continue
    }
    let end = i + 1
    while (end < sectionLines.length && !isHeader(sectionLines[end], indent)) end++
    if (!shouldDrop(sectionLines[i])) out.push(...sectionLines.slice(i, end))
    i = end
  }
  return out
}

const importerStart = lines.indexOf('    dependencies:')
const importerEnd = lines.indexOf('    devDependencies:')
if (importerStart < 0 || importerEnd < 0) throw new Error('Importer dependency section not found')

const importerBody = filterBlocks(
  lines.slice(importerStart + 1, importerEnd),
  header => header.includes("'@arsybelovedlabs/moonwitness-design-system'") || header.includes("'@arsybelovedlabs/moonwitness-frontend-platform'"),
  6,
)
const newImporter = [
  "      '@arsybelovedlabs/moonwitness-frontend-platform':",
  '        specifier: 0.3.2',
  '        version: 0.3.2(react@19.2.8)',
]
lines.splice(importerStart + 1, importerEnd - importerStart - 1, ...newImporter, ...importerBody)

const packagesStart = lines.indexOf('packages:')
const snapshotsStart = lines.indexOf('snapshots:')
if (packagesStart < 0 || snapshotsStart < 0) throw new Error('Package/snapshot sections not found')
const packageBody = filterBlocks(
  lines.slice(packagesStart + 1, snapshotsStart),
  header => header.includes("'@arsybelovedlabs/moonwitness-design-system@") || header.includes("'@arsybelovedlabs/moonwitness-frontend-platform@"),
  2,
)
const newPackage = [
  '',
  "  '@arsybelovedlabs/moonwitness-frontend-platform@0.3.2':",
  '    resolution: {integrity: sha512-mskPBgkHiXKuHXWZqHIfiAhqWHRZuPJ7M7EYFgYBUTkrTLTpGZArbcPOzK/kXcv3H9AjYx3WD/KIrL4Ymi3q7A==, tarball: https://npm.pkg.github.com/download/@arsybelovedlabs/moonwitness-frontend-platform/0.3.2/a59a9f41ccfd80537bd9551f19a956f9f097ca1c}',
  '    engines: {node: 24.20.0, pnpm: 11.24.0}',
  '    peerDependencies:',
  '      react: ^18.2.0 || ^19.0.0',
]
lines.splice(packagesStart + 1, snapshotsStart - packagesStart - 1, ...newPackage, ...packageBody)

const snapshotsIndex = lines.indexOf('snapshots:')
const snapshotBody = filterBlocks(
  lines.slice(snapshotsIndex + 1),
  header => header.includes("'@arsybelovedlabs/moonwitness-design-system@") || header.includes("'@arsybelovedlabs/moonwitness-frontend-platform@"),
  2,
)
const newSnapshot = [
  '',
  "  '@arsybelovedlabs/moonwitness-frontend-platform@0.3.2(react@19.2.8)':",
  '    dependencies:',
  '      react: 19.2.8',
]
lines.splice(snapshotsIndex + 1, lines.length - snapshotsIndex - 1, ...newSnapshot, ...snapshotBody)

const output = lines.join('\n')
const digest = createHash('sha256').update(output).digest('hex')
if (digest !== expectedSha256) {
  throw new Error(`Generated lockfile digest ${digest} does not match owner-resolved evidence ${expectedSha256}`)
}
if (output.includes('moonwitness-design-system') || output.includes('git+https://github.com/ArsyBelovedLabs/moonwitness-frontend-platform')) {
  throw new Error('Legacy package ownership/dependency reference remains')
}
await writeFile(path, output)
console.log(`Exact registry lockfile applied: sha256:${digest}`)
