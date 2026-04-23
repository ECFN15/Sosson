export const chantierImages = [
  '/images/chantier/chantier-structure-1.jpg',
  '/images/chantier/chantier-structure-2.jpg',
  '/images/chantier/ossature-bois-1.jpg',
  '/images/chantier/terrain-chantier-1.jpg',
  '/images/chantier/maison-bois-2.jpg',
  '/images/chantier/maison-bois-1.jpg',
  '/images/chantier/maison-exterieure-1.jpg',
  '/images/chantier/interieur-bois-1.jpg',
  '/images/chantier/materiaux-bois-1.jpg',
]

export const chantierCoverById: Record<string, string> = {
  'chantier-1': chantierImages[0],
  'chantier-2': chantierImages[1],
  'chantier-3': chantierImages[3],
  'chantier-4': chantierImages[6],
}

export function getChantierCover(id?: string | null) {
  if (!id) return chantierImages[0]
  return chantierCoverById[id] ?? chantierImages[0]
}

export function getChantierGallery(id?: string | null) {
  const cover = getChantierCover(id)
  return [cover, ...chantierImages.filter(image => image !== cover)]
}
