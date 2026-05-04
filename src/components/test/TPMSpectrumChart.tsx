'use client'

import { motion } from 'framer-motion'
import type { TPMResult } from '@/lib/scoring'

interface Props {
  axes: TPMResult['axes']
  locale: string
  animated?: boolean
}

// ─── Axis config ─────────────────────────────────────────

interface AxisConfig {
  key: 'drive' | 'process' | 'compass'
  label: string
  leftDir: string
  rightDir: string
  leftLabel: { en: string; ko: string }
  rightLabel: { en: string; ko: string }
  leftColor: string
  rightColor: string
}

const AXIS_CONFIGS: AxisConfig[] = [
  {
    key: 'drive',
    label: 'Drive',
    leftDir: 'observe',
    rightDir: 'ignite',
    leftLabel: { en: 'Observe', ko: '관찰' },
    rightLabel: { en: 'Ignite', ko: '점화' },
    leftColor: '#3B82F6', // blue
    rightColor: '#F59E0B', // amber
  },
  {
    key: 'process',
    label: 'Process',
    leftDir: 'prism',
    rightDir: 'pulse',
    leftLabel: { en: 'Prism', ko: '분석' },
    rightLabel: { en: 'Pulse', ko: '직관' },
    leftColor: '#8B5CF6', // purple
    rightColor: '#10B981', // green
  },
  {
    key: 'compass',
    label: 'Compass',
    leftDir: 'self',
    rightDir: 'bond',
    leftLabel: { en: 'Self', ko: '자아' },
    rightLabel: { en: 'Bond', ko: '유대' },
    leftColor: '#EF4444', // red
    rightColor: '#14B8A6', // teal
  },
]

// ─── Component ─────────────────────────────────────────────

export function TPMSpectrumChart({ axes, locale, animated = true }: Props) {
  const isKo = locale === 'ko'

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-5 py-3">
      {AXIS_CONFIGS.map((config, i) => {
        const axis = axes[config.key]
        // Calculate percentage: how far toward the right direction
        // If direction matches rightDir, use confidence directly
        // If direction matches leftDir, invert (100 - confidence)
        const rightPct = axis.direction === config.rightDir
          ? axis.confidence
          : 100 - axis.confidence
        const leftPct = 100 - rightPct

        const isRight = rightPct >= 50
        const activeColor = isRight ? config.rightColor : config.leftColor
        const activeLabel = isRight
          ? (isKo ? config.rightLabel.ko : config.rightLabel.en)
          : (isKo ? config.leftLabel.ko : config.leftLabel.en)
        const activePct = isRight ? rightPct : leftPct

        return (
          <div key={config.key}>
            {/* Axis name */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#9B9B9B' }}>
                {config.label}
              </span>
              <span className="text-[11px] font-bold" style={{ color: activeColor }}>
                {Math.round(activePct)}% {activeLabel}
              </span>
            </div>

            {/* Bar container */}
            <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#F0EDE8' }}>
              {/* Fill from center outward */}
              {isRight ? (
                <motion.div
                  className="absolute top-0 left-1/2 h-full rounded-r-full"
                  style={{ backgroundColor: activeColor }}
                  initial={animated ? { width: 0 } : undefined}
                  animate={{ width: `${(rightPct - 50) * 2}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                />
              ) : (
                <motion.div
                  className="absolute top-0 right-1/2 h-full rounded-l-full"
                  style={{ backgroundColor: activeColor }}
                  initial={animated ? { width: 0 } : undefined}
                  animate={{ width: `${(leftPct - 50) * 2}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                />
              )}

              {/* Center marker */}
              <div className="absolute top-0 left-1/2 -translate-x-px w-0.5 h-full bg-white/60" />
            </div>

            {/* Labels below bar */}
            <div className="flex justify-between mt-1">
              <span
                className="text-[10px] font-semibold"
                style={{ color: leftPct >= 50 ? config.leftColor : '#C4C4C4' }}
              >
                {isKo ? config.leftLabel.ko : config.leftLabel.en}
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: rightPct >= 50 ? config.rightColor : '#C4C4C4' }}
              >
                {isKo ? config.rightLabel.ko : config.rightLabel.en}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
