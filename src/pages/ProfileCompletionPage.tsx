import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Building2, Check, ShieldCheck, UserRound } from 'lucide-react'
import { useApp } from '@/lib/store'
import { waitForFirebaseUser } from '@/lib/firebaseAuthState'
import {
  requestedTeamTypeLabels,
  requestedTeamTypes,
  sourceConnexionFromProvider,
  submitTeamProfileForCurrentUser,
} from '@/features/auth/teamProfileSubmission'
import type { RequestedTeamType } from '@/features/auth/teamProfileSubmission'

function getSafeReturnPath(value: unknown) {
  if (typeof value !== 'string') return '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/login')) return '/dashboard'
  return value
}

function splitDisplayName(displayName: string | null) {
  const parts = (displayName ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { prenom: '', nom: '' }
  if (parts.length === 1) return { prenom: parts[0], nom: '' }
  return { prenom: parts[0], nom: parts.slice(1).join(' ') }
}

export function ProfileCompletionPage() {
  const { authInitializing, authStatus, firebaseUser, user } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath = getSafeReturnPath((location.state as { from?: unknown } | null)?.from)
  const [email, setEmail] = useState(firebaseUser?.email ?? '')
  const [prenom, setPrenom] = useState(() => splitDisplayName(firebaseUser?.displayName ?? null).prenom)
  const [nom, setNom] = useState(() => splitDisplayName(firebaseUser?.displayName ?? null).nom)
  const [requestedTeamType, setRequestedTeamType] = useState<RequestedTeamType>('chantier')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeFirebaseUser = firebaseUser
  const providerId = useMemo(
    () => activeFirebaseUser?.providerData[0]?.providerId ?? 'password',
    [activeFirebaseUser],
  )

  useEffect(() => {
    if (authInitializing) return
    if (authStatus === 'ready' && user) {
      navigate(returnPath, { replace: true })
      return
    }
    if (authStatus === 'profile-pending') {
      navigate('/profile-pending', { replace: true })
      return
    }

    let isMounted = true
    void waitForFirebaseUser(2500).then(fbUser => {
      if (!isMounted) return
      if (!fbUser) {
        navigate('/login', { replace: true, state: { from: returnPath } })
        return
      }
      setEmail(fbUser.email ?? '')
      const parsed = splitDisplayName(fbUser.displayName)
      setPrenom(prev => prev || parsed.prenom)
      setNom(prev => prev || parsed.nom)
    })

    return () => {
      isMounted = false
    }
  }, [authInitializing, authStatus, navigate, returnPath, user])

  if (authInitializing) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FAF6F2] p-6">
        <div className="w-full max-w-[360px] rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-sm font-semibold text-[#1E1E1E]">Verification de la session</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#FAF6F2]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#F06B21]" />
          </div>
        </div>
      </div>
    )
  }

  if (authStatus === 'signed-out') return <Navigate to="/login" replace state={{ from: returnPath }} />

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    const cleanPrenom = prenom.trim()
    const cleanNom = nom.trim()
    const cleanEmail = email.trim()
    if (!cleanPrenom || !cleanNom || !cleanEmail) {
      setError('Nom, prenom et email sont requis.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitTeamProfileForCurrentUser({
        email: cleanEmail,
        nom: cleanNom,
        prenom: cleanPrenom,
        requestedTeamType,
        sourceConnexion: sourceConnexionFromProvider(providerId),
      })
      navigate('/profile-pending', { replace: true })
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] p-4 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-5xl items-center">
        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-stretch">
          <section className="hidden rounded-[24px] bg-[#1E1E1E] p-7 text-white lg:flex lg:flex-col">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#F06B21] text-white">
                <Building2 size={25} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold">Sosson</p>
                <p className="text-xs text-[#A3A3A3]">Accueil profil interne</p>
              </div>
            </div>
            <div className="mt-auto max-w-md">
              <p className="text-[40px] font-semibold leading-[1.02]">Profil a classer par l'equipe.</p>
              <p className="mt-4 text-sm leading-6 text-[#C9C9C9]">
                La demande rejoint la page Equipe. Un gerant la convertit ensuite en fiche active avec poste, role et equipe finale.
              </p>
            </div>
            <div className="mt-8 grid gap-3 rounded-[20px] border border-[#2A2A2A] bg-[#242424] p-4 text-sm">
              {['Connexion Firebase validee', 'Demande bornee a votre compte', 'Aucun droit admin auto-attribue'].map(item => (
                <div key={item} className="flex items-center gap-2 text-[#E5E5E5]">
                  <Check className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#F2E8DC] bg-white p-6 shadow-[0_24px_80px_rgba(30,30,30,0.08)] sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#FDEBDD] text-[#F06B21]">
                <UserRound className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#F06B21]">Premiere connexion</p>
                <h1 className="mt-1 text-[26px] font-semibold leading-tight text-[#1E1E1E]">Completer le profil</h1>
                <p className="mt-2 text-sm leading-5 text-[#6B6B6B]">Ces informations alimentent la reception des profils dans Equipe.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#3C3C3C]">Email</span>
                <input value={email} readOnly className="h-11 w-full rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] px-4 text-sm text-[#6B6B6B] outline-none" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[#3C3C3C]">Prenom</span>
                  <input value={prenom} onChange={event => setPrenom(event.target.value)} className="h-11 w-full rounded-[14px] border border-[#F2E8DC] px-4 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21] focus:ring-2 focus:ring-[#F06B21]/20" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[#3C3C3C]">Nom</span>
                  <input value={nom} onChange={event => setNom(event.target.value)} className="h-11 w-full rounded-[14px] border border-[#F2E8DC] px-4 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21] focus:ring-2 focus:ring-[#F06B21]/20" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#3C3C3C]">Equipe demandee</span>
                <select value={requestedTeamType} onChange={event => setRequestedTeamType(event.target.value as RequestedTeamType)} className="h-11 w-full rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21] focus:ring-2 focus:ring-[#F06B21]/20">
                  {requestedTeamTypes.map(type => (
                    <option key={type} value={type}>{requestedTeamTypeLabels[type]}</option>
                  ))}
                </select>
              </label>

              {error && (
                <div className="rounded-[14px] border border-[#FCA5A5] bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#DC2626]">
                  {error}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17] disabled:cursor-wait disabled:bg-[#D99A72]">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                {isSubmitting ? 'Envoi du profil' : 'Envoyer le profil'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
