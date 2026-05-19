import { previsionnelLines, type PrevisionnelLine } from '@/data/previsionnel'
import type { Chantier, StatutChantier, TendanceChantier } from '@/data/chantiers'
import type { Client } from '@/data/clients'

const syntheticLinePatterns = [
  /\bcumul\b/i,
  /\btotal\b/i,
  /\btotaux\b/i,
  /\bsous[-\s]?total\b/i,
  /\bca\s+r[ée]alis[ée]\b/i,
  /\breste\s+[aà]\s+facturer\b/i,
  /\bfacturation\s+globale\b/i,
]

function normalizeId(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isSyntheticName(line: PrevisionnelLine) {
  const value = `${line.rawName} ${line.clientName}`.trim()
  return syntheticLinePatterns.some(pattern => pattern.test(value))
}

export function isOperationalPrevisionnelLine(line: PrevisionnelLine) {
  if (line.lineType !== 'chantier') return false
  if (!line.clientName.trim()) return false
  if (isSyntheticName(line)) return false

  const amount = Math.max(line.caPrevision, line.caContrat, line.plannedTotal, line.realizedTotal)
  return amount > 0 || line.monthly.some(month => month.planned || month.realized)
}

export const operationalPrevisionnelLines = previsionnelLines.filter(isOperationalPrevisionnelLine)

function exerciseStartYear(exercise: string) {
  const parsed = Number(exercise.slice(0, 4))
  return Number.isFinite(parsed) ? parsed : new Date().getFullYear()
}

function monthStartDate(exercise: string, monthOrder: number) {
  const startYear = exerciseStartYear(exercise)
  const monthByOrder = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
  const month = monthByOrder[Math.max(0, Math.min(monthOrder - 1, 11))]
  const year = month >= 9 ? startYear : startYear + 1
  return new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
}

function addMonths(date: string, months: number) {
  const current = new Date(`${date}T00:00:00.000Z`)
  current.setUTCMonth(current.getUTCMonth() + months)
  return current.toISOString().slice(0, 10)
}

function chantierStatus(line: PrevisionnelLine): StatutChantier {
  if (line.exercise === '2025-26') return line.realizedTotal > 0 ? 'en_cours' : 'devis_a_faire'
  return 'cloture'
}

function chantierTendance(line: PrevisionnelLine): TendanceChantier {
  const budget = line.caPrevision || line.caContrat || line.plannedTotal
  if (budget <= 0) return 'orange'
  if (line.realizedTotal > budget * 1.05) return 'rouge'
  if (line.realizedTotal > budget * 0.9) return 'orange'
  return 'vert'
}

function chantierStart(line: PrevisionnelLine) {
  const firstMonth = [...line.monthly].sort((a, b) => a.order - b.order).find(month => month.planned || month.realized)
  return monthStartDate(line.exercise, firstMonth?.order ?? 1)
}

function displayClientName(line: PrevisionnelLine) {
  return line.clientName || line.rawName || line.clientKey
}

export function buildPrevisionnelClients(lines = operationalPrevisionnelLines): Client[] {
  const grouped = new Map<string, { name: string; lineIds: string[]; firstExercise: string }>()

  lines.forEach(line => {
    const key = normalizeId(line.clientKey || line.clientName)
    if (!key) return
    const existing = grouped.get(key)
    if (existing) {
      existing.lineIds.push(line.id)
      if (line.exercise < existing.firstExercise) existing.firstExercise = line.exercise
      return
    }
    grouped.set(key, {
      name: displayClientName(line),
      lineIds: [line.id],
      firstExercise: line.exercise,
    })
  })

  return Array.from(grouped.entries())
    .map(([key, item]) => ({
      id: `prev-client-${key}`,
      nom: item.name,
      type: 'particulier' as const,
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      codePostal: '',
      dateCreation: `${exerciseStartYear(item.firstExercise)}-10-01`,
      chantierIds: item.lineIds.map(id => `prev-chantier-${id.replace(/^prev-/, '')}`),
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}

export function buildPrevisionnelChantiers(lines = operationalPrevisionnelLines): Chantier[] {
  return lines
    .map(line => {
      const start = chantierStart(line)
      const budget = line.caPrevision || line.caContrat || line.plannedTotal || line.realizedTotal

      return {
        id: `prev-chantier-${line.id.replace(/^prev-/, '')}`,
        nom: `${displayClientName(line)} (${line.exercise})`,
        clientId: `prev-client-${normalizeId(line.clientKey || line.clientName)}`,
        statut: chantierStatus(line),
        dateDebut: start,
        dateFin: line.exercise === '2025-26' ? null : addMonths(start, Math.max(line.monthly.length, 1)),
        dateFinPrevue: addMonths(start, Math.max(line.monthly.length, 1)),
        budgetPrevisionnel: Math.round(budget),
        depensesEngagees: Math.round(line.realizedTotal),
        description: [
          `Source Excel ${line.sourceSheet}, ligne ${line.sourceRow}.`,
          `Categorie: ${line.category}.`,
          line.monthly.some(month => month.invoiceSent) ? 'Au moins une cellule jaune indique une facture envoyee.' : '',
        ]
          .filter(Boolean)
          .join(' '),
        adresse: '',
        chefChantier: '',
        tendance: chantierTendance(line),
        factureIds: [],
        emailIds: [],
      }
    })
    .sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
}

export function previsionnelDataCoverage() {
  const exercises = new Set(operationalPrevisionnelLines.map(line => line.exercise))
  const invoiceSentLines = operationalPrevisionnelLines.filter(line => line.monthly.some(month => month.invoiceSent))

  return {
    sourceLines: previsionnelLines.length,
    operationalLines: operationalPrevisionnelLines.length,
    syntheticOrNonOperationalLines: previsionnelLines.length - operationalPrevisionnelLines.length,
    clients: buildPrevisionnelClients().length,
    exercises: exercises.size,
    invoiceSentLines: invoiceSentLines.length,
    invoiceSentCells: operationalPrevisionnelLines.reduce(
      (sum, line) => sum + line.monthly.filter(month => month.invoiceSent).length,
      0,
    ),
  }
}
