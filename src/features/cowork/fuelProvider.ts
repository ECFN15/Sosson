import type { Chantier } from '@/data/chantiers'

export type FuelStation = {
  id: string
  name: string
  address: string
  dieselPrice: number
  distanceKm: number
  routeImpact: 'near_site' | 'on_route' | 'near_depot'
  updatedAt: string
  source: 'api' | 'mock'
}

export type FuelSearchInput = {
  chantier: Chantier | null
  depotAddress: string
}

const fallbackStations: FuelStation[] = [
  {
    id: 'mock-station-route-1',
    name: 'Station route atelier',
    address: 'Peripherie Valence',
    dieselPrice: 1.71,
    distanceKm: 2.4,
    routeImpact: 'on_route',
    updatedAt: 'Simulation locale',
    source: 'mock',
  },
  {
    id: 'mock-station-site-1',
    name: 'Station proche chantier',
    address: 'Secteur client',
    dieselPrice: 1.74,
    distanceKm: 1.1,
    routeImpact: 'near_site',
    updatedAt: 'Simulation locale',
    source: 'mock',
  },
  {
    id: 'mock-station-depot-1',
    name: 'Station proche entrepot',
    address: 'Depart depot',
    dieselPrice: 1.78,
    distanceKm: 0.8,
    routeImpact: 'near_depot',
    updatedAt: 'Simulation locale',
    source: 'mock',
  },
]

function normalizeStation(value: unknown): FuelStation | null {
  if (typeof value !== 'object' || value === null) return null
  const source = value as Partial<FuelStation>
  if (!source.id || !source.name || !source.address || typeof source.dieselPrice !== 'number') return null

  return {
    id: source.id,
    name: source.name,
    address: source.address,
    dieselPrice: source.dieselPrice,
    distanceKm: Number(source.distanceKm ?? 0),
    routeImpact: source.routeImpact === 'near_site' || source.routeImpact === 'near_depot' ? source.routeImpact : 'on_route',
    updatedAt: source.updatedAt ?? new Date().toISOString(),
    source: 'api',
  }
}

export async function loadFuelStations(input: FuelSearchInput) {
  const apiUrl = import.meta.env.VITE_COWORK_FUEL_API_URL
  if (apiUrl && input.chantier) {
    try {
      const url = new URL(apiUrl)
      url.searchParams.set('destination', input.chantier.adresse)
      url.searchParams.set('origin', input.depotAddress)
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json()
      const rows: unknown[] = Array.isArray(payload) ? payload : Array.isArray(payload.stations) ? payload.stations : []
      const stations = rows.map(normalizeStation).filter((station): station is FuelStation => Boolean(station))
      if (stations.length) {
        return {
          source: 'api' as const,
          stations: stations.sort((a, b) => a.dieselPrice - b.dieselPrice),
          message: 'Prix gasoil lus depuis le provider configure.',
        }
      }
    } catch (error) {
      console.info('Provider gasoil Cowork indisponible, fallback local.', error)
    }
  }

  return {
    source: 'mock' as const,
    stations: fallbackStations,
    message: "Simulation locale: aucun provider gasoil reel n'est configure.",
  }
}
