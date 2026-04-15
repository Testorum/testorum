'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  stats: Record<string, number>
}

const STAT_LABELS: Record<string, string> = {
  charm: '매력',
  empathy: '공감',
  courage: '용기',
  patience: '인내',
  humor: '유머',
}

// 0~30 범위를 100점 만점으로 정규화
function normalize(val: number, max = 30): number {
  return Math.round((val / max) * 100)
}

export function RPGRadarChart({ stats }: Props) {
  const data = Object.entries(stats).map(([key, val]) => ({
    stat: STAT_LABELS[key] ?? key,
    value: normalize(val),
    fullMark: 100,
  }))

  return (
    <div className="w-full">
      <p className="text-sm text-gray-400 text-center mb-2">나의 연애 능력치</p>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 600 }}
          />
          <Radar
            name="능력치"
            dataKey="value"
            stroke="#f43f5e"
            fill="#f43f5e"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* 스탯 수치 표시 */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {data.map(({ stat, value }) => (
          <div
            key={stat}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-100"
          >
            <span className="text-xs text-gray-500">{stat}</span>
            <span className="text-xs font-bold text-rose-500">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
