// @story-baseline: @qijenchen/design-system/components/Empty/empty.stories.tsx#NoTasks
// (border-divider rounded-lg 容器包 Empty,icon + title + description 三段結構同 baseline;
//  本頁無 action 按鈕——尚無「建立」動作可做,細節功能待後續版本才有明確 CTA。)
import type { ReactNode } from 'react'
import { Empty } from '@qijenchen/design-system'
import { Construction } from 'lucide-react'
import {
  CATEGORY_META_BY_ID,
  COMPENSATION,
  ENGAGEMENT,
  GLOBALIZATION,
  PERFORMANCE_MANAGEMENT,
  RETENTION,
  TALENT_ACQUISITION,
  type CategoryId,
} from '../data/hr-metrics'
import { MetricCard } from '../components/MetricCard'
import { ScoreStat } from '../components/ScoreStat'
import { TrendIndicator } from '../components/TrendIndicator'
import { TurnoverTrendChart } from '../components/TurnoverTrendChart'
import { CategoryDonutChart } from '../components/CategoryDonutChart'

interface CategoryDetailPageProps {
  categoryId: CategoryId
}

function useCategoryHeadline(categoryId: CategoryId): { metricLabel: string; headline: ReactNode } {
  switch (categoryId) {
    case 'talent-acquisition':
      return {
        metricLabel: TALENT_ACQUISITION.metricLabel,
        headline: (
          <ScoreStat
            value={TALENT_ACQUISITION.score}
            suffix="/ 100"
            trend={<TrendIndicator {...TALENT_ACQUISITION.trend} />}
          />
        ),
      }
    case 'retention':
      return {
        metricLabel: RETENTION.metricLabel,
        headline: (
          <>
            <div className="flex items-baseline justify-between gap-[var(--layout-space-tight)]">
              <span className="text-h3 font-medium text-foreground">{RETENTION.latestDisplay}</span>
              <TrendIndicator {...RETENTION.trend} />
            </div>
            <div className="mt-[var(--layout-space-tight)]">
              <TurnoverTrendChart quarters={RETENTION.quarters} />
            </div>
          </>
        ),
      }
    case 'engagement':
      return {
        metricLabel: ENGAGEMENT.metricLabel,
        headline: (
          <ScoreStat value={ENGAGEMENT.score} suffix="/ 100" trend={<TrendIndicator {...ENGAGEMENT.trend} />} />
        ),
      }
    case 'performance':
      return {
        metricLabel: PERFORMANCE_MANAGEMENT.metricLabel,
        headline: (
          <>
            <CategoryDonutChart segments={PERFORMANCE_MANAGEMENT.segments} />
            <div className="mt-[var(--layout-space-tight)]">
              <TrendIndicator {...PERFORMANCE_MANAGEMENT.trend} />
            </div>
          </>
        ),
      }
    case 'globalization':
      return {
        metricLabel: GLOBALIZATION.metricLabel,
        headline: (
          <>
            <CategoryDonutChart segments={GLOBALIZATION.segments} />
            <div className="mt-[var(--layout-space-tight)]">
              <TrendIndicator {...GLOBALIZATION.trend} />
            </div>
          </>
        ),
      }
    case 'compensation':
      return {
        metricLabel: COMPENSATION.metricLabel,
        headline: (
          <ScoreStat
            value={COMPENSATION.value.toFixed(2)}
            caption={`Target: ${COMPENSATION.target.toFixed(2)}`}
            trend={<TrendIndicator {...COMPENSATION.trend} />}
          />
        ),
      }
  }
}

/**
 * 六大類別的細節頁面 shell — 目前先保留 Overview 同款關鍵指標卡片 + 施工中 Empty state,
 * 細部內容(趨勢拆解、部門/地區篩選、DataTable 等)待後續逐頁調整。
 */
export function CategoryDetailPage({ categoryId }: CategoryDetailPageProps) {
  const category = CATEGORY_META_BY_ID[categoryId]
  const { metricLabel, headline } = useCategoryHeadline(categoryId)
  return (
    <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-loose)] flex flex-col gap-[var(--layout-space-loose)]">
      <section className="max-w-sm">
        <MetricCard icon={category.icon} categoryLabel={category.label} metricLabel={metricLabel}>
          {headline}
        </MetricCard>
      </section>

      <section className="rounded-lg border border-divider bg-surface py-[var(--layout-space-loose)]">
        <Empty
          icon={Construction}
          title="細節內容建置中"
          description={`${category.label} 的完整分析(趨勢拆解、部門/地區篩選、明細資料)將於後續版本補上。`}
        />
      </section>
    </div>
  )
}
