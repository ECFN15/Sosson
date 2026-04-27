import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, User, Landmark, ArrowRight, X, Check } from 'lucide-react'
import type { Client } from '@/data/clients'
import { useApp } from '@/lib/store'
import { getChantierCover } from '@/data/media'

const typeIcon = { particulier: User, professionnel: Building2, public: Landmark }
const typeLabel = { particulier: 'Particulier', professionnel: 'Professionnel', public: 'Collectivité' }
const typeColor = {
  particulier: 'bg-[#FDEBDD] text-[#F06B21]',
  professionnel: 'bg-[#F1E6D6] text-[#A45A2C]',
  public: 'bg-[#E6F4EA] text-[#1E8E3E]',
}

export function ClientsPage() {
  const { chantiers, user, clients, addClient } = useApp()
  const navigate = useNavigate()
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
    addClient(newClient)
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowModal(false) }, 1200)
    setForm({ nom: '', type: 'particulier', email: '', telephone: '', adresse: '', ville: '', codePostal: '' })
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Clients</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">{clients.length} clients</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D95B17]"
          >
            <Plus size={16} /> Nouveau client
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clients.map(client => {
          const Icon = typeIcon[client.type]
          const clientChantiers = chantiers.filter(c => c.clientId === client.id)
          return (
            <div
              key={client.id}
              className="group cursor-pointer rounded-[20px] border border-[#F2E8DC] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#EADBC8] hover:bg-[#FFF9F4]"
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
                        <Icon size={20} className="text-[#6B6B6B]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1E1E1E] transition-colors group-hover:text-[#F06B21]">
                        {client.nom}
                      </h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${typeColor[client.type]}`}>
                        {typeLabel[client.type]}
                      </span>
                    </div>
                    <div className="text-sm text-[#6B6B6B]">{client.email}</div>
                    <div className="mt-0.5 text-xs text-[#9CA3AF]">{client.telephone} · {client.ville}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#3C3C3C]">{clientChantiers.length}</div>
                    <div className="text-xs text-[#9CA3AF]">chantier(s)</div>
                  </div>
                  <ArrowRight size={18} className="text-[#9CA3AF] transition-colors group-hover:text-[#F06B21]" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-6 py-5">
              <h2 className="font-semibold text-[#1E1E1E]">Nouveau client</h2>
              <button onClick={() => setShowModal(false)} className="text-[#9CA3AF] hover:text-[#1E1E1E]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Nom / Raison sociale *</label>
                  <input required className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Type</label>
                  <div className="flex gap-2">
                    {(['particulier', 'professionnel', 'public'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-all ${form.type === t ? 'border-[#F06B21] bg-[#F06B21] text-white' : 'border-[#F2E8DC] text-[#6B6B6B] hover:border-[#EADBC8]'}`}>
                        {typeLabel[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Email</label>
                  <input type="email" className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Téléphone</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Adresse</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Ville</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Code postal</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.codePostal} onChange={e => setForm(f => ({ ...f, codePostal: e.target.value }))} />
                </div>
              </div>
              <button type="submit"
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${saved ? 'bg-[#1E8E3E] text-white' : 'bg-[#F06B21] text-white hover:bg-[#D95B17]'}`}>
                {saved ? <><Check size={16} /> Client créé !</> : 'Créer le client'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
