import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  ArrowLeft, Upload, CheckCircle, Clock, XCircle,
  MapPin, Calendar, User, Euro, FileText, Mail, AlertTriangle,
  Sparkles, Check, X
} from 'lucide-react'
import { useApp, clients, emails } from '@/lib/store'
import { categorieLabels, categorieColors } from '@/data/factures'
import type { CategorieDepense, Facture } from '@/data/factures'

const CATEGORIES = Object.entries(categorieLabels) as [CategorieDepense, string][]

const EXTRACTION_RESULT = {
  fournisseur: 'Matériaux Rhône',
  numeroFacture: 'MR-2026-0287',
  montantHT: 706.0,
  tva: 20,
  montantTTC: 847.2,
  date: new Date().toISOString().split('T')[0],
  categorie: 'bois_materiaux' as CategorieDepense,
  description: 'Bois de charpente sapin 63m², vis tirefond inox, chevrons 63x75',
  confidence: 94,
}

type UploadStep = 'idle' | 'uploading' | 'analyzing' | 'result' | 'done'

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    validee: { label: 'Validée', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
    en_attente: { label: 'En attente', cls: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
    rejetee: { label: 'Rejetée', cls: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
  }
  const s = map[statut] ?? map['en_attente']
  return (
    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  )
}

export function ChantierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { chantiers, factures, addFacture, user } = useApp()
  const navigate = useNavigate()

  const chantier = chantiers.find(c => c.id === id)
  const client = clients.find(c => c.id === chantier?.clientId)
  const chantierFactures = factures.filter(f => f.chantierId === id)
  const chantierEmails = emails.filter(e => e.chantierId === id)

  const [uploadStep, setUploadStep] = useState<UploadStep>('idle')
  const [extracted, setExtracted] = useState({ ...EXTRACTION_RESULT })
  const [fileName, setFileName] = useState('')
  const canUpload = user?.role === 'gerant' || user?.role === 'assistante'

  const onDrop = useCallback((files: File[]) => {
    if (!files[0]) return
    setFileName(files[0].name)
    setUploadStep('uploading')
    setTimeout(() => setUploadStep('analyzing'), 1200)
    setTimeout(() => setUploadStep('result'), 3000)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    disabled: !canUpload || uploadStep !== 'idle',
  })

  function handleValidate() {
    const newFacture: Facture = {
      id: `facture-new-${Date.now()}`,
      chantierId: id!,
      fournisseur: extracted.fournisseur,
      montantHT: extracted.montantHT,
      tva: extracted.tva,
      montantTTC: extracted.montantTTC,
      date: extracted.date,
      categorie: extracted.categorie,
      statut: 'validee',
      numeroFacture: extracted.numeroFacture,
      description: extracted.description,
    }
    addFacture(newFacture)
    setUploadStep('done')
    setTimeout(() => setUploadStep('idle'), 2000)
  }

  function handleCancel() {
    setUploadStep('idle')
    setFileName('')
    setExtracted({ ...EXTRACTION_RESULT })
  }

  if (!chantier) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Chantier introuvable.</p>
        <button onClick={() => navigate('/chantiers')} className="mt-4 text-orange-500 hover:underline text-sm">
          Retour à la liste
        </button>
      </div>
    )
  }

  const pct = Math.round((chantier.depensesEngagees / chantier.budgetPrevisionnel) * 100)
  const marge = chantier.budgetPrevisionnel - chantier.depensesEngagees

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/chantiers')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour aux chantiers
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{chantier.nom}</h1>
            {chantier.tendance === 'rouge' && (
              <span className="flex items-center gap-1 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">
                <AlertTriangle size={14} /> Dérive budget
              </span>
            )}
            {chantier.tendance === 'orange' && (
              <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-medium">
                ~ À surveiller
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><User size={14} /> {client?.nom}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {chantier.adresse}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> Fin prévue : {new Date(chantier.dateFinPrevue).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {user?.role === 'gerant' && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="text-xs text-slate-400 mb-1">Budget prévisionnel</div>
            <div className="text-xl font-bold text-slate-900">{chantier.budgetPrevisionnel.toLocaleString('fr-FR')} €</div>
          </div>
          <div className={`rounded-2xl p-5 border shadow-sm ${chantier.tendance === 'rouge' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
            <div className="text-xs text-slate-400 mb-1">Dépenses engagées</div>
            <div className={`text-xl font-bold ${chantier.tendance === 'rouge' ? 'text-red-600' : 'text-slate-900'}`}>
              {chantier.depensesEngagees.toLocaleString('fr-FR')} €
            </div>
            <div className="text-xs text-slate-400 mt-1">{pct}% du budget</div>
          </div>
          <div className={`rounded-2xl p-5 border shadow-sm ${marge < 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="text-xs text-slate-400 mb-1">Marge restante</div>
            <div className={`text-xl font-bold flex items-center gap-1 ${marge < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              <Euro size={16} />{Math.abs(marge).toLocaleString('fr-FR')} €
              {marge < 0 && <span className="text-sm font-normal">(dépassé)</span>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {canUpload && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Upload size={16} className="text-orange-500" />
                  Ajouter une facture fournisseur
                </h2>
              </div>
              <div className="p-6">
                {uploadStep === 'idle' && (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload size={32} className={`mx-auto mb-3 ${isDragActive ? 'text-orange-500' : 'text-slate-300'}`} />
                    <p className="text-sm font-medium text-slate-600">
                      {isDragActive ? 'Déposez le fichier ici...' : 'Glissez un PDF ou une photo de facture'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">ou cliquez pour sélectionner</p>
                  </div>
                )}

                {uploadStep === 'uploading' && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-700">Upload en cours...</p>
                    <p className="text-xs text-slate-400 mt-1">{fileName}</p>
                  </div>
                )}

                {uploadStep === 'analyzing' && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={24} className="text-orange-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Analyse IA en cours...</p>
                    <p className="text-xs text-slate-400 mt-1">Extraction des données de la facture</p>
                    <div className="mt-4 max-w-xs mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 bg-orange-500 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '70%' }} />
                    </div>
                  </div>
                )}

                {uploadStep === 'result' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Sparkles size={13} className="text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Extraction terminée</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {extracted.confidence}% confiance
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Fournisseur</label>
                        <input
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          value={extracted.fournisseur}
                          onChange={e => setExtracted(x => ({ ...x, fournisseur: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">N° facture</label>
                        <input
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          value={extracted.numeroFacture}
                          onChange={e => setExtracted(x => ({ ...x, numeroFacture: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Montant HT (€)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          value={extracted.montantHT}
                          onChange={e => setExtracted(x => ({ ...x, montantHT: parseFloat(e.target.value) || 0, montantTTC: (parseFloat(e.target.value) || 0) * (1 + x.tva / 100) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">TVA (%)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          value={extracted.tva}
                          onChange={e => setExtracted(x => ({ ...x, tva: parseInt(e.target.value) || 0, montantTTC: x.montantHT * (1 + (parseInt(e.target.value) || 0) / 100) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Montant TTC (€)</label>
                        <input
                          readOnly
                          className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm font-semibold text-slate-700"
                          value={extracted.montantTTC.toFixed(2)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          value={extracted.date}
                          onChange={e => setExtracted(x => ({ ...x, date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setExtracted(x => ({ ...x, categorie: key }))}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                              extracted.categorie === key
                                ? 'text-white border-transparent'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                            style={extracted.categorie === key ? { backgroundColor: categorieColors[key], borderColor: categorieColors[key] } : {}}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleValidate}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={16} /> Valider et rattacher au chantier
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {uploadStep === 'done' && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={24} className="text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Facture validée !</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {extracted.montantTTC.toLocaleString('fr-FR')} € ajoutés aux dépenses du chantier
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                Factures fournisseurs ({chantierFactures.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {chantierFactures.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">
                  Aucune facture pour ce chantier
                </div>
              ) : (
                chantierFactures.map(f => (
                  <div key={f.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: categorieColors[f.categorie] }}
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{f.fournisseur}</div>
                        <div className="text-xs text-slate-400">
                          {f.numeroFacture} — {categorieLabels[f.categorie]} — {new Date(f.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatutBadge statut={f.statut} />
                      <div className="text-sm font-semibold text-slate-800 text-right min-w-[90px]">
                        {f.montantTTC.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Informations client</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-400">Nom</div>
                <div className="text-sm font-medium text-slate-800">{client?.nom}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Email</div>
                <div className="text-sm text-slate-700">{client?.email}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Téléphone</div>
                <div className="text-sm text-slate-700">{client?.telephone}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Adresse</div>
                <div className="text-sm text-slate-700">{client?.adresse}, {client?.codePostal} {client?.ville}</div>
              </div>
            </div>
          </div>

          {chantierEmails.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-50">
                <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  Emails rattachés
                </h2>
              </div>
              <div className="divide-y divide-slate-50">
                {chantierEmails.map(e => (
                  <div key={e.id} className={`px-5 py-4 ${!e.lu ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex items-start gap-2 mb-1">
                      {!e.lu && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                      <div className="text-sm font-medium text-slate-800 flex-1">{e.sujet}</div>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      {e.expediteur} — {new Date(e.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-2">{e.extrait}</div>
                    {e.priorite === 'haute' && (
                      <span className="mt-2 inline-block text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        Priorité haute
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Détails chantier</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-400">Chef de chantier</div>
                <div className="text-sm font-medium text-slate-800">{chantier.chefChantier}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Début</div>
                <div className="text-sm text-slate-700">{new Date(chantier.dateDebut).toLocaleDateString('fr-FR')}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Fin prévue</div>
                <div className="text-sm text-slate-700">{new Date(chantier.dateFinPrevue).toLocaleDateString('fr-FR')}</div>
              </div>
              {chantier.dateFin && (
                <div>
                  <div className="text-xs text-slate-400">Clôturé le</div>
                  <div className="text-sm text-emerald-600 font-medium">{new Date(chantier.dateFin).toLocaleDateString('fr-FR')}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-slate-400 mb-1">Avancement budget</div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${chantier.tendance === 'rouge' ? 'bg-red-500' : chantier.tendance === 'orange' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-1 text-right">{pct}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
