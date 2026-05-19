import { readFile } from 'node:fs/promises'

const scenarioPath = 'docs/17-operational-lifecycle-scenario.md'
const quickResponseTemplate = `1. Nouveau client - champs minimaux:
2. Client seul ou client + chantier:
3. Devis:
4. Facture fournisseur - moment et saisie:
5. Dashboard - factures impactantes:
6. Client Excel -> operationnel:
7. Statuts chantier:
8. Chiffres immediats:
9. Moteur live:`

const content = await readFile(scenarioPath, 'utf8')
const decisionRows = content
  .split('\n')
  .filter(line => /^\| [1-9] \|/.test(line))

const failures = []

if (decisionRows.length !== 9) {
  failures.push(`${scenarioPath}: 9 decisions metier attendues, ${decisionRows.length} trouvees.`)
}

for (const row of decisionRows) {
  const cells = row
    .split('|')
    .slice(1, -1)
    .map(cell => cell.trim())
  const [index, decision, answer] = cells

  if (!index || !decision) {
    failures.push(`${scenarioPath}: ligne decision invalide (${row}).`)
  }

  if (!answer || /^A completer$/i.test(answer)) {
    failures.push(`${scenarioPath}: decision ${index} non renseignee - ${decision}.`)
  }
}

if (/A completer/i.test(content)) {
  failures.push(`${scenarioPath}: le marqueur "A completer" reste present.`)
}

if (failures.length > 0) {
  console.error('Decisions metier lifecycle non completees:')
  for (const failure of failures) console.error(`- ${failure}`)
  console.error('\nFormat de reponse attendu pour debloquer ce check:')
  console.error(quickResponseTemplate)
  process.exit(1)
}

console.log('Decisions metier lifecycle OK: les 9 reponses sont renseignees.')
