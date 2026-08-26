import {
  UserPlus,
  Repeat,
  Smile,
  Target,
  Globe2,
  Wallet,
  Activity,
  type LucideIcon,
} from 'lucide-react'

// HR Plus Dashboard — 假資料(user 已確認之後可換真實資料源)。
// 六大類別對齊 Talent Acquisition / Retention & Turnover / Culture & Engagement /
// Performance Management / Globalization / Compensation & Benefits。

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

export const QUARTER_OPTIONS = QUARTERS.map((q) => ({ value: q, label: `2026 ${q}` }))

export type TrendDirection = 'up' | 'down'

export interface Trend {
  direction: TrendDirection
  /** 與上一季相比的變動百分比(絕對值,方向由 direction 決定) */
  percent: number
  /** 這個方向對業務是否為好消息(決定 TrendIndicator 顯示色) */
  isFavorable: boolean
}

/** 一個指標的四季數值 + Q1 的比較基準(2025 Q4)。 */
interface QuarterlySeries {
  /** 2025 Q4 — 只用來算 Q1 2026 的季度環比,不在 UI 上單獨顯示 */
  baseline: number
  Q1: number
  Q2: number
  Q3: number
  Q4: number
}

/**
 * 計算「與上一季比」的 trend。Q1 用 baseline(2025 Q4)當上一季。
 * @param higherIsFavorable 數值上升是否為好消息(例如離職率上升是壞消息 → false)
 */
function getTrend(series: QuarterlySeries, quarter: Quarter, higherIsFavorable: boolean): Trend {
  const current = series[quarter]
  const prevQuarter = QUARTERS[QUARTERS.indexOf(quarter) - 1]
  const previous = prevQuarter ? series[prevQuarter] : series.baseline
  const direction: TrendDirection = current >= previous ? 'up' : 'down'
  const percent = previous === 0 ? 0 : Math.round((Math.abs(current - previous) / previous) * 1000) / 10
  const isFavorable = (direction === 'up') === higherIsFavorable
  return { direction, percent, isFavorable }
}

export type CategoryId =
  | 'talent-acquisition'
  | 'retention'
  | 'engagement'
  | 'performance'
  | 'globalization'
  | 'compensation'

export interface CategoryMeta {
  id: CategoryId
  label: string
  icon: LucideIcon
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'talent-acquisition', label: 'Talent Acquisition', icon: UserPlus },
  { id: 'retention', label: 'Retention & Turnover', icon: Repeat },
  { id: 'engagement', label: 'Culture & Engagement', icon: Smile },
  { id: 'performance', label: 'Performance Management', icon: Target },
  { id: 'globalization', label: 'Globalization', icon: Globe2 },
  { id: 'compensation', label: 'Compensation & Benefits', icon: Wallet },
]

export const CATEGORY_META_BY_ID: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>

export const HR_HEALTH_ICON: LucideIcon = Activity

// ── HR Health(綜合分數,0-100)──────────────────────────────────────────────
const HR_HEALTH_SERIES: QuarterlySeries = { baseline: 74, Q1: 75, Q2: 77, Q3: 78, Q4: 79 }

export function getHrHealth(quarter: Quarter) {
  return {
    label: 'HR Health Score',
    score: HR_HEALTH_SERIES[quarter],
    trend: getTrend(HR_HEALTH_SERIES, quarter, true),
    description: '六大類別加權綜合分數,反映人力資源對業務的整體健康度。',
  }
}

// ── Talent Acquisition:H/C Fulfillment Gap(0-100 分數)──────────────────────
const TALENT_ACQUISITION_SERIES: QuarterlySeries = { baseline: 79, Q1: 81, Q2: 83, Q3: 84, Q4: 86 }

export function getTalentAcquisition(quarter: Quarter) {
  return {
    metricLabel: 'H/C Fulfillment Gap',
    score: TALENT_ACQUISITION_SERIES[quarter],
    trend: getTrend(TALENT_ACQUISITION_SERIES, quarter, true),
  }
}

// ── Retention & Turnover:Overall Turnover Rate(%)────────────────────────────
const RETENTION_SERIES: QuarterlySeries = { baseline: 13.7, Q1: 12.4, Q2: 13.1, Q3: 11.6, Q4: 10.5 }

export function getRetention(quarter: Quarter) {
  return {
    metricLabel: 'Overall Turnover Rate',
    // 折線圖固定顯示全年 Q1~Q4 讓主管看得到走勢;下方數字/trend 才跟著選取季度變動
    quarters: QUARTERS.map((q) => ({ quarter: q, rate: RETENTION_SERIES[q] })),
    latestDisplay: `${RETENTION_SERIES[quarter]}%`,
    // 離職率上升是壞消息 → higherIsFavorable = false
    trend: getTrend(RETENTION_SERIES, quarter, false),
  }
}

// ── Culture & Engagement:Employee Engagement Survey(0-100 分數)─────────────
const ENGAGEMENT_SERIES: QuarterlySeries = { baseline: 71, Q1: 72, Q2: 74, Q3: 75, Q4: 76 }

export function getEngagement(quarter: Quarter) {
  return {
    metricLabel: 'Employee Engagement Survey',
    score: ENGAGEMENT_SERIES[quarter],
    trend: getTrend(ENGAGEMENT_SERIES, quarter, true),
  }
}

// ── Performance Management:People Manager Effectiveness(組成比例)───────────
interface EffectivenessQuarter {
  effective: number
  developing: number
  needsImprovement: number
}
const PERFORMANCE_MANAGEMENT_SERIES: Record<Quarter, EffectivenessQuarter> = {
  Q1: { effective: 60, developing: 30, needsImprovement: 10 },
  Q2: { effective: 63, developing: 28, needsImprovement: 9 },
  Q3: { effective: 66, developing: 25, needsImprovement: 9 },
  Q4: { effective: 68, developing: 24, needsImprovement: 8 },
}
const PERFORMANCE_MANAGEMENT_EFFECTIVE_SERIES: QuarterlySeries = {
  baseline: 57,
  Q1: 60,
  Q2: 63,
  Q3: 66,
  Q4: 68,
}

export function getPerformanceManagement(quarter: Quarter) {
  const composition = PERFORMANCE_MANAGEMENT_SERIES[quarter]
  return {
    metricLabel: 'People Manager Effectiveness',
    segments: [
      { name: 'Effective', value: composition.effective, fill: 'var(--chart-1)' },
      { name: 'Developing', value: composition.developing, fill: 'var(--chart-2)' },
      { name: 'Needs Improvement', value: composition.needsImprovement, fill: 'var(--chart-5)' },
    ],
    trend: getTrend(PERFORMANCE_MANAGEMENT_EFFECTIVE_SERIES, quarter, true),
  }
}

// ── Globalization:Local Manager Representation(組成比例)────────────────────
const GLOBALIZATION_SERIES: Record<Quarter, { local: number }> = {
  Q1: { local: 58 },
  Q2: { local: 60 },
  Q3: { local: 62 },
  Q4: { local: 64 },
}
const GLOBALIZATION_LOCAL_SERIES: QuarterlySeries = { baseline: 55, Q1: 58, Q2: 60, Q3: 62, Q4: 64 }

export function getGlobalization(quarter: Quarter) {
  const local = GLOBALIZATION_SERIES[quarter].local
  return {
    metricLabel: 'Local Manager Representation',
    segments: [
      { name: 'Local Manager', value: local, fill: 'var(--chart-1)' },
      { name: 'Expatriate', value: 100 - local, fill: 'var(--chart-4)' },
    ],
    trend: getTrend(GLOBALIZATION_LOCAL_SERIES, quarter, true),
  }
}

// ── Compensation & Benefits:Compa-ratio(target 1.00)─────────────────────────
const COMPENSATION_SERIES: QuarterlySeries = { baseline: 0.97, Q1: 0.97, Q2: 0.96, Q3: 0.96, Q4: 0.95 }

export function getCompensation(quarter: Quarter) {
  return {
    metricLabel: 'Compa-ratio',
    value: COMPENSATION_SERIES[quarter],
    target: 1.0,
    // Compa-ratio 走低是壞消息 → higherIsFavorable = true(上升才是好消息)
    trend: getTrend(COMPENSATION_SERIES, quarter, true),
  }
}

export interface AttentionItem {
  id: string
  category: CategoryId
  message: string
}

// 需要主管留意的 5 筆落後指標(通常是績效不佳的項目)。
export const ATTENTION_REQUIRED: AttentionItem[] = [
  {
    id: 'att-1',
    category: 'performance',
    message: 'Performance review completion at 58% — 42% behind target.',
  },
  {
    id: 'att-2',
    category: 'engagement',
    message: 'New Hire Engagement Survey score is lower than tenured employee average by 15 points.',
  },
  {
    id: 'att-3',
    category: 'retention',
    message: 'APAC region turnover rate at 18.2%, exceeding the 12% target by 6.2 pts.',
  },
  {
    id: 'att-4',
    category: 'talent-acquisition',
    message: 'Engineering time-to-fill averaging 62 days, 27 days above the 35-day target.',
  },
  {
    id: 'att-5',
    category: 'compensation',
    message: 'Sales department compa-ratio at 0.89, below the 0.95 minimum band.',
  },
]

export interface Uploader {
  name: string
  employeeId: string
  color: 'blue' | 'green' | 'deep-orange' | 'yellow' | 'red' | 'purple' | 'neutral'
}

export interface UpdateLogEntry {
  category: CategoryId
  uploadedAt: string
  uploader: Uploader
}

// 各類別資料最後上傳紀錄(假資料)。
export const LAST_UPDATED_LOG: UpdateLogEntry[] = [
  {
    category: 'talent-acquisition',
    uploadedAt: '2026-08-26 09:14',
    uploader: { name: 'Wei Chen', employeeId: 'EMP10234', color: 'blue' },
  },
  {
    category: 'retention',
    uploadedAt: '2026-08-25 17:42',
    uploader: { name: 'Mei Lin', employeeId: 'EMP10871', color: 'green' },
  },
  {
    category: 'engagement',
    uploadedAt: '2026-08-24 11:05',
    uploader: { name: 'Aditya Rao', employeeId: 'EMP11092', color: 'purple' },
  },
  {
    category: 'performance',
    uploadedAt: '2026-08-23 15:30',
    uploader: { name: 'Sofia Alvarez', employeeId: 'EMP10456', color: 'deep-orange' },
  },
  {
    category: 'globalization',
    uploadedAt: '2026-08-22 10:18',
    uploader: { name: 'Kenji Sato', employeeId: 'EMP10789', color: 'yellow' },
  },
  {
    category: 'compensation',
    uploadedAt: '2026-08-20 14:52',
    uploader: { name: 'Grace Lee', employeeId: 'EMP10023', color: 'red' },
  },
]
