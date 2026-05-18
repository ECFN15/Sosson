import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CalendarDays, HardHat, ReceiptText, ShieldCheck } from 'lucide-react'
import { isLocalAuthFallbackEnabled, login } from '@/lib/auth'
import { useApp } from '@/lib/store'
import { users } from '@/data/users'
import { chantierImages } from '@/data/media'

const previewRows = [
  { label: 'Factures a traiter', value: '12', meta: '3 urgentes', Icon: ReceiptText },
  { label: 'Chantiers actifs', value: '4', meta: '2 a surveiller', Icon: HardHat },
  { label: 'Planning semaine', value: '21-27', meta: '5 equipes', Icon: CalendarDays },
]

const devAccessUser = users.find(user => user.role === 'gerant') ?? users[0]

export function LoginPage() {
  const { setUser } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const user = await login(email, password)
    if (user) {
      setUser(user)
      navigate('/dashboard')
    } else {
      setError('Email ou mot de passe incorrect')
    }
  }

  async function loginAsDev() {
    if (!isLocalAuthFallbackEnabled) {
      setError('Acces dev desactive sur cet environnement.')
      return
    }
    const user = await login(devAccessUser.email, 'demo')
    if (user) {
      setUser(user)
      navigate('/dashboard')
    } else {
      setError("Echec de l'acces dev")
    }
  }

  return (
    <div
      className="clean-saas-app relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1E1E1E] p-4 sm:p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(30,30,30,0.62), rgba(30,30,30,0.74)), url(${chantierImages[5]})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch">
        <section className="hidden min-h-[560px] rounded-[24px] border border-white/10 bg-[#1E1E1E] p-7 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#F06B21] text-white shadow-[0_8px_24px_rgba(240,107,33,0.32)]">
              <Building2 size={25} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold">Sosson</p>
              <p className="text-xs text-[#8A8A8A]">Hub operationnel chantiers</p>
            </div>
          </div>

          <div className="mt-auto">
            <p className="max-w-[13ch] text-[42px] font-semibold leading-[0.98] tracking-[-0.01em]">
              Piloter les dossiers sans perdre le fil.
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#C9C9C9]">
              Clients, chantiers, factures et planning restent visibles dans une interface unique, concue pour l'exploitation quotidienne.
            </p>
          </div>

          <div className="mt-8 rounded-[20px] border border-[#2A2A2A] bg-[#242424] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8A8A8A]">Apercu du jour</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2A1A0D] px-2.5 py-1 text-[11px] font-semibold text-[#F06B21]">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                Sandbox
              </span>
            </div>
            <div className="grid gap-3">
              {previewRows.map(item => {
                const Icon = item.Icon
                return (
                  <div key={item.label} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-[#2A2A2A] bg-[#1E1E1E] p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#FDEBDD] text-[#F06B21]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      <span className="block text-xs text-[#8A8A8A]">{item.meta}</span>
                    </span>
                    <strong className="text-lg font-semibold text-white">{item.value}</strong>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="w-full rounded-[24px] border border-[#F2E8DC] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#F06B21] text-white shadow-[0_8px_24px_rgba(240,107,33,0.32)]">
              <Building2 size={28} strokeWidth={1.75} />
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[#1E1E1E]">Sosson</h1>
            <p className="mt-1 text-sm text-[#6B6B6B]">Hub operationnel chantiers</p>
          </div>

          <div className="mb-6 hidden lg:block">
            <h1 className="text-[26px] font-semibold leading-tight text-[#1E1E1E]">Connexion</h1>
            <p className="mt-2 text-sm text-[#6B6B6B]">Accedez au tableau de bord Sosson.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3C3C3C]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                className="w-full rounded-[14px] border border-[#F2E8DC] px-4 py-3 text-sm text-[#1E1E1E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F06B21] focus:ring-2 focus:ring-[#F06B21]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3C3C3C]">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full rounded-[14px] border border-[#F2E8DC] px-4 py-3 text-sm text-[#1E1E1E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F06B21] focus:ring-2 focus:ring-[#F06B21]/20"
                required
              />
            </div>
            {error && (
              <div className="rounded-[14px] border border-[#FCA5A5] bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#DC2626]">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-[14px] bg-[#F06B21] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#D95B17] focus:outline-none focus:ring-2 focus:ring-[#F06B21]/25 focus:ring-offset-2 focus:ring-offset-white"
            >
              Se connecter
            </button>
          </form>

          {isLocalAuthFallbackEnabled && (
          <div className="mt-6 border-t border-[#F2E8DC] pt-6">
            <button
              type="button"
              onClick={() => void loginAsDev()}
              className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#F2E8DC] px-4 py-3 text-left transition-colors hover:border-[#EADBC8] hover:bg-[#FAF6F2] focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDEBDD] text-xs font-bold text-[#F06B21]">
                {devAccessUser.avatar}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#1E1E1E]">Acces dev complet</span>
                <span className="block truncate text-xs text-[#6B6B6B]">
                  {devAccessUser.prenom} {devAccessUser.nom} - role gerant
                </span>
              </span>
            </button>
          </div>
          )}
        </section>

        <p className="text-center text-xs font-medium text-[#C9C9C9] lg:col-span-2">
          {isLocalAuthFallbackEnabled ? 'Mode demonstration - donnees fictives' : 'Authentification Firebase active'}
        </p>
      </div>
    </div>
  )
}
