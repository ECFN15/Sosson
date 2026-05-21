import {
  AlertTriangle,
  ArchiveRestore,
  CheckCircle2,
  Cloud,
  Database,
  HardDrive,
  Layers3,
  LockKeyhole,
  Server,
  ShieldCheck,
  Terminal,
  XCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'

type StatusTone = 'ready' | 'partial' | 'blocked'

const statusStyles: Record<StatusTone, string> = {
  ready: 'border-[#D8E8D8] bg-[#F3FAF3] text-[#265C2F]',
  partial: 'border-[#F2E8DC] bg-[#FFF8F1] text-[#8A4A12]',
  blocked: 'border-[#F3D1C5] bg-[#FFF1EC] text-[#A43D1C]',
}

const environments = [
  {
    icon: HardDrive,
    title: 'Émulateur local',
    description: 'Copie locale jetable pour tester les seeds, mutations, lectures et RBAC sans toucher à Firebase.',
    status: 'Checkpoint complet OK avec PGlite temporaire sur E:; C: reste trop plein pour un rejeu confortable.',
    tone: 'partial' as StatusTone,
  },
  {
    icon: Cloud,
    title: 'Sandbox Firebase',
    description: 'Vrai environnement de test sur le projet sosson-sandbox, avec Cloud SQL PostgreSQL.',
    status: 'Service et connecteur existent; sauvegardes et protections Cloud SQL à durcir.',
    tone: 'partial' as StatusTone,
  },
  {
    icon: LockKeyhole,
    title: 'Production hors scope',
    description: 'Aucune commande production maintenant. Le seul objectif est de rapprocher la sandbox d’un usage réel.',
    status: 'À ignorer pour cette étape: on prépare uniquement sosson-sandbox.',
    tone: 'partial' as StatusTone,
  },
]

const rules = [
  'Ne jamais lancer de commande production pendant cette étape.',
  'Ne jamais lancer un seed sandbox réel sans validation humaine explicite.',
  'Ne jamais modifier les SDKs SQL Connect générés à la main.',
  'Ne jamais dire qu’une donnée est sauvegardée si elle existe seulement en fallback local.',
  'Toujours écrire puis relire en SQL pour prouver une vraie persistance.',
]

const checks = [
  { label: 'Service SQL Connect sandbox', value: 'Présent', tone: 'ready' as StatusTone },
  { label: 'Connecteur sosson', value: 'Présent', tone: 'ready' as StatusTone },
  { label: 'Backups Cloud SQL sandbox', value: 'Désactivés', tone: 'blocked' as StatusTone },
  { label: 'Haute disponibilité', value: 'ZONAL seulement', tone: 'partial' as StatusTone },
  { label: 'Protection suppression', value: 'Désactivée', tone: 'blocked' as StatusTone },
  { label: 'Émulateur complet', value: 'OK local', tone: 'ready' as StatusTone },
]

const commands = [
  'npm run reset:dataconnect:local -- --yes-local-reset',
  'npm run emulators:dataconnect',
  'npm run checkpoint:002:emulator',
  'npm run seed:sandbox -- --dry-run --kind=all --output=tmp/checkpoint-002/seed-sandbox-dry-run.json',
  'firebase dataconnect:services:list --project sosson-sandbox',
  'gcloud sql instances describe sosson-sandbox-instance --project sosson-sandbox --format=json',
]

function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[tone]}`}>
      {children}
    </span>
  )
}

export function SqlDeploymentPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F2] px-4 py-6 text-[#1E1E1E] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        <header className="rounded-[24px] border border-[#F2E8DC] bg-white p-6 shadow-[0_16px_42px_rgba(30,30,30,0.06)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[760px]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#2A1A0D] text-[#F06B21]">
                <Database size={22} strokeWidth={1.75} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A8A8A]">Base de données</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#1E1E1E] sm:text-4xl">
                Base SQL & Déploiement
              </h1>
              <p className="mt-3 max-w-[720px] text-sm leading-6 text-[#5F5A55]">
                Cette page explique le passage contrôlé de l’émulateur SQL Connect local vers la sandbox Firebase. Une sandbox vide est normale: elle doit recevoir le schéma, les profils SQL et les seeds validés.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="ready">Émulateur prouvé</StatusPill>
              <StatusPill tone="partial">Sandbox à préparer</StatusPill>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {environments.map(item => {
            const Icon = item.icon
            return (
              <article key={item.title} className="rounded-[20px] border border-[#F2E8DC] bg-white p-5 shadow-[0_10px_30px_rgba(30,30,30,0.05)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#FAF6F2] text-[#F06B21]">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <StatusPill tone={item.tone}>{item.tone === 'ready' ? 'OK' : item.tone === 'partial' ? 'Partiel' : 'À bloquer'}</StatusPill>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-[#1E1E1E]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#5F5A55]">{item.description}</p>
                <p className="mt-4 text-sm font-semibold leading-5 text-[#1E1E1E]">{item.status}</p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[20px] border border-[#F2E8DC] bg-white p-5 shadow-[0_10px_30px_rgba(30,30,30,0.05)]">
            <div className="flex items-center gap-3">
              <Server className="text-[#F06B21]" size={21} strokeWidth={1.75} />
              <h2 className="text-lg font-semibold">Comment ça marche</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-[#1E1E1E]">PostgreSQL</p>
                <p className="mt-1 text-sm leading-6 text-[#5F5A55]">
                  C’est la vraie base relationnelle. Elle garde les clients, chantiers, factures, documents, emails indexés, planning, rapports, analytics et traces.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1E1E1E]">SQL Connect</p>
                <p className="mt-1 text-sm leading-6 text-[#5F5A55]">
                  C’est la porte contrôlée entre Firebase Auth, le front React et PostgreSQL. Les queries lisent; les mutations écrivent.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1E1E1E]">Firebase Auth</p>
                <p className="mt-1 text-sm leading-6 text-[#5F5A55]">
                  Auth donne l’identité technique. La table SQL User donne le rôle métier Sosson utilisé pour les droits serveur.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1E1E1E]">Fallback local</p>
                <p className="mt-1 text-sm leading-6 text-[#5F5A55]">
                  Utile en développement, mais ce n’est pas une sauvegarde SQL. Une vraie preuve exige écriture puis relecture en base.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[20px] border border-[#F2E8DC] bg-white p-5 shadow-[0_10px_30px_rgba(30,30,30,0.05)]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#F06B21]" size={21} strokeWidth={1.75} />
              <h2 className="text-lg font-semibold">Règles anti-perte</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {rules.map(rule => (
                <li key={rule} className="flex gap-3 text-sm leading-6 text-[#5F5A55]">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#F06B21]" size={17} strokeWidth={1.75} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5 shadow-[0_10px_30px_rgba(30,30,30,0.05)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Layers3 className="text-[#F06B21]" size={21} strokeWidth={1.75} />
              <h2 className="text-lg font-semibold">État réel observé</h2>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A8A8A]">Audit du 21 mai 2026</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {checks.map(check => (
              <div key={check.label} className="flex items-center justify-between gap-3 rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] px-4 py-3">
                <span className="text-sm font-medium text-[#1E1E1E]">{check.label}</span>
                <StatusPill tone={check.tone}>{check.value}</StatusPill>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[20px] border border-[#F2E8DC] bg-white p-5 shadow-[0_10px_30px_rgba(30,30,30,0.05)]">
            <div className="flex items-center gap-3">
              <ArchiveRestore className="text-[#F06B21]" size={21} strokeWidth={1.75} />
              <h2 className="text-lg font-semibold">Sauvegarde et reprise</h2>
            </div>
            <dl className="mt-5 space-y-4 text-sm leading-6">
              <div>
                <dt className="font-semibold text-[#1E1E1E]">Backup</dt>
                <dd className="text-[#5F5A55]">Une copie de la base à un moment donné.</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#1E1E1E]">PITR</dt>
                <dd className="text-[#5F5A55]">La capacité à revenir à un instant précis grâce aux journaux de transaction.</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#1E1E1E]">RPO / RTO</dt>
                <dd className="text-[#5F5A55]">RPO = perte maximale acceptable. RTO = temps maximal pour remettre le service.</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#1E1E1E]">Restore test</dt>
                <dd className="text-[#5F5A55]">La preuve réelle qu’un backup peut être restauré et relu.</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[20px] border border-[#F3D1C5] bg-[#FFF1EC] p-5 shadow-[0_10px_30px_rgba(30,30,30,0.05)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-[#F06B21]" size={21} strokeWidth={1.75} />
              <h2 className="text-lg font-semibold">Ce qui bloque encore</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {[
                'Libérer de l’espace sur C: ou formaliser un chemin PGlite local plus spacieux.',
                'Activer ou décider explicitement les sauvegardes sandbox avant seed réel.',
                'Valider les profils SQL User sandbox avec de vrais auth.uid Firebase.',
                'Durcir les lectures sensibles qui reposent encore surtout sur @auth.',
                'Prouver le flux Storage documents de bout en bout.',
              ].map(item => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-[#5F5A55]">
                  <XCircle className="mt-0.5 shrink-0 text-[#A43D1C]" size={17} strokeWidth={1.75} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-[20px] border border-[#F2E8DC] bg-[#1E1E1E] p-5 text-white shadow-[0_10px_30px_rgba(30,30,30,0.08)]">
          <div className="flex items-center gap-3">
            <Terminal className="text-[#F06B21]" size={21} strokeWidth={1.75} />
            <h2 className="text-lg font-semibold">Commandes clés</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {commands.map(command => (
              <code key={command} className="block overflow-x-auto rounded-[12px] border border-[#2A2A2A] bg-[#242424] px-4 py-3 text-xs text-[#FDEBDD]">
                {command}
              </code>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
