import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'

const env = loadEnv('.env.local')
const required = [
  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET',
  'MICROSOFT_REDIRECT_URI',
  'MICROSOFT_MAILBOX',
]

for (const key of required) {
  if (!env[key] || env[key].startsWith('REMPLACER_')) {
    throw new Error(`Variable manquante ou incomplete dans .env.local: ${key}`)
  }
}

const redirectUrl = new URL(env.MICROSOFT_REDIRECT_URI)
if (redirectUrl.hostname !== 'localhost' || redirectUrl.port !== '5173') {
  throw new Error('Ce test local attend MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/microsoft/callback')
}

const authority = 'https://login.microsoftonline.com/consumers/oauth2/v2.0'
const scope = 'openid profile offline_access User.Read Mail.Read Mail.Send'
const state = randomBytes(16).toString('hex')
const shouldSend = process.argv.includes('--send')

const authorizeUrl = new URL(`${authority}/authorize`)
authorizeUrl.searchParams.set('client_id', env.MICROSOFT_CLIENT_ID)
authorizeUrl.searchParams.set('response_type', 'code')
authorizeUrl.searchParams.set('redirect_uri', env.MICROSOFT_REDIRECT_URI)
authorizeUrl.searchParams.set('response_mode', 'query')
authorizeUrl.searchParams.set('scope', scope)
authorizeUrl.searchParams.set('state', state)
authorizeUrl.searchParams.set('prompt', 'select_account')

const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? '/', env.MICROSOFT_REDIRECT_URI)
    if (requestUrl.pathname !== redirectUrl.pathname) {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    if (requestUrl.searchParams.get('state') !== state) {
      throw new Error('Retour OAuth refuse: state invalide')
    }

    const error = requestUrl.searchParams.get('error')
    if (error) {
      throw new Error(`${error}: ${requestUrl.searchParams.get('error_description') ?? 'Erreur Microsoft'}`)
    }

    const code = requestUrl.searchParams.get('code')
    if (!code) {
      throw new Error('Aucun code OAuth recu')
    }

    const token = await exchangeCodeForToken(code)
    const profile = await graph('/me?$select=displayName,mail,userPrincipalName', token.access_token)
    const messages = await graph('/me/mailFolders/inbox/messages?$top=1&$select=subject,from,receivedDateTime', token.access_token)
    const sentSubject = shouldSend ? await sendTestMail(token.access_token, env.MICROSOFT_MAILBOX) : null

    const latest = messages.value?.[0]
    const html = `
      <main style="font-family:system-ui;padding:32px;line-height:1.5">
        <h1>Connexion Microsoft Graph OK</h1>
        <p>Compte: ${escapeHtml(profile.mail ?? profile.userPrincipalName ?? profile.displayName ?? 'inconnu')}</p>
        <p>Dernier mail lu: ${escapeHtml(latest?.subject ?? 'aucun mail trouve')}</p>
        ${sentSubject ? `<p>Mail de test envoye: ${escapeHtml(sentSubject)}</p>` : ''}
        <p>Tu peux fermer cet onglet et revenir dans le terminal.</p>
      </main>
    `
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)

    console.log('Connexion Microsoft Graph OK')
    console.log(`Compte: ${profile.mail ?? profile.userPrincipalName ?? profile.displayName ?? 'inconnu'}`)
    console.log(`Dernier mail lu: ${latest?.subject ?? 'aucun mail trouve'}`)
    if (sentSubject) console.log(`Mail de test envoye: ${sentSubject}`)
    server.close()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(message)
    console.error(message)
    server.close()
  }
})

server.listen(5173, () => {
  console.log('Serveur OAuth local pret: http://localhost:5173/auth/microsoft/callback')
  console.log('Si le navigateur ne s ouvre pas, copie cette URL:')
  console.log(authorizeUrl.toString())
  console.log('Ouverture de Microsoft...')
  openBrowser(authorizeUrl.toString())
})

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams()
  body.set('client_id', env.MICROSOFT_CLIENT_ID)
  body.set('client_secret', env.MICROSOFT_CLIENT_SECRET)
  body.set('code', code)
  body.set('redirect_uri', env.MICROSOFT_REDIRECT_URI)
  body.set('grant_type', 'authorization_code')
  body.set('scope', scope)

  const response = await fetch(`${authority}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(`Echange token refuse: ${payload.error_description ?? payload.error ?? response.statusText}`)
  }

  return payload
}

async function graph(path, accessToken) {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(`Graph refuse ${path}: ${payload.error?.message ?? response.statusText}`)
  }

  return payload
}

async function sendTestMail(accessToken, recipient) {
  const subject = `Sosson Graph test ${new Date().toISOString()}`
  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: 'Text',
          content: 'Test envoi Microsoft Graph depuis le module email Sosson.',
        },
        toRecipients: [
          {
            emailAddress: {
              address: recipient,
            },
          },
        ],
      },
      saveToSentItems: true,
    }),
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const payload = await response.json()
      message = payload.error?.message ?? message
    } catch {
      // Microsoft may return an empty body for some errors.
    }
    throw new Error(`Graph refuse /me/sendMail: ${message}`)
  }

  return subject
}

function loadEnv(path) {
  const source = readFileSync(path, 'utf8')
  const result = {}

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index === -1) continue
    result[line.slice(0, index).trim()] = line.slice(index + 1).trim()
  }

  return result
}

function openBrowser(url) {
  if (process.platform === 'win32') {
    spawn('powershell', ['-NoProfile', '-Command', 'Start-Process', url], { detached: true, stdio: 'ignore' }).unref()
    return
  }

  const command = process.platform === 'darwin' ? 'open' : 'xdg-open'
  spawn(command, [url], { detached: true, stdio: 'ignore' }).unref()
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
