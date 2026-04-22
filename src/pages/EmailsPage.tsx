import { emails, clients } from '@/lib/store'
import { useApp } from '@/lib/store'
import { Mail, AlertCircle } from 'lucide-react'

const tagColor: Record<string, string> = {
  client: 'bg-blue-100 text-blue-700',
  fournisseur: 'bg-purple-100 text-purple-700',
  interne: 'bg-slate-100 text-slate-600',
  devis: 'bg-amber-100 text-amber-700',
  facture: 'bg-emerald-100 text-emerald-700',
}

export function EmailsPage() {
  const { chantiers } = useApp()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Emails</h1>
        <p className="text-slate-500 text-sm mt-1">{emails.length} emails rattachés</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {emails.map(e => {
            const chantier = chantiers.find(c => c.id === e.chantierId)
            const client = clients.find(c => c.id === e.clientId)
            return (
              <div key={e.id} className={`px-6 py-5 hover:bg-slate-50/50 transition-colors ${!e.lu ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {!e.lu
                      ? <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      : <Mail size={16} className="text-slate-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className={`font-semibold text-sm ${!e.lu ? 'text-slate-900' : 'text-slate-700'}`}>
                        {e.sujet}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor[e.tag]}`}>
                        {e.tag}
                      </span>
                      {e.priorite === 'haute' && (
                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                          <AlertCircle size={10} /> Urgent
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      De : {e.expediteur} · {new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{e.extrait}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400">Rattaché à :</span>
                      <span className="text-xs font-medium text-orange-600">{chantier?.nom}</span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{client?.nom}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
