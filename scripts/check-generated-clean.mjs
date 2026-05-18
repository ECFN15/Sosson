import { execFileSync } from 'node:child_process'

const generatedDirs = [
  'src/dataconnect-generated',
  'src/dataconnect-admin-generated',
]
const dataconnectSourcePaths = [
  'dataconnect/dataconnect.yaml',
  'dataconnect/schema',
  'dataconnect/sosson',
]

function gitStatus(paths) {
  return execFileSync('git', ['status', '--porcelain', '--', ...paths], {
    encoding: 'utf8',
  }).trim()
}

try {
  const generatedOutput = gitStatus(generatedDirs)
  const sourceOutput = gitStatus(dataconnectSourcePaths)

  if (!generatedOutput) {
    console.log('SDKs SQL Connect generes inchanges.')
    process.exit(0)
  }

  if (sourceOutput) {
    console.log('SDKs SQL Connect generes modifies avec des sources Data Connect modifiees.')
    console.log('Verifier que la regeneration vient de: firebase dataconnect:sdk:generate')
    process.exit(0)
  }

  console.error('Les SDKs SQL Connect generes ont des modifications sans changement Data Connect source:')
  console.error(generatedOutput)
  console.error('Ne pas les modifier a la main. Regenerer avec firebase dataconnect:sdk:generate apres validation schema/operations.')
  process.exit(1)
} catch (error) {
  console.error('Impossible de verifier les dossiers generes avec git.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
