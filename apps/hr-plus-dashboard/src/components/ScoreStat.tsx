import type { ReactNode } from 'react'

interface ScoreStatProps {
  value: ReactNode
  /** 分母 / 單位,例如 "/ 100" */
  suffix?: ReactNode
  /** 小字附註,例如 "Target: 1.00" */
  caption?: ReactNode
  trend?: ReactNode
}

/**
 * 單一大數字 KPI 呈現(H/C Fulfillment Gap、Engagement Survey score、Compa-ratio)。
 * 對齊 chart.spec.md「何時不用 Chart」:單值 KPI 用純文字 / Badge,不畫成圖表。
 */
export function ScoreStat({ value, suffix, caption, trend }: ScoreStatProps) {
  return (
    <div>
      <div className="flex items-baseline gap-[var(--layout-space-tight)]">
        <span className="text-h2 font-medium text-foreground">{value}</span>
        {suffix && <span className="text-body text-fg-secondary">{suffix}</span>}
      </div>
      {caption && <p className="text-caption text-fg-muted mt-[var(--layout-space-tight)]">{caption}</p>}
      {trend && <div className="mt-[var(--layout-space-tight)]">{trend}</div>}
    </div>
  )
}
