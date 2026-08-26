import {
  ATTENTION_REQUIRED,
  COMPENSATION,
  CATEGORIES,
  ENGAGEMENT,
  GLOBALIZATION,
  HR_HEALTH,
  HR_HEALTH_ICON,
  LAST_UPDATED_LOG,
  PERFORMANCE_MANAGEMENT,
  RETENTION,
  TALENT_ACQUISITION,
} from '../data/hr-metrics'
import { MetricCard } from '../components/MetricCard'
import { ScoreStat } from '../components/ScoreStat'
import { TrendIndicator } from '../components/TrendIndicator'
import { TurnoverTrendChart } from '../components/TurnoverTrendChart'
import { CategoryDonutChart } from '../components/CategoryDonutChart'
import { ScoreDonutChart } from '../components/ScoreDonutChart'
import { SectionCard } from '../components/SectionCard'
import { AttentionRequiredList } from '../components/AttentionRequiredList'
import { LastUpdatedLog } from '../components/LastUpdatedLog'

const [talentAcquisitionMeta, retentionMeta, engagementMeta, performanceMeta, globalizationMeta, compensationMeta] =
  CATEGORIES

export function OverviewPage() {
  return (
    <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-loose)] flex flex-col gap-[var(--layout-space-loose)]">
      <section>
        <h1 className="text-h4">HR Plus Dashboard — Overview</h1>
        <p className="text-body text-fg-secondary mt-[var(--layout-space-tight)]">
          展示人力資源在業務上的關鍵數據,協助 CEO、功能主管與 HR 在線上會議或理事會會議中即時掌握成果並制定行動。
        </p>
      </section>

      {/* HR Health 綜合分數 — banner card */}
      <section className="rounded-lg border border-divider bg-surface p-[var(--layout-space-loose)] flex flex-col md:flex-row items-center gap-[var(--layout-space-loose)]">
        <ScoreDonutChart score={HR_HEALTH.score} label={HR_HEALTH.label} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[var(--layout-space-tight)]">
            <HR_HEALTH_ICON size={16} className="text-fg-muted" aria-hidden />
            <span className="text-caption text-fg-secondary">HR Health</span>
          </div>
          <h2 className="text-h3 font-medium mt-[var(--layout-space-tight)]">{HR_HEALTH.label}</h2>
          <p className="text-body text-fg-secondary mt-[var(--layout-space-tight)]">{HR_HEALTH.description}</p>
          <div className="mt-[var(--layout-space-tight)]">
            <TrendIndicator {...HR_HEALTH.trend} />
          </div>
        </div>
      </section>

      {/* 六大類別關鍵指標 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--layout-space-loose)]">
        <MetricCard
          icon={talentAcquisitionMeta.icon}
          categoryLabel={talentAcquisitionMeta.label}
          metricLabel={TALENT_ACQUISITION.metricLabel}
        >
          <ScoreStat
            value={TALENT_ACQUISITION.score}
            suffix="/ 100"
            trend={<TrendIndicator {...TALENT_ACQUISITION.trend} />}
          />
        </MetricCard>

        <MetricCard icon={retentionMeta.icon} categoryLabel={retentionMeta.label} metricLabel={RETENTION.metricLabel}>
          <div className="flex items-baseline justify-between gap-[var(--layout-space-tight)]">
            <span className="text-h3 font-medium text-foreground">{RETENTION.latestDisplay}</span>
            <TrendIndicator {...RETENTION.trend} />
          </div>
          <div className="mt-[var(--layout-space-tight)]">
            <TurnoverTrendChart quarters={RETENTION.quarters} />
          </div>
        </MetricCard>

        <MetricCard
          icon={engagementMeta.icon}
          categoryLabel={engagementMeta.label}
          metricLabel={ENGAGEMENT.metricLabel}
        >
          <ScoreStat value={ENGAGEMENT.score} suffix="/ 100" trend={<TrendIndicator {...ENGAGEMENT.trend} />} />
        </MetricCard>

        <MetricCard
          icon={performanceMeta.icon}
          categoryLabel={performanceMeta.label}
          metricLabel={PERFORMANCE_MANAGEMENT.metricLabel}
        >
          <CategoryDonutChart segments={PERFORMANCE_MANAGEMENT.segments} />
          <div className="mt-[var(--layout-space-tight)]">
            <TrendIndicator {...PERFORMANCE_MANAGEMENT.trend} />
          </div>
        </MetricCard>

        <MetricCard
          icon={globalizationMeta.icon}
          categoryLabel={globalizationMeta.label}
          metricLabel={GLOBALIZATION.metricLabel}
        >
          <CategoryDonutChart segments={GLOBALIZATION.segments} />
          <div className="mt-[var(--layout-space-tight)]">
            <TrendIndicator {...GLOBALIZATION.trend} />
          </div>
        </MetricCard>

        <MetricCard
          icon={compensationMeta.icon}
          categoryLabel={compensationMeta.label}
          metricLabel={COMPENSATION.metricLabel}
        >
          <ScoreStat
            value={COMPENSATION.value.toFixed(2)}
            caption={`Target: ${COMPENSATION.target.toFixed(2)}`}
            trend={<TrendIndicator {...COMPENSATION.trend} />}
          />
        </MetricCard>
      </section>

      <SectionCard
        title="Attention Required"
        description="以下指標落後目標,建議主管優先檢視(依業務影響排序)。"
      >
        <AttentionRequiredList items={ATTENTION_REQUIRED} />
      </SectionCard>

      <SectionCard title="Last Updated" description="各類別資料最後上傳紀錄。">
        <LastUpdatedLog entries={LAST_UPDATED_LOG} />
      </SectionCard>
    </div>
  )
}
