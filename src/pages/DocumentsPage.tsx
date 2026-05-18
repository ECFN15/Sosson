import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  CheckCircle2,
  Download,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  HardHat,
  Link2,
  ReceiptText,
  Search,
  Upload,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import type { FileRejection } from 'react-dropzone'
import { useApp } from '@/lib/store'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { canAccessPage } from '@/lib/accessControl'
import {
  MAX_DOCUMENT_BYTES,
  buildPendingDocumentStoragePath,
  documentDropzoneAccept,
  hashDocumentFile,
  validateDocumentUploadFile,
} from '@/features/documents/storagePaths'
import {
  createDocumentAttacheInSql,
  createDocumentFolderInSql,
  loadDocumentsSqlData,
  updateDocumentAttacheLinksInSql,
} from '@/features/documents/documentSql'
import type { DocumentKind, DocumentRecord, DocumentStatus, FolderRecord } from '@/features/documents/documentTypes'

type SortKey = 'recent' | 'amount_desc' | 'amount_asc' | 'name'

const LOCAL_FOLDERS_KEY = 'sosson.documentFolders'

const kindLabels: Record<DocumentKind, string> = {
  facture: 'Facture',
  email_piece_jointe: 'Email',
  devis: 'Devis',
  chantier: 'Chantier',
  import: 'Import',
}

const statusLabels: Record<DocumentStatus, string> = {
  a_classer: 'A classer',
  lie: 'Lie',
  action_requise: 'Action requise',
}

const statusStyles: Record<DocumentStatus, string> = {
  a_classer: 'bg-[#FDEBDD] text-[#D95B17]',
  lie: 'bg-[#E6F4EA] text-[#1E8E3E]',
  action_requise: 'bg-[#FEE2E2] text-[#DC2626]',
}

const smartFolders: FolderRecord[] = [
  { id: 'all', name: 'Tous les documents', kind: 'all', description: 'Tous les fichiers importés' },
  { id: 'inbox', name: 'À classer', kind: 'inbox', description: 'Documents sans rangement final' },
  { id: 'factures', name: 'Factures', kind: 'factures', description: 'Factures fournisseurs importées' },
  { id: 'devis', name: 'Devis', kind: 'devis', description: 'Devis et propositions' },
  { id: 'plans', name: 'Plans', kind: 'plans', description: 'Plans, coupes et pièces techniques' },
  { id: 'photos', name: 'Photos', kind: 'photos', description: 'Photos et images chantier' },
  { id: 'imports', name: 'Imports', kind: 'imports', description: 'Excel, exports et fichiers non classés' },
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR')
}

function formatEuros(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} EUR`
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 140)
}

function inferKind(fileName: string, selectedFolder: FolderRecord): DocumentKind {
  const lower = fileName.toLowerCase()
  if (selectedFolder.kind === 'factures' || lower.includes('facture')) return 'facture'
  if (selectedFolder.kind === 'devis' || lower.includes('devis')) return 'devis'
  if (selectedFolder.kind === 'photos' || /\.(jpe?g|png|heic)$/i.test(fileName)) return 'chantier'
  if (selectedFolder.kind === 'plans' || lower.includes('plan') || lower.endsWith('.dwg')) return 'chantier'
  return 'import'
}

function formatDropRejectedMessage(rejections: FileRejection[]) {
  const first = rejections[0]
  if (!first) return 'Fichier refuse.'

  const reason = first.errors[0]?.code
  if (reason === 'file-too-large') return `${first.file.name}: fichier trop volumineux, limite 30 Mo.`
  if (reason === 'file-invalid-type') return `${first.file.name}: type de fichier non autorise.`
  return `${first.file.name}: fichier refuse.`
}

function readLocalFolders() {
  try {
    const raw = localStorage.getItem(LOCAL_FOLDERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as FolderRecord[]
  } catch {
    return []
  }
}
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-[#EADBC8] bg-white shadow-[0_1px_0_rgba(255,255,255,.9)_inset] ${className}`}>{children}</section>
}

export function DocumentsPage() {
  const { chantiers, clients, dataSource, user, accessMatrix } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('recent')
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'tous'>('tous')
  const [selectedId, setSelectedId] = useState('')
  const [uploads, setUploads] = useState<DocumentRecord[]>([])
  const [sqlDocuments, setSqlDocuments] = useState<DocumentRecord[]>([])
  const [sqlFolders, setSqlFolders] = useState<FolderRecord[]>([])
  const [localFolders, setLocalFolders] = useState<FolderRecord[]>(() => readLocalFolders())
  const [newFolderName, setNewFolderName] = useState('')
  const [feedback, setFeedback] = useState('')
  const chantierFilter = searchParams.get('chantierId') ?? ''
  const folderParam = searchParams.get('folder') ?? 'all'
  const canCreateDocuments = canAccessPage(user?.role, 'documents', accessMatrix, 'create')
  const canEditDocuments = canAccessPage(user?.role, 'documents', accessMatrix, 'edit')
  const canCreateDocumentSql = dataSource === 'dataconnect' && isDataConnectEnabled && Boolean(user) && canCreateDocuments
  const canEditDocumentSql = dataSource === 'dataconnect' && isDataConnectEnabled && Boolean(user) && canEditDocuments
  const optimisticSqlDocuments = uploads.filter(document => document.source === 'sql_connect').length
  const localOnlyDocuments = uploads.length - optimisticSqlDocuments
  const visibleSqlDocumentCount = sqlDocuments.length + optimisticSqlDocuments

  const folders = useMemo(() => [...smartFolders, ...sqlFolders, ...localFolders], [localFolders, sqlFolders])
  const activeFolder = folders.find(folder => folder.id === folderParam) ?? folders[0]

  useEffect(() => {
    localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(localFolders))
  }, [localFolders])

  useEffect(() => {
    if (!isDataConnectEnabled || !user) return

    let isMounted = true

    async function loadSqlData() {
      try {
        const sqlData = await loadDocumentsSqlData()
        if (!isMounted) return
        setSqlDocuments(sqlData.documents)
        setSqlFolders(sqlData.folders)
      } catch (error) {
        console.info('Documents SQL Connect indisponibles, gestionnaire local utilisé.', error)
      }
    }

    void loadSqlData()

    return () => {
      isMounted = false
    }
  }, [user])

  const documents = useMemo(
    () => [...uploads, ...sqlDocuments],
    [sqlDocuments, uploads],
  )

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const folder of folders) counts[folder.id] = 0

    for (const document of documents) {
      counts.all = (counts.all ?? 0) + 1
      if (document.status === 'a_classer') counts.inbox = (counts.inbox ?? 0) + 1
      if (document.kind === 'facture') counts.factures = (counts.factures ?? 0) + 1
      if (document.kind === 'devis') counts.devis = (counts.devis ?? 0) + 1
      if (document.kind === 'chantier') counts.plans = (counts.plans ?? 0) + 1
      if (document.kind === 'import') counts.imports = (counts.imports ?? 0) + 1
      if (document.folderId) {
        counts[document.folderId] = (counts[document.folderId] ?? 0) + 1
        counts[`folder-${document.folderId}`] = (counts[`folder-${document.folderId}`] ?? 0) + 1
      }
    }

    return counts
  }, [documents, folders])

  const visibleDocuments = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = documents.filter(document => {
      if (chantierFilter && document.chantierId !== chantierFilter) return false
      if (statusFilter !== 'tous' && document.status !== statusFilter) return false

      if (activeFolder.kind === 'inbox' && document.status !== 'a_classer') return false
      if (activeFolder.kind === 'factures' && document.kind !== 'facture') return false
      if (activeFolder.kind === 'devis' && document.kind !== 'devis') return false
      if (activeFolder.kind === 'plans' && document.kind !== 'chantier') return false
      if (activeFolder.kind === 'photos' && !/\.(jpe?g|png|heic)$/i.test(document.title)) return false
      if (activeFolder.kind === 'imports' && document.kind !== 'import') return false
      if (activeFolder.kind === 'custom' && document.folderId !== activeFolder.sqlId && document.folderId !== activeFolder.id) return false

      if (!query) return true
      const chantier = chantiers.find(item => item.id === document.chantierId)
      const client = clients.find(item => item.id === document.clientId)
      return [document.title, document.detail, document.folderName, chantier?.nom, client?.nom, kindLabels[document.kind], statusLabels[document.status]]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    })

    return filtered.sort((a, b) => {
      if (sortKey === 'name') return a.title.localeCompare(b.title, 'fr')
      if (sortKey === 'amount_desc') return (b.amount ?? 0) - (a.amount ?? 0)
      if (sortKey === 'amount_asc') return (a.amount ?? 0) - (b.amount ?? 0)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [activeFolder, chantierFilter, chantiers, clients, documents, search, sortKey, statusFilter])

  const selectedDocument =
    visibleDocuments.find(document => document.id === selectedId) ??
    visibleDocuments[0]

  const selectedChantier = chantiers.find(chantier => chantier.id === selectedDocument?.chantierId)
  const selectedClient = clients.find(client => client.id === selectedDocument?.clientId)

  const totals = useMemo(() => {
    return visibleDocuments.reduce(
      (acc, document) => {
        acc.count += 1
        acc.amount += document.amount ?? 0
        if (document.status === 'a_classer') acc.inbox += 1
        return acc
      },
      { count: 0, amount: 0, inbox: 0 },
    )
  }, [visibleDocuments])

  function setActiveFolder(folder: FolderRecord) {
    const next = new URLSearchParams(searchParams)
    next.set('folder', folder.id)
    setSearchParams(next)
    setSelectedId('')
  }

  async function handleCreateFolder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canCreateDocuments) {
      setFeedback('Creation de dossier non autorisee pour ce profil.')
      return
    }

    const name = newFolderName.trim()
    if (!name) return

    const slug = slugify(name) || `dossier-${Date.now()}`
    const localFolder: FolderRecord = {
      id: `local-${slug}-${Date.now()}`,
      name,
      kind: 'custom',
      description: 'Dossier local',
    }

    if (canCreateDocumentSql) {
      try {
        const folderId = await createDocumentFolderInSql({
          nom: name,
          slug,
          parentId: null,
          clientId: null,
          chantierId: chantierFilter || null,
          description: 'Dossier créé depuis le gestionnaire documents.',
        })
        const sqlFolder = { ...localFolder, id: `folder-${folderId}`, sqlId: folderId, description: 'Dossier SQL Connect' }
        setSqlFolders(current => [...current, sqlFolder].sort((a, b) => a.name.localeCompare(b.name, 'fr')))
        setActiveFolder(sqlFolder)
        setFeedback('Dossier créé dans SQL Connect.')
      } catch (error) {
        console.info('Creation SQL Connect impossible, aucun dossier local cree.', error)
        setFeedback("Creation SQL Connect impossible. Aucun dossier local n'a ete cree.")
      }
    } else {
      setLocalFolders(current => [...current, localFolder])
      setActiveFolder(localFolder)
      setFeedback('Dossier créé localement.')
    }

    setNewFolderName('')
  }

  async function handleClassifyDocument(document: DocumentRecord, folderId: string) {
    if (!canEditDocuments) {
      setFeedback('Classement de document non autorise pour ce profil.')
      return
    }

    const targetFolder = folders.find(folder => folder.id === folderId)
    if (!targetFolder) return

    const nextKind: DocumentKind =
      targetFolder.kind === 'factures'
        ? 'facture'
        : targetFolder.kind === 'devis'
          ? 'devis'
          : targetFolder.kind === 'plans' || targetFolder.kind === 'photos'
            ? 'chantier'
            : targetFolder.kind === 'imports'
              ? 'import'
              : document.kind

    const nextFolderId = targetFolder.kind === 'custom' ? (targetFolder.sqlId ?? targetFolder.id) : undefined
    const nextDocument = {
      ...document,
      kind: nextKind,
      status: 'lie' as DocumentStatus,
      folderId: nextFolderId,
      folderName: targetFolder.name,
    }

    const applyLocalUpdate = () => {
      setUploads(current => current.map(item => (item.id === document.id ? nextDocument : item)))
      setSqlDocuments(current => current.map(item => (item.id === document.id ? nextDocument : item)))
      setFeedback(`Document classé dans ${targetFolder.name}.`)
    }

    if (document.id.startsWith('sql-')) {
      if (!canEditDocumentSql) {
        setFeedback("Document SQL Connect: classement non applique car l'ecriture SQL est indisponible. Aucun fallback local n'a ete applique.")
        return
      }

      try {
        await updateDocumentAttacheLinksInSql({
          id: document.id.replace(/^sql-/, ''),
          folderId: targetFolder.kind === 'custom' ? targetFolder.sqlId ?? null : null,
          clientId: document.clientId ?? null,
          chantierId: document.chantierId ?? null,
          factureId: document.factureId ?? null,
          statut: 'lie',
          typeDocument: nextKind,
        })
        applyLocalUpdate()
      } catch (error) {
        console.info('Classement SQL Connect impossible, aucun classement local applique.', error)
        setFeedback("Classement SQL Connect impossible. Aucun classement local n'a ete applique.")
      }
      return
    }

    applyLocalUpdate()
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: documentDropzoneAccept,
    maxSize: MAX_DOCUMENT_BYTES,
    multiple: true,
    noClick: true,
    disabled: !canCreateDocuments,
    onDropRejected: rejections => {
      setFeedback(formatDropRejectedMessage(rejections))
    },
    onDrop: async acceptedFiles => {
      if (!canCreateDocuments) {
        setFeedback('Import de document non autorise pour ce profil.')
        return
      }

      const now = new Date().toISOString()
      const linkedClientId = chantierFilter ? chantiers.find(chantier => chantier.id === chantierFilter)?.clientId : undefined
      const nextDocuments: DocumentRecord[] = []
      const sqlFolderId = activeFolder.kind === 'custom' ? activeFolder.sqlId : undefined
      const localFolderId = activeFolder.kind === 'custom' ? activeFolder.id : undefined

      for (const file of acceptedFiles) {
        const validationError = validateDocumentUploadFile(file)
        if (validationError) {
          setFeedback(`${file.name}: ${validationError}`)
          continue
        }

        const typeDocument = inferKind(file.name, activeFolder)
        const sha256 = await hashDocumentFile(file)
        const baseDocument: DocumentRecord = {
          id: `upload-${file.name}-${Date.now()}`,
          title: file.name,
          kind: typeDocument,
          status: 'a_classer',
          source: 'upload',
          date: now,
          folderId: sqlFolderId ?? localFolderId,
          folderName: activeFolder.kind === 'custom' ? activeFolder.name : activeFolder.name,
          chantierId: chantierFilter || undefined,
          clientId: linkedClientId,
          detail: `${(file.size / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo - ${file.type || 'type inconnu'}`,
          sha256,
          downloadUrl: URL.createObjectURL(file),
        }

        if (canCreateDocumentSql) {
          try {
            const documentId = await createDocumentAttacheInSql({
              folderId: sqlFolderId || null,
              clientId: linkedClientId || null,
              chantierId: chantierFilter || null,
              factureId: null,
              nomFichier: file.name,
              storagePath: buildPendingDocumentStoragePath(file, chantierFilter || undefined),
              mimeType: file.type || null,
              tailleBytes: file.size,
              sha256,
              typeDocument,
              statut: 'a_classer',
              source: 'upload',
              description: baseDocument.detail,
              dateDocument: now.slice(0, 10),
            })
            baseDocument.id = `sql-${documentId}`
            baseDocument.source = 'sql_connect'
            setFeedback('Metadonnees document enregistrees dans SQL Connect. Fichier Storage a finaliser.')
          } catch (error) {
            console.info('Creation document SQL Connect impossible, aucun document local cree.', error)
            setFeedback(`Creation SQL Connect impossible pour ${file.name}. Aucun document local n'a ete cree.`)
            continue
          }
        } else {
          setFeedback('Document ajouté localement.')
        }

        nextDocuments.push(baseDocument)
      }

      if (nextDocuments.length) {
        setUploads(current => [...nextDocuments, ...current])
        setSelectedId(nextDocuments[0]?.id ?? '')
      }
    },
  })

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 overflow-hidden rounded-[24px] border border-[#EADBC8] bg-white px-5 py-5 shadow-[0_18px_44px_rgba(30,30,30,0.06)] xl:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#EADBC8] bg-[#FAF6F2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3C3C3C]">
              <FolderOpen className="h-3.5 w-3.5 text-[#F06B21]" strokeWidth={1.75} />
              GED chantier
            </span>
            <span className="inline-flex rounded-full border border-[#EADBC8] bg-white px-3 py-1 text-[11px] font-semibold text-[#6B6B6B]">
              {dataSource === 'dataconnect' ? 'SQL Connect actif' : 'Source locale'}
            </span>
            <span className="inline-flex rounded-full border border-[#EADBC8] bg-white px-3 py-1 text-[11px] font-semibold text-[#6B6B6B]">
              SQL {visibleSqlDocumentCount}
            </span>
            {(localOnlyDocuments > 0 || localFolders.length > 0) && (
              <span className="inline-flex rounded-full border border-[#F2C7A6] bg-[#FFF7F1] px-3 py-1 text-[11px] font-semibold text-[#D95B17]">
                Fallback local: {localOnlyDocuments} fichier{localOnlyDocuments > 1 ? 's' : ''}, {localFolders.length} dossier{localFolders.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h1 className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-[#1E1E1E]">Gestionnaire de documents</h1>
          <p className="mt-2 text-sm text-[#3C3C3C]">Dossiers, import et recherche sur les fichiers réellement ajoutés.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (canCreateDocuments) open()
            else setFeedback('Import de document non autorise pour ce profil.')
          }}
          className={`inline-flex h-10 items-center gap-2 rounded-[14px] px-4 text-sm font-semibold text-white ${
            canCreateDocuments ? 'bg-[#F06B21] hover:bg-[#D95B17]' : 'bg-[#9CA3AF]'
          }`}
        >
          <Upload className="h-4 w-4" strokeWidth={1.75} />
          Importer
        </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-[13px] font-medium text-[#3C3C3C]">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback('')} className="text-[#F06B21] hover:text-[#D95B17]">OK</button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="space-y-5">
          <Card className="p-4">
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <label className="block">
                <span className="text-[12px] font-semibold text-[#1E1E1E]">Nouveau dossier</span>
                <input
                  value={newFolderName}
                  onChange={event => setNewFolderName(event.target.value)}
                  disabled={!canCreateDocuments}
                  placeholder="Ex: Factures frais"
                  className="mt-2 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] placeholder:text-[#9CA3AF] disabled:cursor-not-allowed disabled:bg-[#FAF6F2] disabled:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                />
              </label>
              <button
                type="submit"
                disabled={!canCreateDocuments}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-[#1E1E1E] px-3 text-sm font-semibold text-white hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
              >
                <FolderPlus className="h-4 w-4" strokeWidth={1.75} />
                Créer le dossier
              </button>
            </form>
          </Card>

          <Card className="overflow-hidden p-2">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6B6B]">Dossiers</div>
            <nav className="space-y-1">
              {folders.map(folder => {
                const active = activeFolder.id === folder.id
                const count = folderCounts[folder.id] ?? 0
                const Icon = active ? FolderOpen : Folder
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolder(folder)}
                    className={`flex h-11 w-full items-center gap-3 rounded-[12px] px-3 text-left transition-colors ${
                      active ? 'bg-[#FDEBDD] text-[#1E1E1E]' : 'text-[#3C3C3C] hover:bg-[#FAF6F2]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-[#F06B21]' : 'text-[#6B6B6B]'}`} strokeWidth={1.75} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{folder.name}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#6B6B6B]">{count}</span>
                  </button>
                )
              })}
            </nav>
          </Card>
        </aside>

        <main className="min-w-0 space-y-5">
          <Card className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#F06B21]">
                  <FolderOpen className="h-4 w-4" strokeWidth={1.75} />
                  {activeFolder.kind === 'custom' ? 'Dossier utilisateur' : 'Dossier intelligent'}
                </div>
                <h2 className="mt-2 text-[22px] font-semibold text-[#1E1E1E]">{activeFolder.name}</h2>
                <p className="mt-1 text-sm text-[#6B6B6B]">{activeFolder.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-[14px] bg-[#FAF6F2] px-4 py-3">
                  <p className="text-[20px] font-semibold text-[#1E1E1E]">{totals.count}</p>
                  <p className="text-[11px] text-[#6B6B6B]">Fichiers</p>
                </div>
                <div className="rounded-[14px] bg-[#FAF6F2] px-4 py-3">
                  <p className="text-[20px] font-semibold text-[#1E1E1E]">{totals.inbox}</p>
                  <p className="text-[11px] text-[#6B6B6B]">À classer</p>
                </div>
                <div className="rounded-[14px] bg-[#FAF6F2] px-4 py-3">
                  <p className="text-[20px] font-semibold text-[#1E1E1E]">{formatEuros(totals.amount)}</p>
                  <p className="text-[11px] text-[#6B6B6B]">Montant</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_190px]">
              <label className="flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-3">
                <Search className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                <input
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Recherche intelligente: nom, client, chantier, type..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#1E1E1E] placeholder:text-[#9CA3AF] focus:outline-none"
                />
              </label>
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as DocumentStatus | 'tous')} className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E]">
                <option value="tous">Tous statuts</option>
                <option value="a_classer">À classer</option>
                <option value="lie">Liés</option>
                <option value="action_requise">Action requise</option>
              </select>
              <select value={sortKey} onChange={event => setSortKey(event.target.value as SortKey)} className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E]">
                <option value="recent">Derniers importés</option>
                <option value="amount_desc">Montant décroissant</option>
                <option value="amount_asc">Montant croissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="grid min-h-[430px] grid-rows-[auto_1fr]">
              <div className="grid grid-cols-[minmax(240px,1.4fr)_120px_120px_minmax(180px,1fr)_110px] border-b border-[#F2E8DC] bg-white px-4 py-3 text-[12px] font-medium text-[#6B6B6B]">
                <span>Nom</span>
                <span>Type</span>
                <span>Date</span>
                <span>Rangement</span>
                <span className="text-right">Montant</span>
              </div>

              {visibleDocuments.length > 0 ? (
                <div className="divide-y divide-[#F2E8DC]">
                  {visibleDocuments.map(document => {
                    const chantier = chantiers.find(item => item.id === document.chantierId)
                    const client = clients.find(item => item.id === document.clientId)
                    const selected = selectedDocument?.id === document.id
                    return (
                      <button
                        key={document.id}
                        type="button"
                        onClick={() => setSelectedId(document.id)}
                        className={`grid w-full grid-cols-[minmax(240px,1.4fr)_120px_120px_minmax(180px,1fr)_110px] items-center px-4 py-3 text-left transition-colors ${
                          selected ? 'bg-[#FDEBDD]/45' : 'hover:bg-[#FAF6F2]'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FAF6F2] text-[#F06B21]">
                            <FileText className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-semibold text-[#1E1E1E]">{document.title}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-[#6B6B6B]">{document.detail}</span>
                          </span>
                        </span>
                        <span className="text-[13px] text-[#3C3C3C]">{kindLabels[document.kind]}</span>
                        <span className="text-[13px] text-[#3C3C3C]">{formatDate(document.date)}</span>
                        <span className="min-w-0 text-[12px] text-[#6B6B6B]">
                          <span className="block truncate">{document.folderName || activeFolder.name}</span>
                          <span className="block truncate">{chantier?.nom || client?.nom || 'Non rattaché'}</span>
                        </span>
                        <span className="text-right text-[13px] font-semibold text-[#1E1E1E]">{document.amount ? formatEuros(document.amount) : '-'}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-[18px] border border-[#EADBC8] bg-white text-[#F06B21] shadow-[0_10px_28px_rgba(30,30,30,0.08)]">
                    <FolderOpen className="h-8 w-8" strokeWidth={1.75} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#1E1E1E]">Dossier vide</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#6B6B6B]">
                    Déposez des fichiers ici. Aucun chantier Excel n'est affiché comme document tant qu'un fichier n'a pas été importé.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (canCreateDocuments) open()
                      else setFeedback('Import de document non autorise pour ce profil.')
                    }}
                    className={`mt-5 inline-flex h-10 items-center gap-2 rounded-[12px] px-4 text-sm font-semibold text-white ${
                      canCreateDocuments ? 'bg-[#1E1E1E] hover:bg-[#2A2A2A]' : 'bg-[#9CA3AF]'
                    }`}
                  >
                    <Upload className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                    Importer un document
                  </button>
                </div>
              )}
            </div>
          </Card>
        </main>

        <aside className="space-y-5">
          <Card className="p-5">
            <div
              {...getRootProps()}
              className={`rounded-[18px] border border-dashed p-6 text-center transition-colors ${
                isDragActive ? 'border-[#F06B21] bg-[#FDEBDD]' : 'border-[#F2E8DC] bg-[#FAF6F2]'
              }`}
            >
              <input {...getInputProps()} />
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] border border-[#EADBC8] bg-white text-[#F06B21]">
                <Upload className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <button
                type="button"
                onClick={() => {
                  if (canCreateDocuments) open()
                  else setFeedback('Import de document non autorise pour ce profil.')
                }}
                className={`mt-4 text-[14px] font-semibold ${canCreateDocuments ? 'text-[#1E1E1E]' : 'text-[#6B6B6B]'}`}
              >
                Glisser-déposer ou parcourir
              </button>
              <p className="mt-2 text-[12px] leading-5 text-[#6B6B6B]">
                Les fichiers seront importés dans <span className="font-semibold text-[#1E1E1E]">{activeFolder.name}</span>.
              </p>
            </div>
          </Card>

          {selectedDocument && (
            <Card className="p-5">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#1E1E1E]">{selectedDocument.title}</h2>
                  <p className="mt-1 text-[12px] text-[#6B6B6B]">{kindLabels[selectedDocument.kind]} - {formatDate(selectedDocument.date)}</p>
                </div>
                <span className={`shrink-0 rounded-[6px] px-2.5 py-1 text-[11px] font-semibold ${statusStyles[selectedDocument.status]}`}>
                  {statusLabels[selectedDocument.status]}
                </span>
              </div>

              <p className="rounded-[14px] bg-[#FAF6F2] p-4 text-[13px] leading-5 text-[#3C3C3C]">{selectedDocument.detail}</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 rounded-[14px] border border-[#F2E8DC] p-4">
                  <Link2 className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1E1E1E]">{selectedDocument.folderName || activeFolder.name}</p>
                    <p className="mt-1 text-[12px] text-[#6B6B6B]">{selectedChantier?.nom || selectedClient?.nom || 'Aucun dossier chantier lié'}</p>
                    <p className="mt-1 text-[12px] text-[#6B6B6B]">
                      {selectedDocument.source === 'sql_connect' ? 'Metadonnees SQL Connect' : 'Session locale non durable SQL'}
                    </p>
                    {selectedDocument.sha256 && (
                      <p className="mt-1 truncate text-[11px] font-mono text-[#6B6B6B]">SHA-256 {selectedDocument.sha256}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {selectedChantier && (
                    <Link to={`/chantiers/${selectedChantier.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]">
                      <HardHat className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                      Chantier
                    </Link>
                  )}
                  {selectedDocument.kind === 'facture' && (
                    <Link to={`/factures${selectedDocument.factureId ? `?factureId=${selectedDocument.factureId}` : ''}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#F06B21] text-[12px] font-semibold text-white hover:bg-[#D95B17]">
                      <ReceiptText className="h-4 w-4" strokeWidth={1.75} />
                      Factures
                    </Link>
                  )}
                </div>

                <div className="rounded-[14px] border border-[#F2E8DC] p-4">
                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#1E1E1E]">Classer dans</span>
                    <select
                      value={
                        selectedDocument.folderId
                          ? folders.find(folder => folder.sqlId === selectedDocument.folderId || folder.id === selectedDocument.folderId)?.id ?? 'all'
                          : selectedDocument.kind === 'facture'
                            ? 'factures'
                            : selectedDocument.kind === 'devis'
                              ? 'devis'
                              : selectedDocument.kind === 'import'
                                ? 'imports'
                                : 'plans'
                      }
                      onChange={event => handleClassifyDocument(selectedDocument, event.target.value)}
                      disabled={!canEditDocuments}
                      className="mt-2 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] disabled:cursor-not-allowed disabled:bg-[#FAF6F2] disabled:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                    >
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {selectedDocument.downloadUrl ? (
                  <a
                    href={selectedDocument.downloadUrl}
                    download={selectedDocument.title}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#1E1E1E] text-[12px] font-semibold text-white hover:bg-[#2A2A2A]"
                  >
                    <Download className="h-4 w-4" strokeWidth={1.75} />
                    Télécharger sur le PC
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-[#FAF6F2] text-[12px] font-semibold text-[#6B6B6B]"
                  >
                    <Download className="h-4 w-4" strokeWidth={1.75} />
                    Fichier non disponible au téléchargement
                  </button>
                )}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <div className="flex gap-3">
              {totals.count > 0 ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1E8E3E]" strokeWidth={1.75} />
              ) : (
                <ArrowDownWideNarrow className="mt-0.5 h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
              )}
              <div>
                <h2 className="text-[14px] font-semibold text-[#1E1E1E]">Rangement intelligent</h2>
                <p className="mt-2 text-[12px] leading-5 text-[#6B6B6B]">
                  Les dossiers intelligents filtrent par type. Les dossiers créés manuellement servent au rangement libre, comme dans un explorateur.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-[#FAF6F2] px-3 py-2 text-[12px] text-[#6B6B6B]">
              <ArrowDownAZ className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
              Tri actuel: {sortKey === 'recent' ? 'derniers importés' : sortKey === 'name' ? 'nom A-Z' : sortKey === 'amount_desc' ? 'montant décroissant' : 'montant croissant'}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
