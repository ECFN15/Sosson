import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Building2, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useApp } from '@/lib/store'
import { waitForFirebaseUser } from '@/lib/firebaseAuthState'
import { logout } from '@/lib/auth'
import {
  fetchCurrentTeamProfileSubmission,
  labelRequestedTeamType,
} from '@/features/auth/teamProfileSubmission'
import type { TeamProfileSubmission } from '@/features/auth/teamProfileSubmission'

export function ProfilePendingPage() {
  const { authInitializing, authStatus, user } = useApp()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState<TeamProfileSubmission | null>(null)
  const [message, setMessage] = useState('Lecture de la demande SQL en cours.')

  useEffect(() => {
    if (authInitializing || authStatus === 'ready' || authStatus === 'signed-out') return

    let mounted = true

    async function loadSubmission() {
      const fbUser = await waitForFirebaseUser(2500)
      if (!fbUser) {
        navigate('/login', { replace: true })
        return
      }

      try {
        const current = await fetchCurrentTeamProfileSubmission()
        if (!mounted) return
        setSubmission(current)
        setMessage(
          current
            ? 'Demande recue dans SQL Connect. Elle attend une conversion par le gerant.'
            : 'Session Firebase validee, mais aucune demande SQL lisible pour ce compte.',
        )
      } catch (error) {
        if (!mounted) return
        setMessage(`Demande SQL indisponible: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    void loadSubmission()

    return () => {
      mounted = false
    }
  }, [authInitializing, authStatus, navigate])

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

  if (authStatus === 'signed-out') return <Navigate to="/login" replace />
  if (authStatus === 'ready' && user) return <Navigate to="/dashboard" replace />

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] p-4 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-4xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[24px] border border-[#F2E8DC] bg-white shadow-[0_24px_80px_rgba(30,30,30,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="p-6 sm:p-8">
              <div className="mb-7 flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#FDEBDD] text-[#F06B21]">
                  <UserRound className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#F06B21]">
                    Profil en attente
                  </p>
                  <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#1E1E1E]">
                    Votre acces doit etre classe
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B6B6B]">
                    Une connexion Firebase ne suffit pas a ouvrir Sosson. Un gerant doit convertir cette demande en profil applicatif SQL actif.
                  </p>
                </div>
              </div>

              <div className="rounded-[20px] border border-[#F2E8DC] bg-[#FAF6F2] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F06B21]" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-semibold text-[#1E1E1E]">{message}</p>
                    <p className="mt-1 text-sm leading-5 text-[#6B6B6B]">
                      Cette page ne cree aucun role et ne remplace pas le provisioning par l'equipe.
                    </p>
                  </div>
                </div>
              </div>

              {submission && (
                <div className="mt-5 grid gap-3 rounded-[20px] border border-[#F2E8DC] bg-white p-5 text-sm">
                  <InfoRow label="Nom" value={`${submission.prenom} ${submission.nom}`} />
                  <InfoRow label="Email" value={submission.email} />
                  <InfoRow label="Equipe demandee" value={labelRequestedTeamType(submission.requestedTeamType)} />
                  <InfoRow label="Statut" value={submission.status === 'pending' ? 'A classer' : submission.status} />
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-semibold text-[#1E1E1E] transition hover:bg-[#FAF6F2]"
              >
                <LogOut className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                Se deconnecter
              </button>
            </div>

            <aside className="hidden bg-[#1E1E1E] p-7 text-white lg:flex lg:flex-col">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#F06B21] text-white">
                  <Building2 size={25} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Sosson</p>
                  <p className="text-xs text-[#A3A3A3]">Hub interne chantier</p>
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-[34px] font-semibold leading-[1.02]">Aucun droit sans profil SQL.</p>
                <p className="mt-4 text-sm leading-6 text-[#C9C9C9]">
                  La demande reste dans la file Equipe jusqu'a validation par un gerant.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">{label}</span>
      <span className="min-w-0 truncate font-medium text-[#1E1E1E]">{value}</span>
    </div>
  )
}
