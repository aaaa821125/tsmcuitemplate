import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

interface MetricCardProps {
  icon: LucideIcon
  categoryLabel: string
  metricLabel: string
  /** 右上角操作/連結區(例如「查看明細」) */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Overview 卡片外殼 — 對齊 apps/template DashboardPage 的 metric-card baseline
 * (rounded-lg border-divider bg-surface + layout-space padding)。
 */
export function MetricCard({ icon: Icon, categoryLabel, metricLabel, action, children, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-divider bg-surface p-[var(--layout-space-loose)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-[var(--layout-space-tight)]">
        <div className="flex items-center gap-[var(--layout-space-tight)] min-w-0">
          <Icon size={16} className="text-fg-muted shrink-0" aria-hidden />
          <span className="text-caption text-fg-secondary truncate">{categoryLabel}</span>
        </div>
        {action}
      </div>
      <p className="text-body font-medium text-foreground mt-[var(--layout-space-tight)]">{metricLabel}</p>
      <div className="mt-[var(--layout-space-tight)] flex-1">{children}</div>
    </div>
  )
}
