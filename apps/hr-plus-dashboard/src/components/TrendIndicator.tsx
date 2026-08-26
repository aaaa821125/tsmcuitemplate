import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Trend } from '../data/hr-metrics'
import { cn } from '../lib/cn'

interface TrendIndicatorProps extends Trend {
  /** 比較基準文字,預設「vs 上季」 */
  compareLabel?: string
  className?: string
}

/**
 * 季度環比趨勢指示器 — 上升/下降 icon + 百分比。
 * 顏色語意跟隨業務好壞(isFavorable),而非單純方向:例如離職率下降是好消息(success),
 * 離職率上升則是壞消息(error)——不能只靠 up=綠 down=紅 這種固定映射。
 */
export function TrendIndicator({ direction, percent, isFavorable, compareLabel = 'vs 上季', className }: TrendIndicatorProps) {
  const Icon = direction === 'up' ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[var(--layout-space-tight)] text-caption font-medium',
        isFavorable ? 'text-success-text' : 'text-error-text',
        className,
      )}
    >
      <Icon size={14} aria-hidden />
      <span>
        {percent}% {compareLabel}
      </span>
    </span>
  )
}
