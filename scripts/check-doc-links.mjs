import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const roots = ['README.md', 'documentation.md', 'AGENTS.md', 'docs']
const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g

function walkMarkdownFiles(targetPath) {
  if (!existsSync(targetPath)) return []

  const stats = statSync(targetPath)
  if (stats.isFile()) {
    return targetPath.endsWith('.md') ? [targetPath] : []
  }

  return readdirSync(targetPath).flatMap((entry) => walkMarkdownFiles(path.join(targetPath, entry)))
}

function isExternalOrAnchorOnly(target) {
  return !target || target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)
}

function stripLinkDecorations(rawTarget) {
  return rawTarget.trim().replace(/^<|>$/g, '').split('#')[0]
}

const markdownFiles = roots.flatMap(walkMarkdownFiles)
const failures = []
const indexContent = readFileSync('docs/00-index.md', 'utf8')

for (const file of markdownFiles) {
  const content = readFileSync(file, 'utf8')

  for (const match of content.matchAll(markdownLinkPattern)) {
    const target = stripLinkDecorations(match[1])

    if (isExternalOrAnchorOnly(target)) continue
    if (!target.endsWith('.md')) continue

    const resolved = path.normalize(path.join(path.dirname(file), target))
    if (!existsSync(resolved)) {
      failures.push(`${file}: lien local absent (${match[1]} -> ${resolved})`)
    }
  }
}

for (const entry of readdirSync('docs').filter((name) => name.endsWith('.md') && name !== '00-index.md')) {
  if (!indexContent.includes(entry)) {
    failures.push(`docs/00-index.md: document docs/${entry} non reference dans l'index`)
  }
}

if (failures.length) {
  console.error('Liens documentation non conformes:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Liens documentation OK: ${markdownFiles.length} fichiers Markdown verifies et index docs/00-index.md couvert.`)
