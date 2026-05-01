'use client'

interface Props {
  children: React.ReactNode
  accentColor?: string
}

/**
 * Wraps test/result pages with a subtle background gradient on desktop
 * to reinforce "focus mode" — content stays narrow (max-w-lg) while
 * the sides get a soft gradient.
 */
export function FocusModeWrapper({ children, accentColor = '#FF4F4F' }: Props) {
  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `linear-gradient(135deg, ${accentColor}06 0%, #FAFAF800 30%, #FAFAF800 70%, ${accentColor}06 100%)`,
      }}
    >
      {/* Subtle side fading for desktop */}
      <div
        className="hidden lg:block fixed inset-y-0 left-0 w-48 pointer-events-none z-0"
        style={{
          background: `linear-gradient(90deg, ${accentColor}08, transparent)`,
        }}
      />
      <div
        className="hidden lg:block fixed inset-y-0 right-0 w-48 pointer-events-none z-0"
        style={{
          background: `linear-gradient(270deg, ${accentColor}08, transparent)`,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
