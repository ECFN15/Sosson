import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, User, Landmark, ArrowRight, X, Check } from 'lucide-react'
import { clients as initialClients } from '@/data/clients'
import type { Client } from '@/data/clients'
import { useApp } from '@/lib/store'
import { getChantierCover } from '@/data/media'

const typeIcon = { particulier: User, professionnel: Building2, public: Landmark }
const typeLabel = { particulier: 'Particulier', professionnel: 'Professionnel', public: 'Collectivité' }
const typeColor = {
  particulier: 'bg-blue-100 text-blue-700',
  professionnel: 'bg-purple-100 text-purple-700',
  public: 'bg-emerald-100 text-emerald-700',
}

export function ClientsPage() {
  const { chantiers, user } = useApp()
  const navigate = useNavigate()
  const [clientsList, setClientsList] = useState<Client[]>(initialClients)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    nom: '', type: 'particulier' as Client['type'],
    email: '', telephone: '', adresse: '', ville: '', codePostal: '',
  })
  const [saved, setSaved] = useState(false)

  const canCreate = user?.role === 'gerant' || user?.role === 'assistante'

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const newClient: Client = {
      id: `client-new-${Date.now()}`,
      ...form,
      dateCreation: new Date().toISOString().split('T')[0],
      chantierIds: [],
    }
    setClientsList(prev => [...prev, newClient])
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowModal(false) }, 1200)
    setForm({ nom: '', type: 'particulier', email: '', telephone: '', adresse: '', ville: '', codePostal: '' })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">{clientsList.length} clients</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Nouveau client
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clientsList.map(client => {
          const Icon = typeIcon[client.type]
          const clientChantiers = chantiers.filter(c => c.clientId === client.id)
          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-20 overflow-hidden rounded-[12px] border border-[#F2E8DC] bg-[#FAF6F2]">
                    {clientChantiers[0] ? (
                      <img
                        src={getChantierCover(clientChantiers[0].id)}
                        alt={`Aperçu chantier ${client.nom}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon size={20} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {client.nom}
                      </h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${typeColor[client.type]}`}>
                        {typeLabel[client.type]}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">{client.email}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{client.telephone} · {client.ville}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-700">{clientChantiers.length}</div>
                    <div className="text-xs text-slate-400">chantier(s)</div>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Nouveau client</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nom / Raison sociale *</label>
                  <input required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                  <div className="flex gap-2">
                    {(['particulier', 'professionnel', 'public'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${form.type === t ? 'bg-orange-500 text-white border-orange-500' : 'border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                        {typeLabel[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Téléphone</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Adresse</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Ville</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Code postal</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.codePostal} onChange={e => setForm(f => ({ ...f, codePostal: e.target.value }))} />
                </div>
              </div>
              <button type="submit"
                className={`w-full font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                {saved ? <><Check size={16} /> Client créé !</> : 'Créer le client'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
