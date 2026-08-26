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

export type TrendDirection = 'up' | 'down'

export interface Trend {
  direction: TrendDirection
  /** 與上一季相比的變動百分比(絕對值,方向由 direction 決定) */
  percent: number
  /** 這個方向對業務是否為好消息(決定 TrendIndicator 顯示色) */
  isFavorable: boolean
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

export const HR_HEALTH = {
  label: 'HR Health Score',
  score: 79,
  trend: { direction: 'up', percent: 4, isFavorable: true } satisfies Trend,
  description: '六大類別加權綜合分數,反映人力資源對業務的整體健康度。',
}

export const TALENT_ACQUISITION = {
  metricLabel: 'H/C Fulfillment Gap',
  score: 86,
  trend: { direction: 'up', percent: 5, isFavorable: true } satisfies Trend,
}

export const RETENTION = {
  metricLabel: 'Overall Turnover Rate',
  quarters: [
    { quarter: 'Q1', rate: 12.4 },
    { quarter: 'Q2', rate: 13.1 },
    { quarter: 'Q3', rate: 11.6 },
    { quarter: 'Q4', rate: 10.5 },
  ],
  latestDisplay: '10.5%',
  trend: { direction: 'down', percent: 9.5, isFavorable: true } satisfies Trend,
}

export const ENGAGEMENT = {
  metricLabel: 'Employee Engagement Survey',
  score: 76,
  trend: { direction: 'up', percent: 3, isFavorable: true } satisfies Trend,
}

export const PERFORMANCE_MANAGEMENT = {
  metricLabel: 'People Manager Effectiveness',
  segments: [
    { name: 'Effective', value: 68, fill: 'var(--chart-1)' },
    { name: 'Developing', value: 24, fill: 'var(--chart-2)' },
    { name: 'Needs Improvement', value: 8, fill: 'var(--chart-5)' },
  ],
  trend: { direction: 'up', percent: 4, isFavorable: true } satisfies Trend,
}

export const GLOBALIZATION = {
  metricLabel: 'Local Manager Representation',
  segments: [
    { name: 'Local Manager', value: 64, fill: 'var(--chart-1)' },
    { name: 'Expatriate', value: 36, fill: 'var(--chart-4)' },
  ],
  trend: { direction: 'up', percent: 6, isFavorable: true } satisfies Trend,
}

export const COMPENSATION = {
  metricLabel: 'Compa-ratio',
  value: 0.95,
  target: 1.0,
  trend: { direction: 'down', percent: 2, isFavorable: false } satisfies Trend,
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

export const CATEGORY_META_BY_ID: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>

export const HR_HEALTH_ICON: LucideIcon = Activity
