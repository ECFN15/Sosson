import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, FileText, HardHat, Mail, Plus, ReceiptText, Search, Users } from 'lucide-react'
import { useApp } from '@/lib/store'
import { emails } from '@/data/emails'

type SearchResult = {
  label: string
  meta: string
  route: string
  Icon: typeof HardHat
}

export function Topbar() {
  const navigate = useNavigate()
  const { chantiers, clients, factures } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
        inputRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setIsCreateOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const quickResults = useMemo<SearchResult[]>(() => [
    { label: 'Factures à traiter', meta: `${factures.filter(item => item.statut === 'en_attente').length} en attente`, route: '/factures', Icon: ReceiptText },
    { label: 'Planning de la semaine', meta: 'Equipes et alertes chantier', route: '/planning', Icon: CalendarDays },
    { label: 'Boîte email prioritaire', meta: `${emails.filter(item => !item.lu).length} non lus`, route: '/emails', Icon: Mail },
    { label: 'Tous les chantiers', meta: `${chantiers.length} dossiers`, route: '/chantiers', Icon: HardHat },
  ], [chantiers.length, factures])

  const searchResults = useMemo<SearchResult[]>(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return quickResults

    const results: SearchResult[] = []
    chantiers.forEach(chantier => {
      if ([chantier.nom, chantier.adresse, chantier.chefChantier].join(' ').toLowerCase().includes(normalized)) {
        results.push({ label: chantier.nom, meta: `Chantier - ${chantier.statut.replace('_', ' ')}`, route: `/chantiers/${chantier.id}`, Icon: HardHat })
      }
    })
    clients.forEach(client => {
      if ([client.nom, client.email, client.ville].join(' ').toLowerCase().includes(normalized)) {
        results.push({ label: client.nom, meta: `Client - ${client.ville}`, route: `/clients/${client.id}`, Icon: Users })
      }
    })
    factures.forEach(facture => {
      if ([facture.fournisseur, facture.numeroFacture, facture.description].join(' ').toLowerCase().includes(normalized)) {
        results.push({ label: facture.numeroFacture, meta: `Facture - ${facture.fournisseur}`, route: '/factures', Icon: FileText })
      }
    })
    emails.forEach(email => {
      if ([email.sujet, email.expediteur, email.extrait].join(' ').toLowerCase().includes(normalized)) {
        results.push({ label: email.sujet, meta: `Email - ${email.expediteur.split('<')[0].trim()}`, route: '/emails', Icon: Mail })
      }
    })

    return results.slice(0, 7)
  }, [chantiers, clients, factures, query, quickResults])

  function goTo(route: string) {
    navigate(route)
    setQuery('')
    setIsSearchOpen(false)
    setIsCreateOpen(false)
    inputRef.current?.blur()
  }

  return (
    <header className="h-16 shrink-0 border-b border-[#F2E8DC] bg-white px-6">
      <div className="flex h-full items-center justify-between gap-6">
        <div className="w-[140px]" aria-hidden="true" />

        <div className="flex flex-1 justify-center">
          <div className="relative w-[460px] max-w-full">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={event => {
                setQuery(event.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Rechercher (Cmd + K)"
              className="w-full rounded-full border border-[#F2E8DC] bg-[#FAF6F2] py-2 pl-10 pr-4 text-sm text-[#1E1E1E] transition placeholder:text-[#9CA3AF] focus:border-[#F06B21] focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
              aria-label="Recherche globale"
            />

            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-[18px] border border-[#F2E8DC] bg-white p-2 shadow-[0_18px_44px_rgba(30,30,30,0.12)]">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6B6B6B]">
                  {query.trim() ? 'Résultats' : 'Accès rapide'}
                </div>
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map(result => {
                      const Icon = result.Icon
                      return (
                        <button
                          key={`${result.route}-${result.label}`}
                          type="button"
                          onMouseDown={event => event.preventDefault()}
                          onClick={() => goTo(result.route)}
                          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left transition hover:bg-[#FAF6F2]"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#FDEBDD] text-[#F06B21]">
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold text-[#1E1E1E]">{result.label}</span>
                            <span className="block truncate text-[11px] text-[#6B6B6B]">{result.meta}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-8 text-center text-sm text-[#6B6B6B]">Aucun résultat trouvé.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => goTo('/emails')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#6B6B6B] transition-colors hover:bg-[#FAF6F2] hover:text-[#1E1E1E]"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F06B21] px-1 text-[9px] font-bold text-white">
              3
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCreateOpen(value => !value)}
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#1E1E1E] px-4 py-2 text-sm font-medium text-white transition hover:bg-black active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Nouveau
            </button>
            {isCreateOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-[16px] border border-[#F2E8DC] bg-white p-2 shadow-[0_18px_44px_rgba(30,30,30,0.12)]">
                {[
                  { label: 'Facture fournisseur', route: '/factures', Icon: ReceiptText },
                  { label: 'Chantier', route: '/chantiers', Icon: HardHat },
                  { label: 'Client', route: '/clients', Icon: Users },
                  { label: 'Événement planning', route: '/planning', Icon: CalendarDays },
                ].map(item => {
                  const Icon = item.Icon
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => goTo(item.route)}
                      className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]"
                    >
                      <Icon className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
