import { readFile } from 'node:fs/promises'

const defaultProofPath = 'tmp/checkpoint-002/operational-lifecycle-local.json'
const proofPath = process.argv.find(arg => arg.startsWith('--proof='))?.replace('--proof=', '') ?? defaultProofPath

function assert(condition, message, failures) {
  if (!condition) failures.push(message)
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isEmptyArray(value) {
  return Array.isArray(value) && value.length === 0
}

let proof
try {
  proof = JSON.parse(await readFile(proofPath, 'utf8'))
} catch (error) {
  console.error(`Preuve lifecycle introuvable ou illisible: ${proofPath}`)
  console.error('Generer la preuve avec: npm run checkpoint:002:emulator')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const failures = []
const prospectClient = proof.created?.prospectClient
const client = proof.created?.client
const chantier = proof.created?.chantier
const devis = Array.isArray(proof.created?.devis) ? proof.created.devis : []
const factures = Array.isArray(proof.created?.factures) ? proof.created.factures : []
const guardrails = proof.guardrails ?? {}
const checks = proof.checks ?? {}
const signedDevis = devis.find(item => item.statut === 'devis_signe')
const prospectDevis = devis.find(item => item.statut === 'devis_demande')

assert(proof.mode === 'local-emulator', `mode attendu local-emulator, recu ${proof.mode}`, failures)
assert(proof.sandboxTouched === false, 'sandboxTouched doit rester false.', failures)
assert(proof.productionTouched === false, 'productionTouched doit rester false.', failures)
assert(proof.mutatesData === true, 'mutatesData doit indiquer que la preuve cree des donnees locales isolees.', failures)

assert(proof.actor?.provisionedAndReadable === true, 'profil SQL User local non provisionne/relu.', failures)
assert(Boolean(proof.actor?.uid), 'actor.uid absent.', failures)
assert(Boolean(proof.actor?.role), 'actor.role absent.', failures)

assert(Boolean(prospectClient?.id), 'prospect client cree absent.', failures)
assert(prospectClient?.origineImport === 'operationnel', 'prospect client doit avoir origineImport operationnel.', failures)
assert(prospectClient?.foundInOperationalList === true, 'prospect client non retrouve dans la liste operationnelle.', failures)
assert(prospectClient?.chantierCount === 0, 'prospect client doit exister sans chantier rattache.', failures)

assert(Boolean(client?.id), 'client cree absent.', failures)
assert(client?.origineImport === 'operationnel', 'client cree doit avoir origineImport operationnel.', failures)
assert(client?.foundInOperationalList === true, 'client cree non retrouve dans la liste operationnelle.', failures)
assert(!String(client?.id ?? '').startsWith('prev-client-'), 'client operationnel ne doit pas avoir un id prev-client-*.', failures)

assert(Boolean(chantier?.id), 'chantier cree absent.', failures)
assert(chantier?.clientId === client?.id, 'chantier cree non rattache au client cree.', failures)
assert(chantier?.origineImport === 'operationnel', 'chantier cree doit avoir origineImport operationnel.', failures)
assert(chantier?.foundInOperationalList === true, 'chantier cree non retrouve dans la liste operationnelle.', failures)
assert(!String(chantier?.id ?? '').startsWith('prev-chantier-'), 'chantier operationnel ne doit pas avoir un id prev-chantier-*.', failures)
assert(
  ['prospect', 'devis_a_faire', 'devis_envoye', 'signe', 'en_preparation', 'en_cours', 'en_pause', 'termine', 'cloture', 'annule'].includes(chantier?.statut),
  `statut chantier metier inattendu: ${chantier?.statut}`,
  failures,
)

assert(devis.length >= 2, 'au moins deux devis sont attendus: demande prospect et devis signe.', failures)
assert(Boolean(prospectDevis?.id), 'devis demande prospect absent.', failures)
assert(prospectDevis?.clientId === prospectClient?.id, 'devis demande non rattache au prospect.', failures)
assert(!prospectDevis?.chantierId, 'devis demande prospect ne doit pas etre rattache a un chantier.', failures)
assert(Boolean(signedDevis?.id), 'devis signe absent.', failures)
assert(signedDevis?.clientId === client?.id, 'devis signe non rattache au client operationnel.', failures)
assert(signedDevis?.chantierId === chantier?.id, 'devis signe non rattache au chantier operationnel.', failures)
assert(isPositiveNumber(signedDevis?.montantTTC), 'devis signe sans montantTTC positif.', failures)

assert(factures.length >= 1, 'au moins une facture rattachee est attendue.', failures)
for (const facture of factures) {
  assert(Boolean(facture.id), 'facture sans id.', failures)
  assert(facture.chantierId === chantier?.id, `facture ${facture.numeroFacture ?? facture.id} non rattachee au chantier cree.`, failures)
  assert(facture.clientId === client?.id, `facture ${facture.numeroFacture ?? facture.id} non rattachee au client cree via chantier.`, failures)
  assert(isPositiveNumber(facture.montantTTC), `facture ${facture.numeroFacture ?? facture.id} sans montantTTC positif.`, failures)
  assert(facture.statut === 'validee', `facture ${facture.numeroFacture ?? facture.id} doit etre definitive/importee et validee dans la preuve.`, failures)
  assert(Boolean(facture.categorie), `facture ${facture.numeroFacture ?? facture.id} sans categorie/poste.`, failures)
}

assert((proof.readBack?.operationalClientsVisible ?? 0) >= 2, 'clients operationnels relus insuffisants.', failures)
assert((proof.readBack?.operationalChantiersVisible ?? 0) >= 1, 'aucun chantier operationnel relu.', failures)
assert((proof.readBack?.devisVisible ?? 0) >= devis.length, 'les devis crees ne sont pas visibles a la relecture.', failures)
assert((proof.readBack?.facturesVisible ?? 0) >= factures.length, 'les factures creees ne sont pas toutes visibles a la relecture.', failures)
assert((proof.readBack?.previsionnelClientsSampled ?? 0) > 0, 'echantillon clients previsionnels absent.', failures)
assert((proof.readBack?.previsionnelChantiersSampled ?? 0) > 0, 'echantillon chantiers previsionnels absent.', failures)

assert(isEmptyArray(guardrails.leakedPrevisionnelClientIds), 'des clients previsionnels sortent dans la liste operationnelle.', failures)
assert(isEmptyArray(guardrails.leakedPrevisionnelChantierIds), 'des chantiers previsionnels sortent dans la liste operationnelle.', failures)
assert(isEmptyArray(guardrails.prefixedOperationalClientIds), 'des ids prev-client-* sont traites operationnels.', failures)
assert(isEmptyArray(guardrails.prefixedOperationalChantierIds), 'des ids prev-chantier-* sont traites operationnels.', failures)

for (const [key, value] of Object.entries(checks)) {
  assert(value === true, `check lifecycle faux: ${key}`, failures)
}

assert(
  proof.dashboardInputsFromSql?.facturesImpactRule === 'all_imported_supplier_invoices',
  'la preuve doit figer la regle: toutes les factures fournisseur importees impactent les chiffres.',
  failures,
)
assert(isPositiveNumber(proof.dashboardInputsFromSql?.totalImportedFacturesTTC), 'totalImportedFacturesTTC SQL local absent ou non positif.', failures)
assert(isPositiveNumber(proof.dashboardInputsFromSql?.chantierBudgetPrevisionnel), 'budget chantier SQL local absent ou non positif.', failures)
assert(
  Object.keys(proof.dashboardInputsFromSql?.facturesByCategorie ?? {}).length >= 2,
  'ventilation factures par categorie/poste absente ou insuffisante.',
  failures,
)

if (failures.length > 0) {
  console.error(`Preuve lifecycle locale invalide: ${proofPath}`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Preuve lifecycle locale OK: ${proofPath}`)
console.log(`- prospect sans chantier: ${prospectClient.nom} (${prospectClient.id})`)
console.log(`- client operationnel: ${client.nom} (${client.id})`)
console.log(`- chantier rattache: ${chantier.nom} (${chantier.id})`)
console.log(`- devis relus: ${devis.length}`)
console.log(`- factures definitives rattachees: ${factures.length}`)
console.log('- sandboxTouched=false, productionTouched=false, aucune fuite previsionnelle operationnelle.')
