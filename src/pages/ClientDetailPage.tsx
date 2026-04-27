import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as THREE from 'three'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Euro,
  ExternalLink,
  FileText,
  Hammer,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  User,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { getChantierCover } from '@/data/media'
import { categorieLabels } from '@/data/factures'
import type { Chantier, StatutChantier, TendanceChantier } from '@/data/chantiers'
import type { Client } from '@/data/clients'

const typeLabel: Record<Client['type'], string> = {
  particulier: 'Particulier',
  professionnel: 'Professionnel',
  public: 'Collectivité',
}

const typeStyle: Record<Client['type'], string> = {
  particulier: 'bg-[#FDEBDD] text-[#F06B21]',
  professionnel: 'bg-[#F1E6D6] text-[#A45A2C]',
  public: 'bg-[#E6F4EA] text-[#1E8E3E]',
}

const chantierStatus: Record<StatutChantier, { label: string; className: string }> = {
  en_cours: { label: 'En cours', className: 'bg-[#FDEBDD] text-[#F06B21]' },
  en_attente: { label: 'En attente', className: 'bg-[#FAF6F2] text-[#6B6B6B]' },
  cloture: { label: 'Clôturé', className: 'bg-[#E6F4EA] text-[#1E8E3E]' },
}

const tendencyStatus: Record<TendanceChantier, { label: string; className: string }> = {
  vert: { label: 'Budget maîtrisé', className: 'bg-[#E6F4EA] text-[#1E8E3E]' },
  orange: { label: 'Surveillance', className: 'bg-[#FDEBDD] text-[#F06B21]' },
  rouge: { label: 'Risque marge', className: 'bg-[#FEE2E2] text-[#DC2626]' },
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatEuros(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} €`
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-[#F2E8DC] bg-white ${className}`}>{children}</section>
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  detail: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#6B6B6B]">{label}</p>
          <p className="mt-1 truncate text-[19px] font-semibold text-[#1E1E1E]">{value}</p>
          <p className="mt-1 text-[11px] text-[#6B6B6B]">{detail}</p>
        </div>
      </div>
    </Card>
  )
}

function ChantierScene3D({ chantier }: { chantier?: Chantier }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const mount = host

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(4.4, 3.1, 5.2)
    camera.lookAt(0, 0.75, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.touchAction = 'none'
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 1.2)
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(4, 6, 3)
    key.castShadow = true
    scene.add(ambient, key)

    const group = new THREE.Group()
    scene.add(group)

    const timber = new THREE.MeshStandardMaterial({ color: '#B8753D', roughness: 0.58, metalness: 0.05 })
    const dark = new THREE.MeshStandardMaterial({ color: '#1E1E1E', roughness: 0.68 })
    const orange = new THREE.MeshStandardMaterial({ color: '#F06B21', roughness: 0.5 })
    const sand = new THREE.MeshStandardMaterial({ color: '#F1E6D6', roughness: 0.72 })
    const glass = new THREE.MeshStandardMaterial({ color: '#FFF9F4', roughness: 0.42, transparent: true, opacity: 0.72 })
    const groundMaterial = new THREE.MeshStandardMaterial({ color: '#EADBC8', roughness: 0.9 })

    const ground = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.2, 0.12, 44), groundMaterial)
    ground.position.y = -0.12
    ground.receiveShadow = true
    group.add(ground)

    function box(width: number, height: number, depth: number, x: number, y: number, z: number, material: THREE.Material) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material)
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)
      return mesh
    }

    box(3.4, 0.18, 2.15, 0, 0.02, 0, dark)
    box(3.05, 0.08, 1.8, 0, 0.18, 0, sand)

    const postPositions = [
      [-1.45, 0.78, -0.82],
      [1.45, 0.78, -0.82],
      [-1.45, 0.78, 0.82],
      [1.45, 0.78, 0.82],
    ]
    postPositions.forEach(([x, y, z]) => box(0.12, 1.22, 0.12, x, y, z, timber))

    box(3.1, 0.12, 0.12, 0, 1.38, -0.82, timber)
    box(3.1, 0.12, 0.12, 0, 1.38, 0.82, timber)
    box(0.12, 0.12, 1.76, -1.45, 1.38, 0, timber)
    box(0.12, 0.12, 1.76, 1.45, 1.38, 0, timber)

    box(0.07, 1.02, 1.1, -0.45, 0.76, -0.84, glass)
    box(0.07, 0.88, 1.05, 0.72, 0.7, 0.84, glass)
    box(0.75, 0.84, 0.09, 1.1, 0.67, -0.84, orange)

    const roofA = box(3.6, 0.1, 1.24, 0, 1.68, -0.46, dark)
    roofA.rotation.x = Math.PI / 8
    const roofB = box(3.6, 0.1, 1.24, 0, 1.68, 0.46, dark)
    roofB.rotation.x = -Math.PI / 8
    box(3.76, 0.08, 0.08, 0, 1.94, 0, orange)

    box(0.09, 0.7, 1.82, -1.75, 0.42, 0, timber)
    box(0.09, 0.7, 1.82, 1.75, 0.42, 0, timber)

    const chantierOffset = chantier?.id.endsWith('4') ? -0.5 : chantier?.id.endsWith('3') ? 0.42 : 0
    group.rotation.y = -0.45 + chantierOffset

    let frame = 0
    let targetRotation = group.rotation.y
    let dragging = false
    let lastX = 0

    function onPointerDown(event: PointerEvent) {
      dragging = true
      lastX = event.clientX
      renderer.domElement.setPointerCapture(event.pointerId)
    }

    function onPointerMove(event: PointerEvent) {
      if (!dragging) return
      const delta = event.clientX - lastX
      lastX = event.clientX
      targetRotation += delta * 0.008
    }

    function onPointerUp(event: PointerEvent) {
      dragging = false
      renderer.domElement.releasePointerCapture(event.pointerId)
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointercancel', onPointerUp)

    function resize() {
      const width = Math.max(mount.clientWidth, 1)
      const height = Math.max(mount.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    function animate() {
      frame = requestAnimationFrame(animate)
      if (!dragging) targetRotation += 0.002
      group.rotation.y += (targetRotation - group.rotation.y) * 0.08
      group.position.y = Math.sin(Date.now() * 0.0012) * 0.015
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerUp)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
        }
      })
      ;[timber, dark, orange, sand, glass, groundMaterial].forEach(material => material.dispose())
    }
  }, [chantier])

  return <div ref={hostRef} className="absolute inset-0" aria-label="Vue 3D du chantier" />
}

function ChantierTimeline({ chantier }: { chantier?: Chantier }) {
  if (!chantier) return null

  const timeline = [
    { label: 'Dossier signé', date: '10 déc. 2025', state: 'done' },
    { label: 'Démarrage', date: formatDate(chantier.dateDebut), state: 'done' },
    { label: 'Structure bois', date: 'En cours', state: chantier.statut === 'cloture' ? 'done' : 'active' },
    { label: 'Second oeuvre', date: 'Mai 2026', state: chantier.statut === 'cloture' ? 'done' : 'todo' },
    { label: 'Réception', date: formatDate(chantier.dateFin ?? chantier.dateFinPrevue), state: chantier.statut === 'cloture' ? 'done' : 'todo' },
  ]

  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
      {timeline.map((item, index) => {
        const isDone = item.state === 'done'
        const isActive = item.state === 'active'
        return (
          <div key={item.label} className="relative">
            {index < timeline.length - 1 && (
              <div className={`absolute left-5 top-5 hidden h-px w-[calc(100%_-_10px)] sm:block ${isDone ? 'bg-[#F06B21]' : 'bg-[#EADBC8]'}`} />
            )}
            <div className="relative z-10 flex gap-3 sm:block">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-bold ${isDone ? 'bg-[#F06B21] text-white' : isActive ? 'border-2 border-[#F06B21] bg-white text-[#F06B21]' : 'bg-[#EADBC8] text-[#6B6B6B]'}`}>
                {isDone ? <CheckCircle className="h-4 w-4" strokeWidth={2} /> : index + 1}
              </span>
              <div className="sm:mt-3">
                <p className="text-[12px] font-semibold text-[#1E1E1E]">{item.label}</p>
                <p className="mt-1 text-[11px] text-[#6B6B6B]">{item.date}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, chantiers, factures } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const client = clients.find(item => item.id === id)
  const clientChantiers = useMemo(
    () => chantiers.filter(chantier => chantier.clientId === id),
    [chantiers, id],
  )

  const selectedChantier = clientChantiers.find(chantier => chantier.id === selectedId) ?? clientChantiers[0]
  const chantierFactures = factures.filter(facture => selectedChantier?.factureIds.includes(facture.id))
  const clientFactures = factures.filter(facture => clientChantiers.some(chantier => chantier.factureIds.includes(facture.id)))
  const validatedTotal = clientFactures.filter(facture => facture.statut === 'validee').reduce((sum, facture) => sum + facture.montantTTC, 0)
  const pendingTotal = clientFactures.filter(facture => facture.statut === 'en_attente').reduce((sum, facture) => sum + facture.montantTTC, 0)
  const budget = selectedChantier?.budgetPrevisionnel ?? 0
  const spent = selectedChantier?.depensesEngagees ?? 0
  const budgetProgress = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
  const acompte = Math.round(budget * 0.3)
  const balance = Math.max(0, budget - validatedTotal)
  const paymentStatus = pendingTotal > 0
    ? { label: 'À contrôler', detail: `${formatEuros(pendingTotal)} en attente`, className: 'bg-[#FDEBDD] text-[#F06B21]' }
    : { label: 'À jour', detail: 'Aucun règlement bloquant', className: 'bg-[#E6F4EA] text-[#1E8E3E]' }

  if (!client) {
    return (
      <div className="min-h-full bg-[#FAF6F2] p-8">
        <button type="button" onClick={() => navigate('/clients')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#F06B21]">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Retour clients
        </button>
        <Card className="mt-6 p-8">
          <h1 className="text-xl font-semibold text-[#1E1E1E]">Client introuvable</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">La fiche demandée n’existe pas dans les données de démonstration.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <button type="button" onClick={() => navigate('/clients')} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#F06B21] hover:text-[#D95B17]">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Clients
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[30px] font-semibold leading-tight text-[#1E1E1E]">{client.nom}</h1>
            <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${typeStyle[client.type]}`}>{typeLabel[client.type]}</span>
            <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${paymentStatus.className}`}>{paymentStatus.label}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-[#6B6B6B]">
            Fiche client consolidée : coordonnées, règlement, chantiers liés et suivi opérationnel en une vue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href={`mailto:${client.email}`} className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-semibold text-[#1E1E1E] hover:bg-[#F9F7F3]">
            <Mail className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
            Écrire
          </a>
          {selectedChantier && (
            <Link to={`/chantiers/${selectedChantier.id}`} className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]">
              Ouvrir chantier
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="min-w-0 space-y-5">
          <section className="relative min-h-[390px] overflow-hidden rounded-[24px] bg-[#1E1E1E]">
            <ChantierScene3D chantier={selectedChantier} />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-4 p-5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#F06B21]">Vue chantier 3D</p>
                <h2 className="mt-2 text-[24px] font-semibold text-white">{selectedChantier?.nom ?? 'Aucun chantier'}</h2>
                <p className="mt-1 max-w-xl text-sm text-white/70">{selectedChantier?.description ?? 'Aucun chantier rattaché à cette fiche client.'}</p>
              </div>
              {selectedChantier && (
                <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${chantierStatus[selectedChantier.statut].className}`}>
                  {chantierStatus[selectedChantier.statut].label}
                </span>
              )}
            </div>
            <div className="pointer-events-none absolute bottom-5 left-5 hidden rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/75 backdrop-blur sm:block">
              Glisser pour tourner la maquette
            </div>
            <div className="absolute bottom-5 right-5 flex flex-wrap justify-end gap-2">
              {clientChantiers.map(chantier => (
                <button
                  key={chantier.id}
                  type="button"
                  onClick={() => setSelectedId(chantier.id)}
                  className={`pointer-events-auto rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${selectedChantier?.id === chantier.id ? 'bg-[#F06B21] text-white' : 'bg-white/12 text-white hover:bg-white/20'}`}
                >
                  {chantier.nom}
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={CalendarDays} label="Début chantier" value={formatDate(selectedChantier?.dateDebut)} detail={`Livraison prévue : ${formatDate(selectedChantier?.dateFinPrevue)}`} />
            <MetricCard icon={Euro} label="Budget chantier" value={formatEuros(budget)} detail={`${budgetProgress}% engagé`} />
            <MetricCard icon={ReceiptText} label="Règlement client" value={paymentStatus.label} detail={paymentStatus.detail} />
            <MetricCard icon={Clock} label="Dernier échange" value="21 avr. 2026" detail="Relance menuiseries envoyée" />
          </div>

          {selectedChantier && (
            <Card className="p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1E1E1E]">Suivi opérationnel</h2>
                  <p className="mt-1 text-sm text-[#6B6B6B]">{selectedChantier.adresse}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-[12px] font-semibold ${tendencyStatus[selectedChantier.tendance].className}`}>
                  {tendencyStatus[selectedChantier.tendance].label}
                </span>
              </div>
              <ChantierTimeline chantier={selectedChantier} />
              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="mb-2 flex items-center justify-between text-[12px] font-medium">
                    <span className="text-[#6B6B6B]">Dépenses engagées</span>
                    <span className="text-[#1E1E1E]">{formatEuros(spent)} / {formatEuros(budget)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EADBC8]">
                    <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${budgetProgress}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                    <p className="text-[#6B6B6B]">Chef chantier</p>
                    <p className="mt-1 font-semibold text-[#1E1E1E]">{selectedChantier.chefChantier}</p>
                  </div>
                  <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                    <p className="text-[#6B6B6B]">Factures</p>
                    <p className="mt-1 font-semibold text-[#1E1E1E]">{chantierFactures.length} pièce(s)</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Factures liées</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">Dernières pièces rattachées au chantier sélectionné.</p>
              </div>
              <Link to="/factures" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#F06B21]">
                Voir factures
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[13px]">
                <thead className="bg-[#FAF6F2] text-[12px] font-medium text-[#6B6B6B]">
                  <tr>
                    <th className="px-5 py-3">Fournisseur</th>
                    <th className="px-5 py-3">N° facture</th>
                    <th className="px-5 py-3">Catégorie</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Montant TTC</th>
                    <th className="px-5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {chantierFactures.map(facture => (
                    <tr key={facture.id} className="border-t border-[#F2E8DC]">
                      <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{facture.fournisseur}</td>
                      <td className="px-5 py-3 text-[#3C3C3C]">{facture.numeroFacture}</td>
                      <td className="px-5 py-3 text-[#3C3C3C]">{categorieLabels[facture.categorie]}</td>
                      <td className="px-5 py-3 text-[#3C3C3C]">{formatDate(facture.date)}</td>
                      <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{formatEuros(facture.montantTTC)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${facture.statut === 'validee' ? 'bg-[#E6F4EA] text-[#1E8E3E]' : 'bg-[#FDEBDD] text-[#F06B21]'}`}>
                          {facture.statut === 'validee' ? 'Validée' : 'À contrôler'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>

        <aside className="space-y-5">
          <Card className="overflow-hidden">
            <img src={getChantierCover(selectedChantier?.id)} alt="Aperçu chantier" className="h-44 w-full object-cover" />
            <div className="p-5">
              <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Informations client</h2>
              <div className="mt-4 space-y-3 text-[13px]">
                <div className="flex gap-3">
                  <User className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                  <div>
                    <p className="font-semibold text-[#1E1E1E]">{client.nom}</p>
                    <p className="text-[#6B6B6B]">Client depuis {formatDate(client.dateCreation)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                  <a href={`mailto:${client.email}`} className="text-[#3C3C3C] hover:text-[#F06B21]">{client.email}</a>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                  <a href={`tel:${client.telephone.replace(/\s/g, '')}`} className="text-[#3C3C3C] hover:text-[#F06B21]">{client.telephone}</a>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                  <p className="text-[#3C3C3C]">{client.adresse}, {client.codePostal} {client.ville}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Règlement</h2>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${paymentStatus.className}`}>{paymentStatus.label}</span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ['Acompte prévu', formatEuros(acompte)],
                ['Factures validées', formatEuros(validatedTotal)],
                ['En attente contrôle', formatEuros(pendingTotal)],
                ['Reste à facturer', formatEuros(balance)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-[12px] bg-[#FAF6F2] px-3 py-2.5 text-[13px]">
                  <span className="text-[#6B6B6B]">{label}</span>
                  <span className="font-semibold text-[#1E1E1E]">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Chantiers du client</h2>
            <div className="mt-4 space-y-3">
              {clientChantiers.map(chantier => (
                <button
                  key={chantier.id}
                  type="button"
                  onClick={() => setSelectedId(chantier.id)}
                  className={`flex w-full items-start gap-3 rounded-[14px] border p-3 text-left transition-colors ${selectedChantier?.id === chantier.id ? 'border-[#F06B21] bg-[#FFF9F4]' : 'border-[#F2E8DC] bg-white hover:bg-[#FAF6F2]'}`}
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#FDEBDD] text-[#F06B21]">
                    <Hammer className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{chantier.nom}</p>
                    <p className="mt-1 text-[11px] text-[#6B6B6B]">Début {formatDate(chantier.dateDebut)}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Documents demo</h2>
            <div className="mt-4 space-y-2">
              {['Devis signé.pdf', 'Plan ossature v3.pdf', 'Compte-rendu chantier.pdf'].map(document => (
                <div key={document} className="flex items-center gap-3 rounded-[12px] bg-[#FAF6F2] px-3 py-2.5 text-[13px] text-[#3C3C3C]">
                  <FileText className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                  {document}
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
