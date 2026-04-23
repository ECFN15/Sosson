import type { SVGProps } from 'react'

type BrandVariant = 'light' | 'dark'

interface SossonBrandProps {
  variant?: BrandVariant
  showTagline?: boolean
  className?: string
}

export function SossonLogoIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 186 166"
      fill="none"
      stroke="currentColor"
      strokeWidth={8}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit={10}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <polyline points="22 117 22 73 97 18 168 67 168 161" />
      <path d="M10 117H97" />
      <path d="M97 18V147" />
      <path d="M123 35V152" />
      <path d="M145 50V157" />
    </svg>
  )
}

export function SossonBrand({
  variant = 'light',
  showTagline = true,
  className,
}: SossonBrandProps) {
  const titleColor = variant === 'light' ? '#FFFFFF' : '#1E1E1E'

  return (
    <div className={['flex items-center gap-[18px]', className].filter(Boolean).join(' ')}>
      <SossonLogoIcon className="h-[60px] w-[67px] shrink-0 text-[#F06B21]" />

      <div className="min-w-0 leading-none">
        <p
          className="font-semibold uppercase"
          style={{
            color: titleColor,
            fontFamily: '"Inter Tight", "Inter", system-ui, sans-serif',
            fontSize: 21,
            letterSpacing: '0.14em',
            lineHeight: 1,
          }}
        >
          SOSSON
        </p>

        {showTagline && (
          <p
            className="mt-[7px] font-semibold uppercase text-[#F06B21]"
            style={{
              fontFamily: '"Inter Tight", "Inter", system-ui, sans-serif',
              fontSize: 10.5,
              letterSpacing: '0.17em',
              lineHeight: 1,
            }}
          >
            MAISON BOIS
          </p>
        )}
      </div>
    </div>
  )
}
