import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { factures as initialFactures } from '@/data/factures'
import type { Facture } from '@/data/factures'
import { chantiers as initialChantiers } from '@/data/chantiers'
import type { Chantier } from '@/data/chantiers'
import { clients } from '@/data/clients'
import { emails } from '@/data/emails'
import { getCurrentUser } from '@/lib/auth'
import type { User } from '@/data/users'

interface AppState {
  user: User | null
  chantiers: Chantier[]
  factures: Facture[]
  setUser: (u: User | null) => void
  addFacture: (f: Facture) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser())
  const [chantiersList, setChantiersList] = useState<Chantier[]>(initialChantiers)
  const [facturesList, setFacturesList] = useState<Facture[]>(initialFactures)

  function addFacture(f: Facture) {
    setFacturesList(prev => [f, ...prev])
    setChantiersList(prev =>
      prev.map(c => {
        if (c.id === f.chantierId) {
          return {
            ...c,
            depensesEngagees: c.depensesEngagees + f.montantTTC,
            factureIds: [f.id, ...c.factureIds],
            tendance:
              c.depensesEngagees + f.montantTTC > c.budgetPrevisionnel * 1.05
                ? 'rouge'
                : c.depensesEngagees + f.montantTTC > c.budgetPrevisionnel * 0.9
                ? 'orange'
                : 'vert',
          }
        }
        return c
      })
    )
  }

  return (
    <AppContext.Provider
      value={{ user, chantiers: chantiersList, factures: facturesList, setUser, addFacture }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export { clients, emails }
