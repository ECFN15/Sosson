import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, Cloud, Download, ExternalLink, FileSpreadsheet, History, Loader2, RefreshCw, ShieldCheck, TableProperties } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getLatestGeneratedPrevisionnelWorkbookVersionFromSql,
  listPrevisionnelWorkbookVersionsFromSql,
  loadPrevisionnelSheetFromSql,
  type SqlLatestPrevisionnelWorkbookVersion,
  type SqlPrevisionnelWorkbookVersion,
} from '@/features/previsionnel/previsionnelSql'
import {
  getPrevisionnelWorkbookDownloadUrl,
  PREVISIONNEL_CURRENT_STORAGE_PATH,
  PREVISIONNEL_SOURCE_STORAGE_PATH,
  previsionnelStorageConsoleUrl,
  type PrevisionnelWorkbookDownloadKind,
} from '@/features/previsionnel/previsionnelWorkbookExport'
import { currentPrevisionnelSheet } from '@/data/previsionnelCurrentSheet'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { waitForFirebaseUser } from '@/lib/firebaseAuthState'
import { useApp } from '@/lib/store'

type PageStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error'
type DownloadTarget = 'original' | 'current' | string

function formatDate(value: string | null | undefined) {
  if (!value) return 'Non renseigne'
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatBytes(value: number | null | undefined) {
  if (!value) return 'Non renseigne'
  if (value < 1024 * 1024) return `${Math.round(value / 1024).toLocaleString('fr-FR')} Ko`
  return `${(value / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`
}

function actorName(version: SqlPrevisionnelWorkbookVersion | SqlLatestPrevisionnelWorkbookVersion | null | undefined) {
  const actor = version?.requestedBy
  if (!actor) return 'Profil inconnu'
  return `${actor.prenom} ${actor.nom}`.trim()
}

function statusTone(status: string) {
  if (status === 'generated') return 'bg-[#E6F4EA] text-[#1E8E3E]'
  if (status === 'failed') return 'bg-[#FCE8E6] text-[#B3261E]'
  if (status === 'generating') return 'bg-[#FFF4EA] text-[#F06B21]'
  return 'bg-[#FAF6F2] text-[#6B6B6B]'
}

function openSignedDownload(url: string) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function PrevisionnelBackupsPage() {
  const { user } = useApp()
  const [status, setStatus] = useState<PageStatus>('idle')
  const [message, setMessage] = useState('Lecture non lancee.')
  const [sourcePath, setSourcePath] = useState(PREVISIONNEL_SOURCE_STORAGE_PATH)
  const [sourceHash, setSourceHash] = useState<string | null>(null)
  const [latestVersion, setLatestVersion] = useState<SqlLatestPrevisionnelWorkbookVersion | null>(null)
  const [versions, setVersions] = useState<SqlPrevisionnelWorkbookVersion[]>([])
  const [downloading, setDownloading] = useState<DownloadTarget | null>(null)

  const loadBackups = useCallback(async () => {
    if (!isDataConnectEnabled || !user) {
      setStatus('unavailable')
      setMessage('SQL Connect indisponible : les sauvegardes officielles ne peuvent pas etre listees.')
      return
    }

    setStatus('loading')
    setMessage('Lecture des versions SQL Connect...')

    try {
      const firebaseUser = await waitForFirebaseUser()
      if (!firebaseUser) {
        setStatus('unavailable')
        setMessage('Session Firebase absente : impossible de lister les sauvegardes officielles.')
        return
      }

      const [{ exercise }, latest, history] = await Promise.all([
        loadPrevisionnelSheetFromSql(currentPrevisionnelSheet.sheet),
        getLatestGeneratedPrevisionnelWorkbookVersionFromSql(currentPrevisionnelSheet.sheet),
        listPrevisionnelWorkbookVersionsFromSql(currentPrevisionnelSheet.sheet),
      ])

      setSourcePath(exercise?.batch?.sourceStoragePath ?? PREVISIONNEL_SOURCE_STORAGE_PATH)
      setSourceHash(exercise?.batch?.sourceSha256 ?? null)
      setLatestVersion(latest)
      setVersions(history)
      setStatus('ready')
      setMessage(`${history.length} checkpoint(s) officiel(s) relu(s) depuis SQL Connect.`)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Erreur inconnue pendant la lecture des sauvegardes.')
    }
  }, [user])

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadBackups(), 0)
    return () => window.clearTimeout(timeout)
  }, [loadBackups])

  const generatedVersions = useMemo(() => versions.filter(version => version.status === 'generated'), [versions])
  const sourceConsoleUrl = previsionnelStorageConsoleUrl(sourcePath)
  const currentConsoleUrl = previsionnelStorageConsoleUrl(latestVersion?.currentStoragePath ?? PREVISIONNEL_CURRENT_STORAGE_PATH)

  async function downloadWorkbook(kind: PrevisionnelWorkbookDownloadKind, target: DownloadTarget, versionId?: string) {
    setDownloading(target)
    try {
      const result = await getPrevisionnelWorkbookDownloadUrl({
        kind,
        sourceSheet: currentPrevisionnelSheet.sheet,
        versionId,
      })
      openSignedDownload(result.url)
      setMessage(`Lien signe genere pour ${result.fileName}. Expiration: ${formatDate(result.expiresAt)}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Telechargement impossible.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F2E8DC] bg-white px-3 py-1 text-[12px] font-semibold text-[#6B6B6B]">
            <Archive className="h-3.5 w-3.5 text-[#F06B21]" />
            Cloud Storage ferme - telechargements par URL signee
          </div>
          <h1 className="text-[30px] font-bold leading-tight text-[#1E1E1E]">Sauvegardes previsionnel</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#6B6B6B]">
            Original immuable, fichier courant et checkpoints Excel historises. Les droits restent controles par Firebase Auth et le role SQL Connect.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadBackups()}
            disabled={status === 'loading'}
            className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-4 text-sm font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2] disabled:cursor-wait disabled:text-[#A3988D]"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin text-[#F06B21]" /> : <RefreshCw className="h-4 w-4 text-[#F06B21]" />}
            Rafraichir
          </button>
          <Link
            to="/previsionnel/tableur"
            className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]"
          >
            <TableProperties className="h-4 w-4" />
            Ouvrir le tableur courant
          </Link>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[16px] border border-[#F2E8DC] bg-white px-4 py-3 text-[12px] text-[#6B6B6B]">
        <span
          className="inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 font-semibold"
          style={{
            backgroundColor: status === 'ready' ? '#E6F4EA' : status === 'loading' ? '#FFF4EA' : '#FAF6F2',
            color: status === 'ready' ? '#1E8E3E' : status === 'loading' ? '#F06B21' : '#6B6B6B',
          }}
        >
          <Cloud className="h-4 w-4" />
          {status === 'ready' ? 'Source SQL Connect' : status === 'loading' ? 'Lecture SQL' : 'Non disponible'}
        </span>
        <span>{message}</span>
        <span className="ml-auto inline-flex items-center gap-2 font-semibold text-[#1E1E1E]">
          <ShieldCheck className="h-4 w-4 text-[#F06B21]" />
          Storage non public
        </span>
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#FDEBDD] text-[#F06B21]">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Original</h2>
              <p className="text-[12px] text-[#6B6B6B]">Source immuable importee</p>
            </div>
          </div>
          <p className="mt-4 break-all text-[12px] font-semibold text-[#1E1E1E]">{sourcePath}</p>
          <p className="mt-2 break-all text-[11px] text-[#6B6B6B]">SHA-256: {sourceHash ?? 'Non renseigne'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void downloadWorkbook('original', 'original')}
              disabled={downloading === 'original'}
              className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[#1E1E1E] px-3 text-[12px] font-semibold text-white hover:bg-[#3C3C3C] disabled:cursor-wait disabled:bg-[#C8B18C]"
            >
              {downloading === 'original' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Telecharger
            </button>
            {sourceConsoleUrl && (
              <a
                href={sourceConsoleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
              >
                <ExternalLink className="h-4 w-4 text-[#F06B21]" />
                Console Storage
              </a>
            )}
          </div>
        </section>

        <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5 xl:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#FDEBDD] text-[#F06B21]">
              <Cloud className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Courant</h2>
              <p className="text-[12px] text-[#6B6B6B]">Derniere version officielle generee depuis le tableur SQL</p>
            </div>
            {latestVersion && (
              <span className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold ${statusTone(latestVersion.status)}`}>
                {latestVersion.status}
              </span>
            )}
          </div>
          <div className="mt-4 grid gap-3 text-[12px] md:grid-cols-2">
            <p>
              <span className="font-semibold text-[#6B6B6B]">Libelle</span>
              <br />
              <span className="font-semibold text-[#1E1E1E]">{latestVersion?.label ?? 'Sans libelle'}</span>
            </p>
            <p>
              <span className="font-semibold text-[#6B6B6B]">Genere par</span>
              <br />
              <span className="font-semibold text-[#1E1E1E]">{actorName(latestVersion)}</span>
            </p>
            <p>
              <span className="font-semibold text-[#6B6B6B]">Date</span>
              <br />
              <span className="font-semibold text-[#1E1E1E]">{formatDate(latestVersion?.generatedAt)}</span>
            </p>
            <p>
              <span className="font-semibold text-[#6B6B6B]">Fichier courant</span>
              <br />
              <span className="break-all font-semibold text-[#1E1E1E]">{latestVersion?.currentStoragePath ?? PREVISIONNEL_CURRENT_STORAGE_PATH}</span>
            </p>
          </div>
          <p className="mt-3 break-all text-[11px] text-[#6B6B6B]">SHA-256: {latestVersion?.sha256 ?? 'Non genere'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void downloadWorkbook('current', 'current')}
              disabled={!latestVersion || downloading === 'current'}
              className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[#1E1E1E] px-3 text-[12px] font-semibold text-white hover:bg-[#3C3C3C] disabled:cursor-not-allowed disabled:bg-[#C8B18C]"
            >
              {downloading === 'current' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Telecharger courant
            </button>
            {currentConsoleUrl && (
              <a
                href={currentConsoleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
              >
                <ExternalLink className="h-4 w-4 text-[#F06B21]" />
                Console Storage
              </a>
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F2E8DC] px-5 py-3">
          <History className="h-4 w-4 text-[#F06B21]" />
          <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Checkpoints historises</h2>
          <span className="ml-auto text-[12px] text-[#6B6B6B]">
            {generatedVersions.length} version(s) telechargeable(s) sur {versions.length} ligne(s)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left text-[12px]">
            <thead className="bg-[#FAF6F2] text-[#6B6B6B]">
              <tr>
                <th className="border-b border-[#F2E8DC] px-4 py-3 font-semibold">Date</th>
                <th className="border-b border-[#F2E8DC] px-4 py-3 font-semibold">Libelle</th>
                <th className="border-b border-[#F2E8DC] px-4 py-3 font-semibold">Auteur</th>
                <th className="border-b border-[#F2E8DC] px-4 py-3 font-semibold">Statut</th>
                <th className="border-b border-[#F2E8DC] px-4 py-3 font-semibold">Poids</th>
                <th className="border-b border-[#F2E8DC] px-4 py-3 font-semibold">Hash</th>
                <th className="border-b border-[#F2E8DC] px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map(version => {
                const consoleUrl = previsionnelStorageConsoleUrl(version.storagePath)
                const isLatest = latestVersion?.id === version.id
                return (
                  <tr key={version.id} className="align-top hover:bg-[#FFF9F4]">
                    <td className="border-b border-[#F2E8DC] px-4 py-3 font-semibold text-[#1E1E1E]">{formatDate(version.generatedAt ?? version.dateCreation)}</td>
                    <td className="max-w-[240px] border-b border-[#F2E8DC] px-4 py-3">
                      <p className="font-semibold text-[#1E1E1E]">{version.label ?? 'Sans libelle'}</p>
                      <p className="mt-1 break-all text-[11px] text-[#6B6B6B]">{version.storagePath}</p>
                    </td>
                    <td className="border-b border-[#F2E8DC] px-4 py-3 text-[#6B6B6B]">{actorName(version)}</td>
                    <td className="border-b border-[#F2E8DC] px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(version.status)}`}>
                        {isLatest ? 'current' : version.status}
                      </span>
                    </td>
                    <td className="border-b border-[#F2E8DC] px-4 py-3 text-[#6B6B6B]">{formatBytes(version.sizeBytes)}</td>
                    <td className="max-w-[150px] border-b border-[#F2E8DC] px-4 py-3">
                      <span className="break-all font-mono text-[11px] text-[#6B6B6B]">{version.sha256 ? version.sha256.slice(0, 16) : 'Non genere'}</span>
                    </td>
                    <td className="border-b border-[#F2E8DC] px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {isLatest && (
                          <Link
                            to="/previsionnel/tableur"
                            className="inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-[#F2E8DC] bg-white px-2.5 text-[11px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
                          >
                            <TableProperties className="h-3.5 w-3.5 text-[#F06B21]" />
                            Tableur
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => void downloadWorkbook('version', version.id, version.id)}
                          disabled={version.status !== 'generated' || downloading === version.id}
                          className="inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-[#1E1E1E] px-2.5 text-[11px] font-semibold text-white hover:bg-[#3C3C3C] disabled:cursor-not-allowed disabled:bg-[#C8B18C]"
                        >
                          {downloading === version.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                          XLSX
                        </button>
                        {consoleUrl && (
                          <a
                            href={consoleUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-[#F2E8DC] bg-white px-2.5 text-[11px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-[#F06B21]" />
                            GCS
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {versions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#6B6B6B]">
                    Aucun checkpoint Excel Storage connu pour {currentPrevisionnelSheet.sheet}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
