import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

const env = loadEnv('.env.local')
const port = Number(process.env.OUTLOOK_LOCAL_PORT ?? 8787)
const authority = 'https://login.microsoftonline.com/consumers/oauth2/v2.0'
const scope = 'openid profile offline_access User.Read Mail.Read Mail.Send'
const allowedOrigin = 'http://localhost:5173'

let expectedState = ''
let tokenSet = null
let profile = null

for (const key of ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_REDIRECT_URI']) {
  if (!env[key] || env[key].startsWith('REMPLACER_')) {
    throw new Error(`Variable manquante ou incomplete dans .env.local: ${key}`)
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, null)
      return
    }

    const url = new URL(req.url ?? '/', `http://localhost:${port}`)

    if (req.method === 'GET' && url.pathname === '/api/outlook/auth-url') {
      expectedState = randomBytes(16).toString('hex')
      const authorizeUrl = new URL(`${authority}/authorize`)
      authorizeUrl.searchParams.set('client_id', env.MICROSOFT_CLIENT_ID)
      authorizeUrl.searchParams.set('response_type', 'code')
      authorizeUrl.searchParams.set('redirect_uri', env.MICROSOFT_REDIRECT_URI)
      authorizeUrl.searchParams.set('response_mode', 'query')
      authorizeUrl.searchParams.set('scope', scope)
      authorizeUrl.searchParams.set('state', expectedState)
      authorizeUrl.searchParams.set('prompt', 'select_account')
      sendJson(res, 200, { url: authorizeUrl.toString() })
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/outlook/exchange') {
      const body = await readJson(req)
      if (!body.code) throw new Error('Code OAuth manquant')
      if (!body.state || body.state !== expectedState) throw new Error('State OAuth invalide')

      tokenSet = await exchangeCodeForToken(body.code)
      profile = await graph('/me?$select=displayName,mail,userPrincipalName', tokenSet.access_token)
      sendJson(res, 200, { ok: true, profile: publicProfile(profile) })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/outlook/status') {
      sendJson(res, 200, {
        connected: Boolean(tokenSet?.access_token),
        profile: profile ? publicProfile(profile) : null,
        mailbox: env.MICROSOFT_MAILBOX || null,
      })
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/outlook/disconnect') {
      expectedState = ''
      tokenSet = null
      profile = null
      sendJson(res, 200, { ok: true, connected: false, mailbox: env.MICROSOFT_MAILBOX || null })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/outlook/messages') {
      await ensureToken()
      const folder = url.searchParams.get('folder') ?? 'inbox'
      const top = Math.min(Number(url.searchParams.get('top') ?? 30), 50)
      const graphFolder = folder === 'sent' ? 'sentitems' : folder === 'drafts' ? 'drafts' : 'inbox'
      const data = await graph(
        `/me/mailFolders/${graphFolder}/messages?$top=${top}&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,receivedDateTime,sentDateTime,isRead,importance,bodyPreview,hasAttachments,categories,conversationId,internetMessageId`,
        tokenSet.access_token,
      )
      sendJson(res, 200, { messages: data.value.map(message => mapGraphMessage(message, folder)) })
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/outlook/send') {
      await ensureToken()
      const body = await readJson(req)
      if (!body.to) throw new Error('Destinataire manquant')

      await sendMail(tokenSet.access_token, body)
      sendJson(res, 200, { ok: true })
      return
    }

    sendJson(res, 404, { error: 'Route inconnue' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    sendJson(res, 500, { error: message })
  }
})

server.listen(port, () => {
  console.log(`Outlook local server pret: http://localhost:${port}`)
  console.log('Ouvre la page Sosson /emails puis clique sur Connecter Outlook.')
})

async function ensureToken() {
  if (!tokenSet?.access_token) throw new Error('Outlook non connecte. Clique sur Connecter Outlook dans Sosson.')
}

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
  if (!response.ok) throw new Error(payload.error_description ?? payload.error ?? response.statusText)
  return payload
}

async function graph(path, accessToken) {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error?.message ?? response.statusText)
  return payload
}

async function sendMail(accessToken, draft) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject: draft.subject || '(sans objet)',
        body: { contentType: 'Text', content: draft.body || '' },
        toRecipients: [{ emailAddress: { address: draft.to } }],
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
      // Empty response.
    }
    throw new Error(message)
  }
}

function mapGraphMessage(message, folder) {
  const from = message.from?.emailAddress
  const to = message.toRecipients?.[0]?.emailAddress
  const date = message.receivedDateTime ?? message.sentDateTime ?? new Date().toISOString()
  const tag = inferTag(message)
  const senderName = from?.name || from?.address || 'Outlook'
  const senderAddress = from?.address || from?.name || 'outlook'

  return {
    id: message.id,
    chantierId: 'chantier-1',
    clientId: 'client-1',
    expediteur: `${senderName} <${senderAddress}>`,
    destinataire: to?.address || env.MICROSOFT_MAILBOX || '',
    sujet: message.subject || '(sans objet)',
    extrait: message.bodyPreview || '',
    date,
    lu: Boolean(message.isRead),
    priorite: message.importance === 'high' ? 'haute' : message.importance === 'low' ? 'faible' : 'normale',
    tag,
    folder: folder === 'sent' || folder === 'drafts' ? folder : tag === 'spam' ? 'spam' : 'inbox',
    flagged: message.importance === 'high',
    archived: false,
    deleted: false,
    attachments: message.hasAttachments ? [{ name: 'Piece jointe Outlook', size: 'A charger', type: 'Graph' }] : [],
    graphId: message.id,
    internetMessageId: message.internetMessageId,
    conversationId: message.conversationId,
  }
}

function inferTag(message) {
  const text = `${message.subject ?? ''} ${message.bodyPreview ?? ''}`.toLowerCase()
  if (text.includes('facture') || text.includes('invoice')) return 'facture'
  if (text.includes('devis') || text.includes('quote')) return 'devis'
  if (text.includes('chantier') || text.includes('travaux')) return 'chantier'
  if (text.includes('spam')) return 'spam'
  return 'client'
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  })
  if (status === 204) {
    res.end()
    return
  }
  res.end(JSON.stringify(payload))
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

function publicProfile(value) {
  return {
    displayName: value.displayName,
    mail: value.mail,
    userPrincipalName: value.userPrincipalName,
  }
}
