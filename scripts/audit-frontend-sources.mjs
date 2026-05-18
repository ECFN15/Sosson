import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const args = process.argv.slice(2)
const outputArg = args.find(arg => arg.startsWith('--output='))
const outputPath = outputArg ? outputArg.slice('--output='.length) : null

const searches = [
  {
    label: 'Imports directs de donnees locales/seeds',
    pattern: "from ['\\\"]@/data",
    paths: ['src/pages', 'src/lib', 'src/features'],
  },
  {
    label: 'Usages applicatifs localStorage',
    pattern: '(window\\.)?localStorage\\.(getItem|setItem|removeItem|clear|key)',
    paths: ['src/pages', 'src/lib', 'src/features'],
  },
  {
    label: 'Usages Firestore',
    pattern: 'firebase/firestore|getDoc|collection|doc\\(',
    paths: ['src/pages', 'src/lib', 'src/features'],
  },
  {
    label: 'Imports directs du SDK SQL Connect dans les pages',
    pattern: '@dataconnect/generated',
    paths: ['src/pages'],
  },
]

function runRg(pattern, paths) {
  try {
    return execFileSync('rg', ['-n', pattern, ...paths], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 1) return ''
    throw error
  }
}

function assertOutputPathIsSafe(filePath) {
  if (!filePath) return

  const resolved = path.resolve(repoRoot, filePath)
  const tmpRoot = path.resolve(repoRoot, 'tmp')
  if (resolved !== tmpRoot && !resolved.startsWith(`${tmpRoot}${path.sep}`)) {
    console.error("Refus d'ecrire une preuve audit hors de tmp/.")
    console.error(`Chemin demande: ${filePath}`)
    process.exit(1)
  }
}

assertOutputPathIsSafe(outputPath)

const report = {
  generatedAt: new Date().toISOString(),
  mutatesData: false,
  searches: [],
}

for (const search of searches) {
  const output = runRg(search.pattern, search.paths)
  const lines = output ? output.split(/\r?\n/) : []
  report.searches.push({
    label: search.label,
    pattern: search.pattern,
    paths: search.paths,
    count: lines.length,
    lines,
  })

  console.log(`\n## ${search.label} (${lines.length})`)
  if (!lines.length) {
    console.log('Aucune occurrence.')
    continue
  }
  for (const line of lines) console.log(line)
}

if (outputPath) {
  const resolved = path.resolve(repoRoot, outputPath)
  fs.mkdirSync(path.dirname(resolved), { recursive: true })
  fs.writeFileSync(resolved, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`\nPreuve audit sources front ecrite dans ${outputPath}`)
}

console.log('\nAudit termine. Ce script cartographie les dependances hybrides; il ne bloque pas encore la CI.')
