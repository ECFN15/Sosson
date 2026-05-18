import { readFile } from 'node:fs/promises'

const mutationsPath = 'dataconnect/sosson/mutations.gql'
const content = await readFile(mutationsPath, 'utf8')
const findings = []
const staleInsecureReasonPatterns = [
  /later hardening pass/i,
  /role hardening is added later/i,
  /database-level role checks are added/i,
]

function extractMutations(source) {
  const matches = [...source.matchAll(/^mutation\s+(\w+)\s*\(/gm)]
  return matches.map((match, index) => {
    const start = match.index
    const end = matches[index + 1]?.index ?? source.length
    return {
      name: match[1],
      body: source.slice(start, end),
    }
  })
}

const mutations = extractMutations(content)

if (!mutations.length) {
  findings.push(`${mutationsPath}: aucune mutation detectee.`)
}

for (const mutation of mutations) {
  if (!/@auth\s*\(/.test(mutation.body)) {
    findings.push(`${mutationsPath}: mutation ${mutation.name} sans @auth explicite.`)
  }

  if (mutation.name !== 'UpsertCurrentUser') {
    if (!/insecureReason\s*:/.test(mutation.body)) {
      findings.push(
        `${mutationsPath}: mutation ${mutation.name} sans insecureReason documentant l'etat RBAC transitoire.`,
      )
    }

    if (staleInsecureReasonPatterns.some(pattern => pattern.test(mutation.body))) {
      findings.push(
        `${mutationsPath}: mutation ${mutation.name} contient un insecureReason obsolete sur un RBAC futur.`,
      )
    }

    if (!/@transaction\b/.test(mutation.body)) {
      findings.push(`${mutationsPath}: mutation ${mutation.name} sans @transaction.`)
    }

    if (!/currentUser:\s*user\(key:\s*\{\s*id_expr:\s*"auth\.uid"\s*\}/.test(mutation.body)) {
      findings.push(`${mutationsPath}: mutation ${mutation.name} sans lecture RBAC du User SQL courant.`)
    }

    if (!/role\s+@check\(expr:\s*"this in \[/.test(mutation.body)) {
      findings.push(`${mutationsPath}: mutation ${mutation.name} sans check role serveur.`)
    }
  }
}

if (mutations.some(mutation => mutation.name === 'UpsertCurrentUser')) {
  findings.push(`${mutationsPath}: UpsertCurrentUser ne doit plus etre expose dans le connecteur client.`)
}

if (findings.length) {
  console.error('Invariants auth SQL Connect non respectes:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log(`Invariants auth SQL Connect OK: ${mutations.length} mutation(s) auditee(s).`)
