import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, User, Landmark, ArrowRight, X, Check, Search, Database } from 'lucide-react'
import type { Client } from '@/data/clients'
import { useApp } from '@/lib/store'
import { getChantierCover } from '@/data/media'
import { previsionnelLines } from '@/data/previsionnel'
import { euro } from '@/lib/previsionnelAnalytics'

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
  const [portfolioQuery, setPortfolioQuery] = useState('')
  const [form, setForm] = useState({
    nom: '', type: 'particulier' as Client['type'],
    email: '', telephone: '', adresse: '', ville: '', codePostal: '',
  })
  const [saved, setSaved] = useState(false)

  const canCreate = user?.role === 'gerant' || user?.role === 'assistante'
  const completeExcelPortfolio = Object.values(
    previsionnelLines.reduce<Record<string, {
      clientKey: string
      name: string
      aliases: Set<string>
      lineTypes: Set<string>
      exercises: Set<string>
      totalPrevision: number
      totalContrat: number
      totalPlanned: number
      totalRealized: number
      chantierCount: number
      sourceCount: number
      lastExercise: string
    }>>((acc, line) => {
      const item = acc[line.clientKey] ?? {
        clientKey: line.clientKey,
        name: line.clientName,
        aliases: new Set<string>(),
        lineTypes: new Set<string>(),
        exercises: new Set<string>(),
        totalPrevision: 0,
        totalContrat: 0,
        totalPlanned: 0,
        totalRealized: 0,
        chantierCount: 0,
        sourceCount: 0,
        lastExercise: line.exercise,
      }
      item.aliases.add(line.rawName)
      item.lineTypes.add(line.lineType)
      item.exercises.add(line.exercise)
      item.totalPrevision += line.caPrevision
      item.totalContrat += line.caContrat
      item.totalPlanned += line.plannedTotal
      item.totalRealized += line.realizedTotal
      item.sourceCount += 1
      if (line.lineType === 'chantier') item.chantierCount += 1
      if (line.exercise > item.lastExercise) item.lastExercise = line.exercise
      acc[line.clientKey] = item
      return acc
    }, {}),
  )
    .map(item => ({
      ...item,
      aliases: Array.from(item.aliases).sort(),
      lineTypes: Array.from(item.lineTypes).sort(),
      exercises: Array.from(item.exercises).sort(),
    }))
    .sort((a, b) => (b.totalPrevision + b.totalPlanned + b.totalContrat) - (a.totalPrevision + a.totalPlanned + a.totalContrat))

  const historicalClients = completeExcelPortfolio
    .filter(client => {
      const query = portfolioQuery.trim().toLowerCase()
      if (!query) return true
      return [client.name, ...client.aliases].some(value => value.toLowerCase().includes(query))
    })
    .slice(0, 80)

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

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Base active</p>
          <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">{clients.length}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Clients dans le store applicatif</p>
        </div>
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Base Excel</p>
            <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">{completeExcelPortfolio.length}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Noms source rapprochés, toutes lignes Excel</p>
        </div>
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Historique</p>
          <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">
            {previsionnelLines.length.toLocaleString('fr-FR')}
          </p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Lignes source prévisionnel importées</p>
        </div>
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

      <div className="mt-8 overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#F2E8DC] p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#F06B21]" />
              <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Base client historique Excel</h2>
            </div>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">
              Les noms de chantier du prévisionnel sont rapprochés en clients, avec alias et exercices conservés.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={portfolioQuery}
              onChange={event => setPortfolioQuery(event.target.value)}
              placeholder="Rechercher dans l'historique"
              className="h-10 w-[280px] rounded-[14px] border border-[#F2E8DC] bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#F06B21]/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-[13px]">
            <thead className="bg-[#FAF6F2] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B6B6B]">
              <tr>
                <th className="px-5 py-3">Client rapproché</th>
                <th className="px-5 py-3">Alias Excel</th>
              <th className="px-5 py-3">Lignes / chantiers</th>
              <th className="px-5 py-3">Types</th>
                <th className="px-5 py-3">Exercices</th>
                <th className="px-5 py-3">CA prévision</th>
                <th className="px-5 py-3">Contrat</th>
                <th className="px-5 py-3">Dernier exercice</th>
              </tr>
            </thead>
            <tbody>
              {historicalClients.map(client => (
                <tr key={client.clientKey} className="border-t border-[#F2E8DC]">
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{client.name}</td>
                  <td className="px-5 py-3 text-[#6B6B6B]">{client.aliases.slice(0, 3).join(' / ')}</td>
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{client.sourceCount} / {client.chantierCount}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.lineTypes.join(', ')}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.exercises.length}</td>
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{euro(client.totalPrevision || client.totalPlanned)}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.totalContrat ? euro(client.totalContrat) : '—'}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[#FDEBDD] px-2.5 py-1 text-[11px] font-semibold text-[#F06B21]">
                      {client.lastExercise}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
