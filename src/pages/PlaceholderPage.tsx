import { Construction } from 'lucide-react'
import { chantierImages } from '@/data/media'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
      <div className="mb-5 h-40 w-full max-w-md overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-[#EADBC8]">
        <img src={chantierImages[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="w-14 h-14 rounded-[16px] bg-[#FDEBDD] flex items-center justify-center mb-4">
        <Construction size={24} strokeWidth={1.5} className="text-[#F06B21]" />
      </div>
      <h1 className="text-[18px] font-bold text-[#1E1E1E] mb-2">{title}</h1>
      <p className="text-[13px] text-[#6B6B6B] max-w-xs">
        Cette section est en cours de développement. Elle sera disponible prochainement.
      </p>
    </div>
  )
}
