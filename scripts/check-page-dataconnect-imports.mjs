import { execFileSync } from 'node:child_process'

const generatedImportPattern = '@dataconnect/generated'
const args = [
  '-n',
  generatedImportPattern,
  'src/pages',
  '--glob',
  '!src/dataconnect-generated/**',
  '--glob',
  '!src/dataconnect-admin-generated/**',
]

let output = ''
let hasMatches = false

try {
  output = execFileSync('rg', args, { encoding: 'utf8' })
  hasMatches = Boolean(output.trim())
} catch (error) {
  if (error.status === 1) {
    hasMatches = false
  } else {
    throw error
  }
}

if (hasMatches) {
  console.error('Imports directs du SDK SQL Connect detectes dans src/pages.')
  console.error('Utiliser un adapter dans src/features/* au lieu d importer @dataconnect/generated depuis une page.')
  console.error(output.trim())
  process.exit(1)
}

console.log('Aucun import direct @dataconnect/generated dans src/pages.')
