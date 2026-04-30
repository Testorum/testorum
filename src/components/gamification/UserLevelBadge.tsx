'use client'

import { Link } from '@/i18n/navigation'

interface Props {
  level: number
  streak?: number
  className?: string
}

export function UserLevelBadge({ level, streak, className = '' }: Props) {
  return (
    <Link
      href="/profile"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all active:scale-95 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FF4F4F10, #FF4F4F20)',
        color: '#FF4F4F',
        border: '1px solid #FF4F4F25',
      }}
    >
      <span>Lv.{level}</span>
      {streak !== undefined && streak > 0 && (
        <span className="flex items-center gap-0.5">
          🔥{streak}
        </span>
      )}
    </Link>
  )
}
