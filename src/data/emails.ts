export interface Email {
  id: string
  chantierId: string
  clientId: string
  expediteur: string
  destinataire: string
  sujet: string
  extrait: string
  date: string
  lu: boolean
  priorite: 'haute' | 'normale' | 'faible'
  tag: 'client' | 'fournisseur' | 'interne' | 'devis' | 'facture'
}

export const emails: Email[] = [
  {
    id: 'email-1',
    chantierId: 'chantier-1',
    clientId: 'client-1',
    expediteur: 'martin.dupont@gmail.com',
    destinataire: 'contact@sosson.fr',
    sujet: 'Avancement salle de bain - inquiétude délai',
    extrait: 'Bonjour, je voulais vous contacter car nous sommes maintenant à fin avril et le chantier devait se terminer fin avril. Est-ce que vous pouvez me donner une date précise de fin ? Ma femme commence à s\'impatienter...',
    date: '2026-04-18T09:23:00',
    lu: false,
    priorite: 'haute',
    tag: 'client',
  },
  {
    id: 'email-2',
    chantierId: 'chantier-1',
    clientId: 'client-1',
    expediteur: 'martin.dupont@gmail.com',
    destinataire: 'contact@sosson.fr',
    sujet: 'Re: Choix carrelage - confirmation',
    extrait: 'Bonjour, suite à notre rendez-vous de la semaine dernière, nous confirmons notre choix pour le carrelage grès cérame référence GC-4503 en 60x60. Pouvez-vous confirmer la commande ?',
    date: '2026-02-12T14:15:00',
    lu: true,
    priorite: 'normale',
    tag: 'client',
  },
]
