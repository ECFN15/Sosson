import {
  previsionnelClients,
  previsionnelExercises,
  type PrevisionnelCategory,
  type PrevisionnelExercise,
  type PrevisionnelLine,
} from '@/data/previsionnel'
import { operationalPrevisionnelLines } from '@/lib/previsionnelModel'

export const categoryLabels: Record<PrevisionnelCategory, string> = {
  maison: 'Maison',
  extension: 'Extension',
  charpente: 'Charpente',
  couverture: 'Couverture',
  divers: 'Divers',
  renovation: 'Rénovation',
  non_classe: 'Non classé',
}

export const categoryColors: Record<PrevisionnelCategory, string> = {
  maison: '#DC2626',
  extension: '#B45AA0',
  charpente: '#2563EB',
  couverture: '#6B7280',
  divers: '#1E1E1E',
  renovation: '#1E8E3E',
  non_classe: '#C8B18C',
}

export const lotLabels: Record<string, string> = {
  etude: 'Étude',
  suivi: 'Suivi',
  ossature: 'Ossature',
  charpente: 'Charpente',
  menuiserie: 'Menuiserie',
  bardage: 'Bardage',
  isolation: 'Isolation',
  platrerie: 'Plâtrerie',
  terrasse: 'Terrasse',
  vmc: 'VMC',
  divers: 'Divers',
  couverture: 'Couverture',
  echafaudage: 'Échafaudage',
  tri_dechets: 'Tri déchets',
  etancheite: 'Étanchéité',
}

export function euro(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} €`
}

export function percent(value: number) {
  if (!Number.isFinite(value)) return '0%'
  return `${value > 0 ? '+' : ''}${value.toFixed(1).replace('.', ',')}%`
}

export function amountBase(exercise: PrevisionnelExercise) {
  return exercise.caPrevision || exercise.plannedTotal || exercise.caContrat
}

function aggregateExercises(lines: PrevisionnelLine[]): PrevisionnelExercise[] {
  const grouped = new Map<string, PrevisionnelExercise>()

  lines.forEach(line => {
    const exercise = grouped.get(line.exercise) ?? {
      sheet: line.sourceSheet,
      exercise: line.exercise,
      lineCount: 0,
      chantierCount: 0,
      caPrevision: 0,
      caContrat: 0,
      plannedTotal: 0,
      realizedTotal: 0,
      invoicedTotal: 0,
      monthly: [],
      categories: [],
      lotTotals: {},
    }

    exercise.lineCount += 1
    exercise.chantierCount += line.lineType === 'chantier' ? 1 : 0
    exercise.caPrevision += line.caPrevision
    exercise.caContrat += line.caContrat
    exercise.plannedTotal += line.plannedTotal
    exercise.realizedTotal += line.realizedTotal
    exercise.invoicedTotal += line.invoicedTotal

    const monthly = new Map(exercise.monthly.map(month => [month.order, month]))
    line.monthly.forEach(month => {
      const item = monthly.get(month.order) ?? { ...month, planned: 0, realized: 0, invoiceSent: false, gap: 0 }
      item.planned += month.planned
      item.realized += month.realized
      item.invoiceSent = Boolean(item.invoiceSent || month.invoiceSent)
      item.gap = item.realized - item.planned
      monthly.set(month.order, item)
    })
    exercise.monthly = Array.from(monthly.values()).sort((a, b) => a.order - b.order)

    const category = exercise.categories.find(item => item.category === line.category)
    if (category) {
      category.planned += line.plannedTotal || line.caPrevision || line.caContrat
      category.realized += line.realizedTotal
      category.count += 1
    } else {
      exercise.categories.push({
        category: line.category,
        planned: line.plannedTotal || line.caPrevision || line.caContrat,
        realized: line.realizedTotal,
        count: 1,
      })
    }

    Object.entries(line.lots).forEach(([key, value]) => {
      exercise.lotTotals[key] = (exercise.lotTotals[key] ?? 0) + value
    })

    grouped.set(line.exercise, exercise)
  })

  return Array.from(grouped.values()).sort((a, b) => a.exercise.localeCompare(b.exercise))
}

export const cleanPrevisionnelExercises = aggregateExercises(operationalPrevisionnelLines)

export function latestExercise() {
  return cleanPrevisionnelExercises[cleanPrevisionnelExercises.length - 1] ?? previsionnelExercises[previsionnelExercises.length - 1]
}

export function getExerciseLines(sheet: string) {
  return operationalPrevisionnelLines.filter(line => line.sourceSheet === sheet)
}

export function getChantierLines(sheet: string) {
  return getExerciseLines(sheet).filter(line => line.lineType === 'chantier')
}

export function realizationRate(exercise: PrevisionnelExercise) {
  const base = amountBase(exercise)
  return base > 0 ? (exercise.realizedTotal / base) * 100 : 0
}

export function annualTrendData() {
  return cleanPrevisionnelExercises.map(exercise => ({
    exercise: exercise.exercise,
    prevision: Math.round(amountBase(exercise)),
    contrat: Math.round(exercise.caContrat),
    realise: Math.round(exercise.realizedTotal),
    taux: Math.round(realizationRate(exercise)),
  }))
}

export function growthData() {
  return cleanPrevisionnelExercises.map((exercise, index) => {
    const previous = cleanPrevisionnelExercises[index - 1]
    const currentValue = exercise.realizedTotal || amountBase(exercise)
    const previousValue = previous ? previous.realizedTotal || amountBase(previous) : 0
    const growth = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
    return {
      exercise: exercise.exercise,
      value: Math.round(currentValue),
      growth: Number(growth.toFixed(2)),
    }
  })
}

export function bestAndWorstYears() {
  const growth = growthData().slice(1)
  const bestGrowth = growth.reduce((best, item) => (item.growth > best.growth ? item : best), growth[0])
  const worstGrowth = growth.reduce((worst, item) => (item.growth < worst.growth ? item : worst), growth[0])
  const byValue = [...growthData()].sort((a, b) => a.value - b.value)

  return {
    bestGrowth,
    worstGrowth,
    lowestYear: byValue[0],
    bestYear: byValue[byValue.length - 1],
  }
}

export function latestCategoryData() {
  return latestExercise().categories.map(category => ({
    name: categoryLabels[category.category],
    category: category.category,
    planned: Math.round(category.planned),
    realized: Math.round(category.realized),
    count: category.count,
    color: categoryColors[category.category],
  }))
}

export function latestLotData(limit = 10) {
  const totals = latestExercise().lotTotals
  return Object.entries(totals)
    .map(([key, value]) => ({
      key,
      name: lotLabels[key] ?? key,
      value: Math.round(value),
    }))
    .filter(item => item.value !== 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, limit)
}

export function topPrevisionnelLines(sheet: string, limit = 12) {
  return getChantierLines(sheet)
    .map(line => ({
      ...line,
      score: Math.max(line.caPrevision, line.caContrat, line.plannedTotal, line.realizedTotal),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function topClientPortfolios(limit = 12) {
  const cleanClientIds = new Set(operationalPrevisionnelLines.map(line => line.id))

  return previsionnelClients
    .filter(client => client.lineIds.some(lineId => cleanClientIds.has(lineId)))
    .map(client => ({
      ...client,
      total: client.totalPrevision || client.totalContrat || client.totalPlanned || client.totalRealized,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

export function computeLineGap(line: PrevisionnelLine) {
  const base = line.caPrevision || line.plannedTotal || line.caContrat
  return {
    base,
    gap: line.realizedTotal - base,
    rate: base > 0 ? (line.realizedTotal / base) * 100 : 0,
  }
}
