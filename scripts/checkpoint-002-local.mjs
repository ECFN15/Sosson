import { spawn } from 'node:child_process'

const npmInvocation = process.platform === 'win32'
  ? { command: process.env.ComSpec ?? 'cmd.exe', prefixArgs: ['/d', '/s', '/c', 'npm'] }
  : { command: 'npm', prefixArgs: [] }

const commands = [
  {
    label: 'CI sandbox locale',
    command: npmInvocation.command,
    prefixArgs: npmInvocation.prefixArgs,
    args: ['run', 'ci:sandbox'],
  },
  {
    label: 'Audit sources front hybrides',
    command: npmInvocation.command,
    prefixArgs: npmInvocation.prefixArgs,
    args: ['run', 'audit:frontend-sources', '--', '--output=tmp/checkpoint-002/frontend-sources.json'],
  },
  {
    label: 'Dry-run comptage Data Connect archivable',
    command: npmInvocation.command,
    prefixArgs: npmInvocation.prefixArgs,
    args: [
      'run',
      'count:dataconnect',
      '--',
      '--dry-run',
      '--output=tmp/checkpoint-002/counts-dry-run.json',
    ],
  },
  {
    label: 'Dry-run seed Data Connect sandbox',
    command: npmInvocation.command,
    prefixArgs: npmInvocation.prefixArgs,
    args: [
      'run',
      'seed:sandbox',
      '--',
      '--dry-run',
      '--kind=previsionnel',
      '--output=tmp/checkpoint-002/seed-sandbox-dry-run.json',
    ],
  },
  {
    label: 'Dry-run provisioning profils SQL User',
    command: npmInvocation.command,
    prefixArgs: npmInvocation.prefixArgs,
    args: [
      'run',
      'provision:sql-users',
      '--',
      '--file=dataconnect/user_profiles.example.json',
      '--dry-run',
    ],
  },
]

function runCommand({ label, command, prefixArgs, args }) {
  return new Promise((resolve, reject) => {
    const fullArgs = [...prefixArgs, ...args]
    console.log(`\n== ${label}`)
    console.log(`$ npm ${args.join(' ')}`)

    const child = spawn(command, fullArgs, { stdio: 'inherit' })

    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`${label} a echoue avec le code ${code}.`))
    })
  })
}

for (const item of commands) {
  await runCommand(item)
}

console.log('\nPreflight checkpoint 002 local OK.')
console.log('Ce resultat ne valide pas encore la sandbox distante.')
console.log('Restent hors de ce preflight: emulateur SQL Connect, execution seed sandbox reelle, comptage sandbox, vrais profils SQL User, deploy/test rules sandbox, RBAC serveur sur sandbox, Storage produit, monitoring/backups.')
