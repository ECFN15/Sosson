import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const scenarioPath = 'docs/17-operational-lifecycle-scenario.md'
const repoRoot = process.cwd()
const decisionKeys = [
  ['1', 'nouveauClientChampsMinimaux', 'Nouveau client - champs minimaux'],
  ['2', 'clientEtChantier', 'Client seul ou client + chantier'],
  ['3', 'devis', 'Devis'],
  ['4', 'factureFournisseur', 'Facture fournisseur - moment et saisie'],
  ['5', 'dashboardFactures', 'Dashboard - factures impactantes'],
  ['6', 'conversionPrevisionnel', 'Client Excel -> operationnel'],
  ['7', 'statutsChantier', 'Statuts chantier'],
  ['8', 'chiffresImmediats', 'Chiffres immediats'],
  ['9', 'moteurLive', 'Moteur live'],
]

function argValue(name) {
  const prefix = `--${name}=`
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length) ?? null
}

function printTemplate() {
  process.stdout.write(jsonTemplate())
}

function printTextTemplate() {
  process.stdout.write(textTemplate())
}

function jsonTemplate() {
  return `${JSON.stringify(Object.fromEntries(decisionKeys.map(([, key]) => [key, ''])), null, 2)}\n`
}

function textTemplate() {
  return `${decisionKeys.map(([index, , label]) => `${index}. ${label}:`).join('\n')}\n`
}

function assertRepoPath(filePath) {
  const resolved = path.resolve(repoRoot, filePath)
  const relative = path.relative(repoRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Le fichier de reponses doit rester dans le repo.')
  }

  if (!relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('Le fichier de reponses doit etre place sous tmp/ pour eviter de committer des decisions provisoires.')
  }

  return resolved
}

function normalizeAnswer(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
}

async function writeTemplate(outputPath, content) {
  const resolved = assertRepoPath(outputPath)
  await mkdir(path.dirname(resolved), { recursive: true })
  await writeFile(resolved, content, 'utf8')
  console.log(`Modele ecrit dans ${path.relative(repoRoot, resolved)}`)
}

const outputPath = argValue('output')
const wantsJsonTemplate = process.argv.includes('--template')
const wantsTextTemplate = process.argv.includes('--text-template')

if (wantsJsonTemplate && wantsTextTemplate) {
  console.error('Utiliser soit --template, soit --text-template, pas les deux.')
  process.exit(1)
}

if (wantsJsonTemplate) {
  if (outputPath) await writeTemplate(outputPath, jsonTemplate())
  else printTemplate()
  process.exit(0)
}

if (wantsTextTemplate) {
  if (outputPath) await writeTemplate(outputPath, textTemplate())
  else printTextTemplate()
  process.exit(0)
}

const answersPath = argValue('file')
const textAnswersPath = argValue('text-file')
const dryRun = process.argv.includes('--dry-run')

if (!answersPath && !textAnswersPath) {
  console.error('Usage: npm run update:operational-lifecycle-decisions -- --file=tmp/checkpoint-002/answers.json [--dry-run]')
  console.error('   ou: npm run update:operational-lifecycle-decisions -- --text-file=tmp/checkpoint-002/answers.txt [--dry-run]')
  console.error('Pour generer un modele JSON: npm run update:operational-lifecycle-decisions -- --template')
  console.error('Pour generer un modele texte: npm run update:operational-lifecycle-decisions -- --text-template')
  console.error('Ajouter --output=tmp/checkpoint-002/answers.template.txt pour ecrire le modele dans un fichier.')
  process.exit(1)
}

if (answersPath && textAnswersPath) {
  console.error('Utiliser soit --file, soit --text-file, pas les deux.')
  process.exit(1)
}

function answersFromText(content) {
  const answers = {}
  const lines = content.split('\n')

  for (const [index, key, label] of decisionKeys) {
    const line = lines.find(item => item.trim().startsWith(`${index}.`))
    if (!line) continue

    const labelMatch = line.match(/^\s*\d+\.\s*([^:]+):\s*(.*)$/)
    if (!labelMatch) continue

    const [, actualLabel, value] = labelMatch
    const normalizedExpectedLabel = label.toLowerCase().replace(/\s+/g, ' ')
    const normalizedActualLabel = actualLabel.trim().toLowerCase().replace(/\s+/g, ' ')
    if (normalizedActualLabel !== normalizedExpectedLabel) {
      throw new Error(`Libelle inattendu pour la decision ${index}: "${actualLabel.trim()}". Attendu: "${label}".`)
    }

    answers[key] = value
  }

  return answers
}

let answers
try {
  if (answersPath) {
    answers = JSON.parse(await readFile(assertRepoPath(answersPath), 'utf8'))
  } else {
    answers = answersFromText(await readFile(assertRepoPath(textAnswersPath), 'utf8'))
  }
} catch (error) {
  console.error(answersPath ? `Impossible de lire les reponses JSON: ${answersPath}` : `Impossible de lire les reponses texte: ${textAnswersPath}`)
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const normalizedAnswers = new Map()
const failures = []

for (const [index, key] of decisionKeys) {
  const answer = normalizeAnswer(answers[key])
  if (!answer || /^A completer$/i.test(answer)) {
    failures.push(`decision ${index} (${key}) non renseignee.`)
  }
  normalizedAnswers.set(index, answer)
}

if (failures.length > 0) {
  console.error('Reponses lifecycle invalides:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

const content = await readFile(scenarioPath, 'utf8')
let replaced = 0
const nextContent = content
  .split('\n')
  .map(line => {
    const match = line.match(/^\| ([1-9]) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/)
    if (!match) return line

    const [, index, decision, , impact] = match
    const answer = normalizedAnswers.get(index)
    if (!answer) return line

    replaced += 1
    return `| ${index} | ${decision.trim()} | ${answer} | ${impact.trim()} |`
  })
  .join('\n')

if (replaced !== decisionKeys.length) {
  console.error(`Nombre de decisions remplacees inattendu: ${replaced}/${decisionKeys.length}.`)
  process.exit(1)
}

if (dryRun) {
  console.log(`Dry-run OK: ${replaced} reponses peuvent etre appliquees a ${scenarioPath}.`)
  process.exit(0)
}

await writeFile(scenarioPath, nextContent, 'utf8')
console.log(`${replaced} reponses metier appliquees dans ${scenarioPath}.`)
console.log('Relancer ensuite: npm run check:operational-lifecycle-decisions')
