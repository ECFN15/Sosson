import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

const OUTLOOK_LOCAL_API = 'http://localhost:8787'
const OUTLOOK_RETURN_TO_KEY = 'sosson.outlook.returnTo'

function getSafeReturnPath() {
  const storedPath = localStorage.getItem(OUTLOOK_RETURN_TO_KEY)
  localStorage.removeItem(OUTLOOK_RETURN_TO_KEY)

  if (storedPath?.startsWith('/') && !storedPath.startsWith('//')) {
    return storedPath
  }

  return '/emails?outlook=connected'
}

function getInitialCallbackState() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const error = params.get('error_description') ?? params.get('error')

  if (error) {
    return {
      code: null,
      state: null,
      status: 'error' as const,
      message: error,
    }
  }

  if (!code || !state) {
    return {
      code: null,
      state: null,
      status: 'error' as const,
      message: 'Callback Microsoft incomplet: code ou state manquant.',
    }
  }

  return {
    code,
    state,
    status: 'loading' as const,
    message: 'Connexion Microsoft en cours...',
  }
}

export function MicrosoftCallbackPage() {
  const [callbackState] = useState(getInitialCallbackState)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(callbackState.status)
  const [message, setMessage] = useState(callbackState.message)

  useEffect(() => {
    if (!callbackState.code || !callbackState.state) return

    fetch(`${OUTLOOK_LOCAL_API}/api/outlook/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: callbackState.code, state: callbackState.state }),
    })
      .then(async response => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error ?? 'Connexion Outlook refusee')
        setStatus('success')
        setMessage('Outlook connecte. Retour a la boite mail...')
        const returnPath = getSafeReturnPath()
        window.setTimeout(() => window.location.replace(returnPath), 900)
      })
      .catch(error => {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : String(error))
      })
  }, [callbackState.code, callbackState.state])

  const Icon = status === 'loading' ? Loader2 : status === 'success' ? CheckCircle2 : XCircle

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#FAF6F2] p-6">
      <div className="w-full max-w-[460px] rounded-[20px] border border-[#F2E8DC] bg-white p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#FDEBDD] text-[#F06B21]">
          <Icon className={status === 'loading' ? 'h-6 w-6 animate-spin' : 'h-6 w-6'} strokeWidth={1.75} />
        </div>
        <h1 className="mt-4 text-[22px] font-semibold text-[#1E1E1E]">Connexion Outlook</h1>
        <p className="mt-2 text-sm leading-6 text-[#3C3C3C]">{message}</p>
        {status === 'error' && (
          <button
            type="button"
            onClick={() => window.location.replace('/emails')}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]"
          >
            Retour aux emails
          </button>
        )}
      </div>
    </div>
  )
}
