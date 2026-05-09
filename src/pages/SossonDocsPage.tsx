import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Code2, FileText, Link as LinkIcon, Server, ShieldCheck } from 'lucide-react'
import { previsionnelClients, previsionnelLines, previsionnelSheetAudit, previsionnelSource } from '@/data/previsionnel'

const chapters = [
  { id: 'resume', label: 'Résumé' },
  { id: 'excel', label: 'Excel' },
  { id: 'clients', label: 'Clients' },
  { id: 'analytics', label: 'Statistiques' },
  { id: 'firebase', label: 'Firebase' },
  { id: 'couts', label: 'Coûts' },
  { id: 'suite', label: 'Suite' },
]

function sourceBlock(title: string, children: React.ReactNode) {
  return (
    <details className="mt-4 rounded-[8px] border border-[#EADBC8] bg-[#FAF6F2] p-4">
      <summary className="cursor-pointer text-[13px] font-semibold text-[#1E1E1E]">{title}</summary>
      <div className="mt-3 overflow-x-auto text-[12px] leading-6 text-[#3C3C3C]">{children}</div>
    </details>
  )
}

export function SossonDocsPage() {
  const [active, setActive] = useState(chapters[0].id)
  const auditedSheets = previsionnelSheetAudit.length
  const clientCount = previsionnelClients.length
  const lineCount = previsionnelLines.length

  const resources = useMemo(
    () => [
      ['AGENTS.md', 'Référence opérationnelle du repo'],
      ['documentation.md', 'Vision produit et architecture'],
      ['docs/02-architecture.md', 'Architecture Firebase cible'],
      ['docs/09-couts.md', 'Stratégie coût bas'],
      ['dataconnect/schema/schema.gql', 'Source de vérité SQL Connect'],
      [previsionnelSource.workbook, 'Classeur prévisionnel source'],
    ],
    [],
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.4, 0.8] },
    )

    chapters.forEach(chapter => {
      const node = document.getElementById(chapter.id)
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-full bg-[#FAF6F2]">
      <div className="grid min-h-full gap-8 px-6 py-8 xl:grid-cols-[210px_minmax(0,820px)_280px] xl:px-8">
        <aside className="hidden xl:block">
          <div className="sticky top-8">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]">Chapitres</p>
            <nav className="space-y-1 border-l border-[#EADBC8]">
              {chapters.map(chapter => (
                <a
                  key={chapter.id}
                  href={`#${chapter.id}`}
                  className={`block border-l-2 px-4 py-2 text-[13px] font-semibold transition-colors ${
                    active === chapter.id
                      ? 'border-[#F06B21] text-[#1E1E1E]'
                      : 'border-transparent text-[#6B6B6B] hover:text-[#1E1E1E]'
                  }`}
                >
                  {chapter.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-8 border-b border-[#EADBC8] pb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#EADBC8] bg-white px-3 py-1 text-[12px] font-semibold text-[#6B6B6B]">
              <BookOpen className="h-3.5 w-3.5 text-[#F06B21]" />
              Documentation vivante
            </div>
            <h1 className="max-w-3xl text-[42px] font-semibold leading-[1.08] text-[#1E1E1E]">
              Avancement technique Sosson, base client et prévisionnel Excel
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#3C3C3C]">
              Cette page relie l’état du repo, le classeur historique, la stratégie Firebase et les nouvelles surfaces React. Elle sert de relais lisible entre `AGENTS.md`, le code et les décisions produit.
            </p>
          </div>

          <section id="resume" className="scroll-mt-8 border-b border-[#EADBC8] py-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F06B21]">01</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[#1E1E1E]">Résumé d’avancement</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#3C3C3C]">
              Le front conserve son squelette React/Vite et ajoute une couche prévisionnelle dérivée du classeur. L’extraction actuelle couvre {auditedSheets} onglets d’exercices, {lineCount.toLocaleString('fr-FR')} lignes utiles et {clientCount.toLocaleString('fr-FR')} clients rapprochés automatiquement.
            </p>
            {sourceBlock(
              'Décisions actives',
              <ul className="list-disc space-y-2 pl-5">
                <li>SQL Connect reste la persistance cible pour les entités métier durables.</li>
                <li>Le classeur Excel devient une source historique/import/export, pas le modèle direct de la base.</li>
                <li>Les montants affichés gardent `sourceSheet` et `sourceRow` pour audit.</li>
              </ul>,
            )}
          </section>

          <section id="excel" className="scroll-mt-8 border-b border-[#EADBC8] py-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F06B21]">02</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[#1E1E1E]">Classeur Excel</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#3C3C3C]">
              Le format récent 2025-26 est retenu comme structure d’interface : catégories à gauche, ventilation par lots, puis colonnes mensuelles `prévu` / `réalisé` d’octobre à septembre. Les cellules jaunes sont interprétées comme factures envoyées.
            </p>
            {sourceBlock(
              'Source technique',
              <pre>{`source: ${previsionnelSource.workbook}
latestStructureSheet: ${previsionnelSource.latestStructureSheet}
parser: OpenXML cached cell values
traceability: sourceSheet + sourceRow`}</pre>,
            )}
          </section>

          <section id="clients" className="scroll-mt-8 border-b border-[#EADBC8] py-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F06B21]">03</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[#1E1E1E]">Base client</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#3C3C3C]">
              Les noms de chantier du classeur sont traités comme noms clients source, puis rapprochés par clé normalisée. Un même client peut donc apparaître sur plusieurs exercices et plusieurs lignes chantier, avec conservation des alias originaux.
            </p>
            {sourceBlock(
              'Modèle recommandé SQL Connect',
              <pre>{`Client
  id, nomCanonique, type, contact, aliasesExcel[]

Chantier
  id, clientId, nomSource, exercice, typeLigne, sourceSheet, sourceRow

PrevisionnelMensuel
  chantierId, exercice, moisFiscal, montantPrevu, montantRealise, factureEnvoyee`}</pre>,
            )}
          </section>

          <section id="analytics" className="scroll-mt-8 border-b border-[#EADBC8] py-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F06B21]">04</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[#1E1E1E]">Statistiques</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#3C3C3C]">
              Les métriques React croisent CA prévisionnel, contrat, réalisé, ventilation par lots, catégories chantier et portefeuille client. Les pages évitent les KPI décoratifs : chaque graphe utilise une source chiffrée extraite.
            </p>
            {sourceBlock(
              'Calculs front',
              <pre>{`src/data/previsionnel.ts
src/lib/previsionnelAnalytics.ts
src/pages/PrevisionnelPage.tsx
src/pages/StatistiquesPage.tsx`}</pre>,
            )}
          </section>

          <section id="firebase" className="scroll-mt-8 border-b border-[#EADBC8] py-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F06B21]">05</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[#1E1E1E]">Firebase et SQL Connect</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#3C3C3C]">
              La cible reste Firebase Auth + Hosting + Storage + SQL Connect/Postgres. Firestore peut rester utile pour du temps réel léger ou du transitoire, mais le cœur relationnel clients/chantiers/factures/prévisionnel doit aller vers SQL Connect.
            </p>
            {sourceBlock(
              'Garde-fous',
              <ul className="list-disc space-y-2 pl-5">
                <li>Ne pas modifier les SDK générés.</li>
                <li>Déployer et valider en sandbox avant production.</li>
                <li>Stocker les fichiers dans Storage, pas en SQL.</li>
                <li>Ajouter des index avant les vues analytiques persistées.</li>
              </ul>,
            )}
          </section>

          <section id="couts" className="scroll-mt-8 border-b border-[#EADBC8] py-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F06B21]">06</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[#1E1E1E]">Optimisation des coûts</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#3C3C3C]">
              Le coût fixe principal est Cloud SQL. Hosting et Auth restent faibles aux volumes d’une PME interne. Les coûts variables à surveiller sont les photos HD dans Storage et les futurs traitements IA.
            </p>
            {sourceBlock(
              'Règles coût bas',
              <pre>{`- Prod seule en Cloud SQL 24/7
- Sandbox locale/emulateurs quand possible
- Photos: thumbnails + HD à la demande
- Storage Archive pour chantiers clos
- Requêtes SQL Connect paginées
- Budgets GCP 50/80/100/150/200%`}</pre>,
            )}
          </section>

          <section id="suite" className="scroll-mt-8 py-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F06B21]">07</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[#1E1E1E]">Prochaines étapes</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#3C3C3C]">
              La prochaine étape robuste consiste à transformer cette extraction front en pipeline contrôlé : import sandbox, validation comptable, puis tables SQL Connect dédiées au prévisionnel mensuel et aux alias clients.
            </p>
            {sourceBlock(
              'Checklist',
              <ol className="list-decimal space-y-2 pl-5">
                <li>Valider les rapprochements clients avec l’entreprise.</li>
                <li>Créer les tables SQL Connect prévisionnel si la saisie devient persistante.</li>
                <li>Remplacer l’export `.xls` navigateur par un service template `.xlsx` strict.</li>
                <li>Ajouter une validation automatique des totaux par exercice.</li>
              </ol>,
            )}
          </section>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-8 space-y-4">
            <div className="rounded-[8px] border border-[#EADBC8] bg-white p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]">Ressources</p>
              <div className="space-y-3">
                {resources.map(([path, detail]) => (
                  <div key={path} className="border-t border-[#F2E8DC] pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1E1E1E]">
                      <LinkIcon className="h-3.5 w-3.5 text-[#F06B21]" />
                      {path}
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-[#6B6B6B]">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[8px] border border-[#EADBC8] bg-[#1E1E1E] p-4 text-white">
              <p className="text-[12px] font-semibold text-[#F06B21]">Statut</p>
              <div className="mt-4 space-y-3 text-[12px] text-white/75">
                <p className="flex items-center gap-2"><FileText className="h-4 w-4" /> Extraction Excel créée</p>
                <p className="flex items-center gap-2"><Code2 className="h-4 w-4" /> Pages React raccordées</p>
                <p className="flex items-center gap-2"><Server className="h-4 w-4" /> SQL Connect cible</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Prod à valider plus tard</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
