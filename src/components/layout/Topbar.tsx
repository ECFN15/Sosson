import { Bell, Plus, Search } from 'lucide-react'

/**
 * Top bar desktop — spec canonique `design-tokens.md` §7.2.
 * - h-16 fond blanc, bordure bas `#F2E8DC`.
 * - Recherche globale en pill centrée (460px), placeholder `Cmd + K`.
 * - Bouton cloche rond avec badge orange (notifications).
 * - CTA générique "+ Nouveau" anthracite (CTA orange = réservé à l'action spécifique de chaque page).
 */
export function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-[#F2E8DC] flex items-center justify-between gap-6 px-6 shrink-0">
      {/* Spacer gauche (équilibre avec les actions droites pour centrer la recherche) */}
      <div className="w-[140px]" aria-hidden="true" />

      {/* Recherche globale */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-[460px] max-w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B] pointer-events-none"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Rechercher (Cmd + K)"
            className="w-full bg-[#FAF6F2] border border-[#F2E8DC] rounded-full pl-10 pr-4 py-2 text-sm text-[#1E1E1E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20 focus:border-[#F06B21] transition"
            aria-label="Recherche globale"
          />
        </div>
      </div>

      {/* Actions droites */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-full hover:bg-[#FAF6F2] flex items-center justify-center text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors"
        >
          <Bell className="w-5 h-5" strokeWidth={1.75} />
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#F06B21] text-white text-[9px] font-bold rounded-full px-1 flex items-center justify-center">
            3
          </span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-[#1E1E1E] hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-[12px] active:scale-[0.98] transition"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Nouveau
        </button>
      </div>
    </header>
  )
}
