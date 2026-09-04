// HR Pulse — Executive Overview + per-pillar detail pages
//
// code-quality-allow: file-size — 單一 route 的 app entry(無 router),Overview / PillarDetail /
// Talent 三個頁面模板與其專屬 chart/metric helper 彼此高內聚(各自的 @story-baseline 引用緊鄰
// 使用處),拆檔只會打散引用脈絡、不會降低耦合;當前 ~950 行,對齊 tabs.tsx 同款 file-size escape 先例。
// @story-baseline: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#IconCollapse
// @story-baseline: @qijenchen/design-system/components/Select/select.stories.tsx#Modes
// @story-baseline: @qijenchen/design-system/components/DescriptionList/description-list.stories.tsx
// @story-baseline: @qijenchen/design-system/components/Chart/chart.stories.tsx#BarChartRevenue
// @story-baseline: @qijenchen/design-system/components/Chart/chart.stories.tsx#LineChartResponseTime
// (AppShell + Sidebar + ChromeHeader shell 對齊 apps/template/src/App.tsx 同一 canonical baseline;
// Select width 用 width="hug",非 field-controls.spec.md「寬度軸」硬寬 class)
//
// SSOT 鐵律:
//   - Consumer 只 import `@qijenchen/design-system` public exports
//   - 禁修改 DS source(走 fork DS repo)
//   - 視覺 token 透過 DS 提供的 CSS variable / utility class 消費
//
// 導覽:sidebar 項目(SidebarMenuButton id=)自動驅動 SidebarProvider.activeId → 各自 pillar 細節頁。

import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AppShell,
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  ChromeHeader,
  TooltipProvider,
  Avatar,
  AccountMenu,
  Button,
  Select,
  Tag,
  Badge,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  type ChartConfig,
  DescriptionList,
  DescriptionItem,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverBody,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  CircularProgress,
} from '@qijenchen/design-system'
import {
  LayoutDashboard,
  Users,
  Award,
  Heart,
  MessageSquare,
  Globe,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Pin,
  Info,
  Square,
} from 'lucide-react'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'talent', label: 'Talent', icon: Users },
  { id: 'leadership', label: 'Leadership', icon: Award },
  { id: 'culture', label: 'Culture', icon: Heart },
  { id: 'engagement', label: 'Engagement', icon: MessageSquare },
  { id: 'globalization', label: 'Globalization', icon: Globe },
] as const

const ORG_OPTIONS = [
  { value: 'overall', label: 'Overall' },
  { value: 'op1', label: 'OP1' },
  { value: 'op2', label: 'OP2' },
  { value: 'op_cn', label: 'OP_CN' },
  { value: 'rd', label: 'R&D' },
  { value: 'cf', label: 'CF' },
  { value: 'cf_corporate', label: 'CF(Corporate)' },
]

type Delta = { direction: 'up' | 'down' | 'flat'; text: string }

function DeltaLabel({ delta }: { delta: Delta }) {
  const Icon = delta.direction === 'up' ? TrendingUp : delta.direction === 'down' ? TrendingDown : Minus
  const colorClass =
    delta.direction === 'up' ? 'text-success-text' : delta.direction === 'down' ? 'text-error-text' : 'text-fg-muted'
  return (
    <span className={`inline-flex items-center gap-1 text-caption font-medium ${colorClass}`}>
      <Icon size={12} />
      {delta.text}
    </span>
  )
}

// 5 張 key information 小卡的 +X% —— 用 Tag 包裹(DS Tag 無 type/state/outline prop,見 tag.spec.md;
// 用最接近的實際 prop 對應:正數 color="green"、負數 color="amber"〈淺橘,淺底深字〉,預設 subtle(非
// solid)+ size="sm"。icon 沿用 DeltaLabel 同一組方向 icon。
// @story-baseline: @qijenchen/design-system/components/Tag/tag.stories.tsx
// 2026-08-28 user 澄清:數值上升 = ArrowUp、數值下降 = ArrowDown(最基本箭頭,非 Trending 系列 icon)。
// DS Tag 無 outline/border 變體(見 tag.spec.md,只有 color/solid/size)——用 className 疊加同色相 border 色
// 模擬「outlined」視覺(蓋掉 Tag base class 的 border-transparent)。
function KeyInfoDeltaTag({ delta }: { delta: Delta }) {
  const Icon = delta.direction === 'up' ? ArrowUp : delta.direction === 'down' ? ArrowDown : Minus
  const color = delta.direction === 'up' ? 'green' : delta.direction === 'down' ? 'amber' : 'neutral'
  const borderClass = color === 'green' ? 'border-[var(--color-green-6)]' : 'border-[var(--color-amber-6)]'
  return (
    <Tag color={color} size="sm" icon={Icon} className={borderClass}>
      {delta.text}
    </Tag>
  )
}

// 卡片標題旁的「上次更新」提示 —— hover icon 才顯示時間,不佔用標題列空間。
// @story-baseline: @qijenchen/design-system/components/Tooltip/tooltip.stories.tsx
// size='h3'(預設)= Overview 圖表卡片標題級距(24/130,designer 指定);size='body' = 緊湊 Key card
// 標題(Talent/Leadership Key card 同一字級,text-body font-bold),避免長 label(如「People Manager
// Effectiveness」)在窄卡片內用 h3 折兩行、跟同排短 label 的卡片比例不一致。
function CardTitleWithUpdated({ title, updatedAt, size = 'h3' }: { title: string; updatedAt: string; size?: 'h3' | 'body' }) {
  return (
    <div className="flex items-center gap-[var(--layout-space-tight)]">
      <span className={size === 'h3' ? 'text-h3 font-medium' : 'text-body font-bold'}>{title}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center text-fg-muted cursor-default" aria-label={`Latest update ${updatedAt}`}>
            <Info size={14} />
          </span>
        </TooltipTrigger>
        <TooltipContent>Latest update: {updatedAt}</TooltipContent>
      </Tooltip>
    </div>
  )
}

// ── Overview: Turnover rate(折線,三系列)+ Hiring gap(長條)── 皆為 2026 假數字,待接真實資料源。
// 2026-08-28 user 指定三系列改名;Q4(最新季)= user 給定數值 3.4/2.7/2.3,Q1-Q3 為對齊該量級的假波動(假數字)。
const TURNOVER_TREND = [
  { quarter: '2026 Q1', turnover: 3.7, newcomer: 2.4, voluntary: 2.6 },
  { quarter: '2026 Q2', turnover: 3.1, newcomer: 3.0, voluntary: 2.1 },
  { quarter: '2026 Q3', turnover: 3.6, newcomer: 2.5, voluntary: 2.5 },
  { quarter: '2026 Q4', turnover: 3.4, newcomer: 2.7, voluntary: 2.3 },
]
const turnoverConfig = {
  turnover: { label: 'Turnover', color: 'var(--chart-1)' },
  newcomer: { label: 'Newcomer turnover', color: 'var(--chart-2)' },
  voluntary: { label: 'Voluntary turnover', color: 'var(--chart-3)' },
} satisfies ChartConfig

// 2026-08-28 user 指定改版:同 Quarter 兩條(DL 紫色/IDL 藍色),各自 Approved(深)+ Gap(淺)疊加至 Budget、
// 長條上方標「+Gap」註記。僅給 DL 範例(Budget 20,560/Approved 20,000/Gap 560)當 Q1 DL,其餘為對齊範例量級的假數字。
type HiringGapRow = {
  quarter: string
  dlBudget: number; dlApproved: number; dlGap: number
  idlBudget: number; idlApproved: number; idlGap: number
}
// 2026-08-28 user 指定 DL/IDL 假數字量級改接近,方便共用同一條 10,000 起始 Y 軸都看得清楚。
const HIRING_GAP_TREND: HiringGapRow[] = [
  { quarter: '2026 Q1', dlBudget: 20560, dlApproved: 20000, dlGap: 560, idlBudget: 19200, idlApproved: 18900, idlGap: 300 },
  { quarter: '2026 Q2', dlBudget: 19800, dlApproved: 19500, dlGap: 300, idlBudget: 18600, idlApproved: 18400, idlGap: 200 },
  { quarter: '2026 Q3', dlBudget: 18900, dlApproved: 18750, dlGap: 150, idlBudget: 17800, idlApproved: 17600, idlGap: 200 },
  { quarter: '2026 Q4', dlBudget: 19200, dlApproved: 18800, dlGap: 400, idlBudget: 18000, idlApproved: 17700, idlGap: 300 },
]
// 2026-08-28 user 指定改回原本紫/藍配色;IDL 排最前面(順序帶動長條左右排列 + legend 順序)。
const hiringGapConfig = {
  idlApproved: { label: 'IDL Approved', color: 'var(--color-blue-6)' },
  idlGap: { label: 'IDL Gap', color: 'var(--color-blue-3)' },
  dlApproved: { label: 'DL Approved', color: 'var(--color-purple-6)' },
  dlGap: { label: 'DL Gap', color: 'var(--color-purple-3)' },
} satisfies ChartConfig

// 2026-08-28 user 指定 hover 只顯示 DL/IDL 的 Gap 數值和 %(Budget/Approved 不再顯示,保持最精簡)。
function hiringGapTooltipFormatter(value: unknown, _name: unknown, item: { dataKey?: string | number }, _index: number, payload: unknown) {
  const key = String(item.dataKey) as keyof typeof hiringGapConfig
  if (key.endsWith('Approved')) return null

  const row = payload as HiringGapRow
  const budget = key.startsWith('dl') ? row.dlBudget : row.idlBudget
  const gapValue = Number(value)
  const pct = ((gapValue / budget) * 100).toFixed(1)
  // user 指定 hover 詳情也比照 Turnover rate legend,前面加色塊區分 IDL / DL(同一組 Square icon 手法)。
  return (
    <div className="flex w-full flex-1 items-center justify-between gap-[var(--layout-space-tight)]">
      <span className="flex items-center gap-[var(--layout-space-tight)] text-fg-secondary">
        <Square size={8} fill={hiringGapConfig[key].color} stroke="none" />
        {hiringGapConfig[key].label}
      </span>
      <span className="text-foreground font-mono font-medium tabular-nums">
        {gapValue > 0 ? `+${gapValue.toLocaleString()}` : gapValue.toLocaleString()} ({pct}%)
      </span>
    </div>
  )
}

// +Gap 長條上方註記 —— DS 無「root--small」token;text-caption 是 spec 文件標明的「圖表附註」用途 token,取代之。
function hiringGapLabelFormatter(label: unknown) {
  const value = Number(label)
  return value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString()
}

// 統一時間格式:`<來源>, YYYY/MM/DD`(對齊 DS DatePicker 預設格式 —— date-picker.tsx:37
// 「Default format:YYYY/MM/DD,year-first ISO-like,locale-independent」,非隨意 MMM D, YYYY)。
// 依時間新→舊排序,最新一則在最上面。
const INSIGHTS = [
  { id: 'hiring-gap', text: 'Hiring gap narrowed to 12% in Q4 2026 after two quarters of improvement — driven by faster time-to-fill in R&D.', source: 'HRPO Analysis Team, 2026/12/31' },
  { id: 'briefing', text: 'Q2 Briefing Pack is ready for review. Key highlights: hiring efficiency improved, engagement stable, performance review completion lagging.', source: 'HRPO Analysis Team, 2026/06/30' },
  { id: 'eng-turnover', text: 'Engineering turnover correlates strongly with market comp gap. Recommend targeted retention package for critical tech roles.', source: 'HRPO Analysis Team, 2026/06/28' },
]

// 5 張 key information 小卡(等寬),放在 Turnover rate / Hiring gap 之下、HRPO Insights 之上。皆為假數字。
// description = 原本 hover (!) 顯示的內容,user 指定改為卡片內常駐顯示的小字說明(僅 New Hire Performance 的文案是
// user 給定原文,其餘 4 張為對齊格式的假文案,待接真實 methodology note)。
const KEY_INFO_CARDS: { id: string; title: string; value: string; delta: Delta; deltaSuffix: string; updatedAt: string; description: string }[] = [
  { id: 'new-hire-engagement', title: 'New Hire Performance', value: '40%', delta: { direction: 'up', text: '+2%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00', description: '% of new hires who have S+ or above (top ~35%) for first 3 years rating (tracks hires in last 5 years)' },
  { id: 'internal-mobility', title: 'Internal Mobility', value: '40%', delta: { direction: 'up', text: '+5%' }, deltaSuffix: 'vs 14 days ago', updatedAt: '2026/08/26 06:00', description: '% of open roles filled by internal candidates (tracks postings in last 90 days)' },
  { id: 'new-hire-engagement-2', title: 'New Hire Onboarding (Wecare Survey)', value: '80%', delta: { direction: 'down', text: '-5%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00', description: '% of new hires reporting positive engagement in first 6 months (EES survey response rate ~82%)' },
  { id: 'manager-fulfillment-gap', title: 'Manager Fulfillment Gap', value: '12%', delta: { direction: 'up', text: '+0.8%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00', description: '% gap between approved manager headcount and actual filled manager roles (current quarter)' },
  { id: 'local-manager-representation', title: 'Local Manager Representation (Oversea fab)', value: '50%', delta: { direction: 'up', text: '+2%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00', description: '% of overseas fab manager roles held by local (in-country) hires' },
]

function KeyInfoCard({ card }: { card: (typeof KEY_INFO_CARDS)[number] }) {
  return (
    <ScoreCard className="flex flex-col">
      {/* Large/500,16/150(text-body-lg font-medium token)+ 加深至 text-foreground(對齊 designer 要求「黑一點」)。
          固定保留 2 行高度(不論標題實際幾行),避免長標題(如 Local Manager Representation)換行撐開、
          導致下方數字跟別張卡片高度對不齊 —— 對齊 designer 要求「數字高度對齊,不要上上下下的」。 */}
      {/* @story-baseline: @qijenchen/design-system/components/Tooltip/tooltip.stories.tsx#Default —
          2026-08-31 user 指定:Last updated 日期改回 hover (!) 顯示,不再常駐於卡片上;
          原本 hover 顯示 description 的行為拿掉(移除)。 */}
      {/* @layout-space-magic-ok: min-h-[3rem] 是固定 2 行標題高度預留(非 spacing/gap),延續本檔既有 designer 對齊需求 */}
      <div className="flex items-start gap-1 min-h-[3rem]">
        <span className="text-body-lg font-medium text-foreground">{card.title}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="inline-flex items-center text-fg-muted cursor-default flex-none"
              aria-label={`Latest update ${card.updatedAt}`}
            >
              <Info size={14} />
            </span>
          </TooltipTrigger>
          <TooltipContent>Latest update: {card.updatedAt}</TooltipContent>
        </Tooltip>
      </div>
      {/* 數字至少 32px(text-h2 token = 32px,designer guideline 下限);標題到數字間距拉開至 16px(loose token) */}
      <div className="text-h2 font-bold tabular-nums mt-[var(--layout-space-loose)]">{card.value}</div>
      {/* @story-baseline: @qijenchen/design-system/components/Tag/tag.stories.tsx —
          +X% 用 Tag 包裹:DS Tag 無 type/state/outline prop(僅 color 類別色 + solid boolean + size),
          正數 color="green"、負數 color="amber"(淺橘,DS 唯一近似「warning 淺橘」的 categorical hue),
          預設 subtle(非 solid,視覺近「outline」淺底)+ size="sm"。 */}
      <div className="mt-[var(--layout-space-tight)] flex items-center gap-[var(--layout-space-tight)]">
        <KeyInfoDeltaTag delta={card.delta} />
        <span className="text-caption text-fg-muted">{card.deltaSuffix}</span>
      </div>
    </ScoreCard>
  )
}

// 'talent' / 'leadership' 不在此 union 內 —— 兩者改用專屬頁面(TalentPage / LeadershipPage,
// 皆為 tab + key/leading metric drill-down),不再套用其餘 pillar 共用的 PillarDetailPage template。
type PillarId = 'culture' | 'engagement' | 'globalization'

type PillarDetail = {
  id: PillarId
  label: string
  icon: typeof Users
  score: number
  delta: Delta
  metrics: { label: string; value: string }[]
  trend: { period: string; value: number }[]
  note: string
}

// 各 pillar 細節頁資料(沿用可對應的既有內容,Leadership / Culture / Globalization 為新增 — 待實際資料源接上)。
const PILLAR_DETAILS: Record<PillarId, PillarDetail> = {
  culture: {
    id: 'culture', label: 'Culture', icon: Heart, score: 79, delta: { direction: 'up', text: '+1' },
    metrics: [
      { label: 'Values Alignment Score', value: '4.1 / 5' },
      { label: 'DEI Representation', value: '34%' },
      { label: 'Culture Survey Favorability', value: '79%' },
      { label: 'ERG Participation', value: '42%' },
    ],
    trend: [{ period: "Q3'24", value: 76 }, { period: "Q4'24", value: 77 }, { period: "Q1'25", value: 78 }, { period: "Q2'25", value: 79 }],
    note: 'Culture survey favorability continues a slow, steady climb; ERG participation is the fastest-growing metric this year.',
  },
  engagement: {
    id: 'engagement', label: 'Engagement', icon: MessageSquare, score: 85, delta: { direction: 'up', text: '+2' },
    metrics: [
      { label: 'eNPS', value: '+34' },
      { label: 'Survey Participation', value: '91%' },
      { label: 'Manager Effectiveness', value: '4.2 / 5' },
      { label: 'Recognition Usage', value: '68%' },
    ],
    trend: [{ period: "Q3'24", value: 81 }, { period: "Q4'24", value: 82 }, { period: "Q1'25", value: 83 }, { period: "Q2'25", value: 85 }],
    note: 'Engagement remains stable; manager effectiveness is the strongest driver this quarter.',
  },
  globalization: {
    id: 'globalization', label: 'Globalization', icon: Globe, score: 80, delta: { direction: 'flat', text: '0' },
    metrics: [
      { label: 'Countries with HR Presence', value: '18' },
      { label: 'Cross-border Mobility', value: '6.4%' },
      { label: 'Localization Compliance', value: '96%' },
      { label: 'Global Pay Parity Index', value: '0.97' },
    ],
    trend: [{ period: "Q3'24", value: 79 }, { period: "Q4'24", value: 80 }, { period: "Q1'25", value: 80 }, { period: "Q2'25", value: 80 }],
    note: 'Global pay parity index holds steady at 0.97; localization compliance improved most in OP_CN this quarter.',
  },
}

// ── Talent page:Leadership Development / Talent Productivity 兩個 tab ──────────
// 每個 tab 由若干 Key metric 組成,部分 Key 帶 Leading metric(附屬於該 Key,縮排展示在同一卡片內)。
// user 指定:點選任一 Key 或 Leading data,其下方展示該指標 2026 Q1~Q4 折線變化(皆為假數字,
// 待接真實資料源;Q4 = user 給定當前值,Q1-Q3 為對齊量級的假波動,沿用本檔 TURNOVER_TREND 同一慣例)。
type QuarterPoint = { period: string; value: number }

function quarterlySeries(q1: number, q2: number, q3: number, q4: number): QuarterPoint[] {
  return [
    { period: '2026 Q1', value: q1 },
    { period: '2026 Q2', value: q2 },
    { period: '2026 Q3', value: q3 },
    { period: '2026 Q4', value: q4 },
  ]
}

type MetricUnit = 'percent' | 'days' | 'currency'

type MetricDatum = {
  id: string
  label: string
  value: number
  displayValue: string
  unit: MetricUnit
  trend: QuarterPoint[]
  /** 選填:vs 上期的漲跌(KeyInfoDeltaTag)+ 比較基準文案。無則不顯示漲跌列(Talent 頁既有卡片無此需求)。 */
  delta?: Delta
  deltaSuffix?: string
  /** 選填:(!) hover 顯示的最後更新時間(CardTitleWithUpdated)。無則標題不帶 (!) icon。 */
  updatedAt?: string
}

type KeyMetricDatum = MetricDatum & { leading?: MetricDatum[] }

// user 給定:Headcount Fulfilment Gap 58%(圓餅圖,滿分 100%),帶 3 個 Leading data。
const HEADCOUNT_FULFILMENT_GAP: KeyMetricDatum = {
  id: 'headcount-fulfilment-gap',
  label: 'Headcount Fulfilment Gap',
  value: 58,
  displayValue: '58%',
  unit: 'percent',
  trend: quarterlySeries(51, 54, 56, 58),
  leading: [
    { id: 'mobility-willingness-rate', label: 'Mobility willingness rate', value: 35, displayValue: '35%', unit: 'percent', trend: quarterlySeries(30, 32, 34, 35) },
    { id: 'assignee-experience', label: 'Assignee experience', value: 27, displayValue: '27%', unit: 'percent', trend: quarterlySeries(24, 25, 26, 27) },
    { id: 'time-to-fill-fulfilment-gap', label: 'Time to fill', value: 49, displayValue: '49 days', unit: 'days', trend: quarterlySeries(55, 53, 51, 49) },
  ],
}

// user 給定:Critical Roles Vacancy Ratio 14%,帶 2 個 Leading data。
const CRITICAL_ROLES_VACANCY_RATIO: KeyMetricDatum = {
  id: 'critical-roles-vacancy-ratio',
  label: 'Critical Roles Vacancy Ratio',
  value: 14,
  displayValue: '14%',
  unit: 'percent',
  trend: quarterlySeries(18, 17, 15, 14),
  leading: [
    { id: 'time-to-fill-vacancy-ratio', label: 'Time to fill', value: 68, displayValue: '68 days', unit: 'days', trend: quarterlySeries(74, 72, 70, 68) },
    { id: 'internal-fill-managers', label: 'Internal fill (managers)', value: 95, displayValue: '95 days', unit: 'days', trend: quarterlySeries(102, 100, 97, 95) },
  ],
}

const LEADERSHIP_DEVELOPMENT_KEYS: KeyMetricDatum[] = [HEADCOUNT_FULFILMENT_GAP, CRITICAL_ROLES_VACANCY_RATIO]

// user 指定「先幫我放假數字」—— 4 張皆為假數字,待接真實資料源;無 Leading data(user 未提供)。
const TALENT_PRODUCTIVITY_KEYS: KeyMetricDatum[] = [
  { id: 'new-hire-performance', label: 'New Hire Performance', value: 42, displayValue: '42%', unit: 'percent', trend: quarterlySeries(36, 38, 40, 42) },
  { id: 'quality-of-hire', label: 'Quality of Hire — Hiring Manager Satisfaction', value: 88, displayValue: '88%', unit: 'percent', trend: quarterlySeries(84, 85, 87, 88) },
  { id: 'revenue-per-employee', label: 'Revenue per Employee', value: 215000, displayValue: '$215K', unit: 'currency', trend: quarterlySeries(198000, 205000, 210000, 215000) },
  { id: 'profit-per-employee', label: 'Profit per Employee', value: 48000, displayValue: '$48K', unit: 'currency', trend: quarterlySeries(41000, 43000, 46000, 48000) },
]

// Key metric 的達成率指示(滿分 100%)—— 直接消費 DS CircularProgress(determinate ring:
// 可見 track `var(--secondary)` + 進度 arc),而非手刻 Pie/Cell donut(踩過 --divider track
// 幾乎透明看不見的坑)。數值放 ring 右側(DS 決策:CircularProgress 不支援置中 affix,
// 見 circular-progress.tsx docblock「不設 status prop」段同一 anti-over-designing 立場)。
// @story-baseline: @qijenchen/design-system/components/CircularProgress/circular-progress.stories.tsx
// displayValue 由 caller 傳完整格式化字串(非固定補 %)—— Leadership 頁 Key(如「92」無 % 符號)
// 與 Talent 頁 Key(如「58%」)共用同一元件,格式差異交給資料層 displayValue,不在此元件寫死。
function KeyProgressRing({ value, displayValue, size = 'md' }: { value: number; displayValue: string; size?: 'md' | 'sm' }) {
  return (
    <div className="flex items-center gap-[var(--layout-space-tight)]">
      <CircularProgress value={value} size={size === 'md' ? 64 : 48} />
      <span className="text-h2 font-bold tabular-nums">{displayValue}</span>
    </div>
  )
}

const trendConfig = { value: { label: 'Value', color: 'var(--chart-1)' } } satisfies ChartConfig

// 點選 Key / Leading data 展示的 2026 Q1~Q4 折線圖 —— 沿用本檔既有 LineChart 手法(單一系列版)。
// @story-baseline: @qijenchen/design-system/components/Chart/chart.stories.tsx#LineChartResponseTime
function MetricTrendChart({ data }: { data: QuarterPoint[] }) {
  return (
    <ChartContainer config={trendConfig} className="h-[100px] w-full mt-[var(--layout-space-tight)]">
      <LineChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={6} padding={{ left: 24, right: 24 }} />
        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ChartContainer>
  )
}

// Key metric 卡片:圓餅圖(percent)或大數字(currency)+ 點擊展開季度趨勢;若帶 Leading data,
// 縮排展示在卡片下半部(視覺上明確從屬於該 Key)。展開/收合皆用 DS Accordion(非手刻 chevron 按鈕)——
// Key 自己是獨立單一 item 的 Accordion(type="single" collapsible),Leading 群組是另一個
// type="multiple" 的 Accordion(各自獨立展開,互不影響)。
// @story-baseline: @qijenchen/design-system/components/Accordion/accordion.stories.tsx#Default
function KeyMetricCard({ metric, donutSize = 'md' }: { metric: KeyMetricDatum; donutSize?: 'md' | 'sm' }) {
  return (
    <ScoreCard className="flex-1 min-w-0 flex flex-col">
      <div className="text-body font-bold">{metric.label}</div>
      <Accordion type="single" collapsible className="mt-[var(--layout-space-loose)]">
        <AccordionItem value={metric.id} className="border-b-0">
          <AccordionTrigger className="py-[var(--layout-space-tight)]">
            <div className="flex items-center gap-[var(--layout-space-loose)]">
              {metric.unit === 'percent' ? (
                <KeyProgressRing value={metric.value} displayValue={metric.displayValue} size={donutSize} />
              ) : (
                <span className="text-h2 font-bold tabular-nums">{metric.displayValue}</span>
              )}
              <span className="text-caption font-normal text-fg-muted">2026 Q1–Q4 trend</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <MetricTrendChart data={metric.trend} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {metric.leading && metric.leading.length > 0 && (
        <div className="mt-[var(--layout-space-loose)] border-t border-divider pt-[var(--layout-space-tight)]">
          <div className="text-caption font-medium text-fg-muted">Leading indicators</div>
          <Accordion type="multiple" className="mt-[var(--layout-space-tight)]">
            {metric.leading.map((m) => (
              <AccordionItem key={m.id} value={m.id}>
                <AccordionTrigger className="py-[var(--layout-space-tight)] text-body">
                  <div className="flex flex-1 items-center justify-between gap-[var(--layout-space-tight)]">
                    <span className="text-caption font-normal text-fg-secondary">{m.label}</span>
                    <span className="font-medium tabular-nums">{m.displayValue}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <MetricTrendChart data={m.trend} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </ScoreCard>
  )
}

// @story-baseline: @qijenchen/design-system/components/Tabs/tabs.stories.tsx#Default
function TalentPage() {
  return (
    <div className="px-[var(--layout-space-tight)] py-[var(--layout-space-tight)]">
      <Tabs defaultValue="leadership-development">
        <TabsList>
          <TabsTrigger value="leadership-development">Leadership Development</TabsTrigger>
          <TabsTrigger value="talent-productivity">Talent Productivity</TabsTrigger>
        </TabsList>
        <TabsContent value="leadership-development" className="mt-[var(--layout-space-loose)]">
          <section className="flex gap-[var(--layout-space-loose)] items-start">
            {LEADERSHIP_DEVELOPMENT_KEYS.map((metric) => (
              <KeyMetricCard key={metric.id} metric={metric} />
            ))}
          </section>
        </TabsContent>
        <TabsContent value="talent-productivity" className="mt-[var(--layout-space-loose)]">
          <section className="grid grid-cols-2 gap-[var(--layout-space-loose)]">
            {TALENT_PRODUCTIVITY_KEYS.map((metric) => (
              <KeyMetricCard key={metric.id} metric={metric} donutSize="sm" />
            ))}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Leadership page:Leadership Development / Leadership Pipeline 兩個 tab ──────
// 與 Talent 頁不同:user 這次指定圖表「直接接」在 Key 下方(恆常顯示),非點擊展開 —— 故本節
// 用 StatKeyCard(靜態疊加 CardTitleWithUpdated + KeyProgressRing/大數字 + delta + 趨勢圖),
// 不套用 Talent 頁的 Accordion 展開/收合模式(互動模型不同,不可硬套)。
// user 給定:People Manager Effectiveness 92(滿分 100)+5 vs 2026 Q3。
const LEADERSHIP_PEOPLE_MANAGER_EFFECTIVENESS: MetricDatum = {
  id: 'people-manager-effectiveness',
  label: 'People Manager Effectiveness',
  value: 92,
  displayValue: '92',
  unit: 'percent',
  trend: quarterlySeries(80, 84, 87, 92),
  delta: { direction: 'up', text: '+5' },
  deltaSuffix: 'vs 2026 Q3',
  updatedAt: '2026/08/26 06:00',
}
// user 給定:Manager Development Feedback Survey 91,「其他資訊和 People Manager Effectiveness 一樣」
// (同一組 delta/updatedAt 格式)—— 視為 People Manager Effectiveness 的 Leading indicator(從屬關係)。
const LEADERSHIP_MANAGER_DEV_FEEDBACK: MetricDatum = {
  id: 'manager-development-feedback-survey',
  label: 'Manager Development Feedback Survey',
  value: 91,
  displayValue: '91',
  unit: 'percent',
  trend: quarterlySeries(79, 83, 86, 91),
  delta: { direction: 'up', text: '+5' },
  deltaSuffix: 'vs 2026 Q3',
  updatedAt: '2026/08/26 06:00',
}
// user 指定「用假數字」,無 Leading data。
const LEADERSHIP_INTERNAL_MOBILITY: MetricDatum = {
  id: 'leadership-internal-mobility',
  label: 'Internal Mobility',
  value: 40,
  displayValue: '40%',
  unit: 'percent',
  trend: quarterlySeries(28, 32, 35, 40),
  delta: { direction: 'up', text: '+5' },
  deltaSuffix: 'vs 2026 Q3',
  updatedAt: '2026/08/26 06:00',
}

// Leadership Pipeline tab —— user 指定「現在就用假數字設計」succession / pipeline 相關 Key metrics,
// 沿用同一套 StatKeyCard 呈現(無 Leading data,user 未提供從屬指標)。
const LEADERSHIP_SUCCESSION_COVERAGE: MetricDatum = {
  id: 'succession-coverage',
  label: 'Succession Coverage',
  value: 64,
  displayValue: '64%',
  unit: 'percent',
  trend: quarterlySeries(55, 58, 61, 64),
  delta: { direction: 'up', text: '+3' },
  deltaSuffix: 'vs 2026 Q3',
  updatedAt: '2026/08/26 06:00',
}
const LEADERSHIP_READY_NOW_SUCCESSOR_RATIO: MetricDatum = {
  id: 'ready-now-successor-ratio',
  label: 'Ready-Now Successor Ratio',
  value: 41,
  displayValue: '41%',
  unit: 'percent',
  trend: quarterlySeries(48, 46, 43, 41),
  delta: { direction: 'down', text: '-2' },
  deltaSuffix: 'vs 2026 Q3',
  updatedAt: '2026/08/26 06:00',
}

// 靜態(非點擊展開)Key metric 卡片內容:標題(選填 (!) hover 時間)+ ring/大數字 + 選填 delta +
// 恆常顯示的季度趨勢圖。只回傳內容,外層 chrome(ScoreCard)交給 caller —— 讓 caller 可以把兩張
// StatKeyCard 併入同一個 ScoreCard 表達從屬關係(見 LeadershipPage「Leading indicator of」分組)。
function StatKeyCard({ metric }: { metric: MetricDatum }) {
  return (
    <div className="flex-1 min-w-0">
      {metric.updatedAt ? (
        <CardTitleWithUpdated title={metric.label} updatedAt={metric.updatedAt} size="body" />
      ) : (
        <div className="text-body font-bold">{metric.label}</div>
      )}
      <div className="mt-[var(--layout-space-loose)]">
        {metric.unit === 'percent' ? (
          <KeyProgressRing value={metric.value} displayValue={metric.displayValue} />
        ) : (
          <span className="text-h2 font-bold tabular-nums">{metric.displayValue}</span>
        )}
      </div>
      {metric.delta && (
        <div className="mt-[var(--layout-space-tight)] flex items-center gap-[var(--layout-space-tight)]">
          <KeyInfoDeltaTag delta={metric.delta} />
          {metric.deltaSuffix && <span className="text-caption text-fg-muted">{metric.deltaSuffix}</span>}
        </div>
      )}
      <MetricTrendChart data={metric.trend} />
    </div>
  )
}

// @story-baseline: @qijenchen/design-system/components/Tabs/tabs.stories.tsx#Default
function LeadershipPage() {
  return (
    <div className="px-[var(--layout-space-tight)] py-[var(--layout-space-tight)]">
      <Tabs defaultValue="leadership-development">
        <TabsList>
          <TabsTrigger value="leadership-development">Leadership Development</TabsTrigger>
          <TabsTrigger value="leadership-pipeline">Leadership Pipeline</TabsTrigger>
        </TabsList>
        <TabsContent value="leadership-development" className="mt-[var(--layout-space-loose)]">
          <section className="flex gap-[var(--layout-space-loose)] items-stretch">
            {/* People Manager Effectiveness + 其 Leading indicator 併在同一張 ScoreCard,中間一條
                divider 分隔、右側加「Leading indicator of ...」標籤 —— 明確表達從屬關係(user 指定
                「要看得出來是從屬關係」),而非兩張各自獨立、看不出關聯的卡片。 */}
            <ScoreCard className="flex-[2] min-w-0">
              <div className="flex gap-[var(--layout-space-loose)]">
                <StatKeyCard metric={LEADERSHIP_PEOPLE_MANAGER_EFFECTIVENESS} />
                <div className="w-px bg-divider self-stretch" />
                <div className="flex-1 min-w-0">
                  <div className="text-caption font-medium text-fg-muted mb-[var(--layout-space-tight)]">
                    Leading indicator of People Manager Effectiveness
                  </div>
                  <StatKeyCard metric={LEADERSHIP_MANAGER_DEV_FEEDBACK} />
                </div>
              </div>
            </ScoreCard>
            <ScoreCard className="flex-1 min-w-0">
              <StatKeyCard metric={LEADERSHIP_INTERNAL_MOBILITY} />
            </ScoreCard>
          </section>
        </TabsContent>
        <TabsContent value="leadership-pipeline" className="mt-[var(--layout-space-loose)]">
          <section className="flex gap-[var(--layout-space-loose)] items-start">
            <ScoreCard className="flex-1 min-w-0">
              <StatKeyCard metric={LEADERSHIP_SUCCESSION_COVERAGE} />
            </ScoreCard>
            <ScoreCard className="flex-1 min-w-0">
              <StatKeyCard metric={LEADERSHIP_READY_NOW_SUCCESSOR_RATIO} />
            </ScoreCard>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 2026-08-31 user 指定改採 TSMC design guideline「頂部佈局 Header」:左上 logo 常駐在跨頁 global header,
// 下面才是當前頁的 page header(顯示內容標題)。對齊 DS AppShell primary-header mode(app-shell.spec.md
// 「primary-header = primary-sidebar + 一條 global header」)——不是重新設計,是切換既有 layout mode。
// viewportInsetTop 讓 sidebar 從 globalHeader 底部起算(primary-header mode 必傳,否則 sidebar 會蓋住
// globalHeader,見 sidebar.tsx「可被 viewportInsetTop prop override(per AppShell primary-header)」)。
function AppSidebar() {
  return (
    <Sidebar collapsible="icon" viewportInsetTop="var(--chrome-header-height)">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ id, label, icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton id={id} startIcon={icon} tooltip={label}>
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

// Logo(WorkspaceBrand)——primary-header mode 放 GlobalHeader 左側,不再放 SidebarHeader
// (app-shell.spec.md「WorkspaceBrand 放置 SSOT」:globalHeader 存在時 sidebar 內不重複)。
function WorkspaceBrand() {
  return (
    <div className="flex items-center gap-[var(--layout-space-tight)] min-w-0">
      <Avatar alt="HR Pulse" size={24} shape="square" color="indigo" solid />
      <span className="text-body-lg font-medium truncate">HR Pulse</span>
    </div>
  )
}

// 通知內容 —— 最新一筆在最上面(對齊 INSIGHTS 同一「新→舊」慣例)。皆為 user 給定原文。
const NOTIFICATIONS = [
  { id: 'hrpo-insights', text: 'HRPO Analyses Team has uploaded the latest insights', time: '2026/08/26 13:00' },
  { id: 'new-hire-perf', text: 'New Hire performance data has been updated!', time: '2026/08/26 06:00' },
]

// @story-baseline: @qijenchen/design-system/components/Popover/popover.stories.tsx#FilterPanel —
// List-as-region 場景(見 popover.tsx PopoverBody docblock):PopoverBody 撤掉 chrome padding,
// consumer 自管 list 結構。
function NotificationsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="tertiary"
          size="sm"
          iconOnly
          startIcon={Bell}
          aria-label={`通知 (${NOTIFICATIONS.length} 則)`}
          overlayBadge={<Badge count={NOTIFICATIONS.length} variant="high" />}
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Notifications</PopoverTitle>
        </PopoverHeader>
        <PopoverBody className="!px-0 !py-0">
          <div className="flex flex-col py-[var(--layout-space-tight)]">
            {NOTIFICATIONS.map((n) => (
              <div
                key={n.id}
                className="flex flex-col gap-[var(--layout-space-tight)] px-[var(--layout-space-loose)] py-[var(--layout-space-tight)] hover:bg-neutral-hover"
              >
                <p className="text-body text-foreground m-0">{n.text}</p>
                <span className="text-caption text-fg-muted">{n.time}</span>
              </div>
            ))}
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

// @story-baseline: @qijenchen/design-system/components/AccountMenu/account-menu.stories.tsx
// 跨頁 global header:logo(左)+ sidebar toggle(leadingRail)+ 通知 + 帳號入口(右)。
// 對齊 app-shell.spec.md「帳號入口(Account entry)放置 SSOT」——primary-header mode 帳號入口在
// globalHeader 右側,不放 SidebarFooter(避免重複)。
function GlobalHeader() {
  return (
    <ChromeHeader className="bg-surface" leadingRail={<SidebarTrigger />}>
      <WorkspaceBrand />
      <div className="flex-1" />
      <NotificationsPopover />
      <AccountMenu user={{ name: 'CHRO', avatar: { color: 'indigo' } }} />
    </ChromeHeader>
  )
}

// 當前頁 local page header——只保留頁面層級內容(標題 / org 篩選),trigger 與帳號已在 GlobalHeader。
function PageHeader({ title, org, onOrgChange }: { title: string; org: string; onOrgChange: (value: string) => void }) {
  return (
    <ChromeHeader className="bg-surface">
      <h1 className="text-body-lg font-medium flex-1 truncate">{title}</h1>
      <Tag color="blue">CHRO view</Tag>
      <Select
        options={ORG_OPTIONS}
        value={org}
        onChange={onOrgChange}
        aria-label="Organization"
        width="hug"
      />
    </ChromeHeader>
  )
}

function ScoreCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-divider bg-surface p-[var(--layout-space-tight)] ${className}`}>
      {children}
    </div>
  )
}

function OverviewPage() {
  return (
    <div className="px-[var(--layout-space-tight)] py-[var(--layout-space-tight)] space-y-[var(--layout-space-tight)]">
      {/* Row 1: Turnover rate(折線,三系列)+ Hiring gap(長條)— 橫向兩張卡 */}
      {/* 2026-08-31 user 指定:Turnover rate 與 Hiring Gap 兩張圖表左右交換位置(Hiring Gap 現在在左)。 */}
      <section className="flex gap-[var(--layout-space-loose)] h-[280px]">
        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <CardTitleWithUpdated title="Hiring Gap" updatedAt="2026/08/26 06:00" />
          {/* 標題與圖表間距拉開至 16px(loose token,對齊 designer 規範下限)。
              @story-baseline: @qijenchen/design-system/components/Chart/chart.stories.tsx#BarChartRevenue —
              IDL 排前面(藍)、DL 排後面(紫),各自 Approved(深)+ Gap(淺)疊加。margin.top 為圖表 SVG 座標數值
              (非 Tailwind spacing class,不受 layout-space 規則約束),留白給長條上方 +Gap 註記。
              單一 Y 軸,起始 10,000、每格 1,000(user 指定)。 */}
          <ChartContainer config={hiringGapConfig} className="flex-1 min-h-0 mt-[var(--layout-space-loose)]">
            <BarChart accessibilityLayer data={HIRING_GAP_TREND} margin={{ top: 28 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
              {/* 每 1,000 一格(user 指定),但 12 格文字塞進 ~200px 高會互相重疊,故只在偶數格(每 2,000)顯示文字標籤、
                  奇數格只留格線 —— 常見 major/minor gridline 慣例,格線解析度仍是 1,000。 */}
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                domain={[10000, 21000]}
                ticks={[10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000]}
                interval={0}
                tickFormatter={(v: number) => (v % 2000 === 0 ? v.toLocaleString() : '')}
              />
              <ChartTooltip content={<ChartTooltipContent formatter={hiringGapTooltipFormatter} />} />
              <Bar dataKey="idlApproved" stackId="idl" fill="var(--color-idlApproved)" radius={2} />
              <Bar dataKey="idlGap" stackId="idl" fill="var(--color-idlGap)" radius={2}>
                <LabelList
                  dataKey="idlGap"
                  position="top"
                  formatter={hiringGapLabelFormatter}
                  className="text-caption"
                  style={{ fill: 'var(--fg-secondary)' }}
                />
              </Bar>
              <Bar dataKey="dlApproved" stackId="dl" fill="var(--color-dlApproved)" radius={2} />
              <Bar dataKey="dlGap" stackId="dl" fill="var(--color-dlGap)" radius={2}>
                <LabelList
                  dataKey="dlGap"
                  position="top"
                  formatter={hiringGapLabelFormatter}
                  className="text-caption"
                  style={{ fill: 'var(--fg-secondary)' }}
                />
              </Bar>
              {/* Recharts Legend 預設會依內部 stackId 字母排序(dl < idl)自動排 DL 在前,與 IDL 排最前面的要求相反 —
                  改用自訂 content function,直接照 hiringGapConfig 順序(IDL 先)畫兩個色塊,不經 recharts 自動排序。 */}
              <ChartLegend
                content={() => (
                  <div className="flex items-center justify-center gap-[var(--layout-space-loose)] pt-[var(--layout-space-tight)]">
                    <div className="flex items-center gap-[var(--layout-space-tight)] text-fg-secondary text-caption">
                      <Square size={8} fill={hiringGapConfig.idlApproved.color} stroke="none" />
                      IDL
                    </div>
                    <div className="flex items-center gap-[var(--layout-space-tight)] text-fg-secondary text-caption">
                      <Square size={8} fill={hiringGapConfig.dlApproved.color} stroke="none" />
                      DL
                    </div>
                  </div>
                )}
              />
            </BarChart>
          </ChartContainer>
        </ScoreCard>

        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <CardTitleWithUpdated title="Turnover rate" updatedAt="2026/08/26 06:00" />
          {/* 標題與圖表間距拉開至 16px(loose token,對齊 designer 規範下限) */}
          <ChartContainer config={turnoverConfig} className="flex-1 min-h-0 mt-[var(--layout-space-loose)]">
            <LineChart accessibilityLayer data={TURNOVER_TREND}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} domain={[0, 10]} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              {/* Recharts Legend 預設依 dataKey 字母排序(newcomer < turnover < voluntary),
                  跟 user 指定「Turnover / Newcomer turnover / Voluntary turnover」順序不同 —
                  改用自訂 content function,直接照 turnoverConfig 順序畫,不經 recharts 自動排序
                  (同 Hiring Gap legend 已用的手法)。 */}
              <ChartLegend
                content={() => (
                  <div className="flex items-center justify-center gap-[var(--layout-space-loose)] pt-[var(--layout-space-tight)]">
                    {(['turnover', 'newcomer', 'voluntary'] as const).map((key) => (
                      <div key={key} className="flex items-center gap-[var(--layout-space-tight)] text-fg-secondary text-caption">
                        <Square size={8} fill={turnoverConfig[key].color} stroke="none" />
                        {turnoverConfig[key].label}
                      </div>
                    ))}
                  </div>
                )}
              />
              <Line dataKey="turnover" type="monotone" stroke="var(--color-turnover)" strokeWidth={2} dot={false} />
              <Line dataKey="newcomer" type="monotone" stroke="var(--color-newcomer)" strokeWidth={2} dot={false} />
              <Line dataKey="voluntary" type="monotone" stroke="var(--color-voluntary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </ScoreCard>
      </section>

      {/* Row 2: 5 張 key information 小卡,等寬 */}
      <section className="grid grid-cols-5 gap-[var(--layout-space-loose)]">
        {KEY_INFO_CARDS.map((card) => (
          <KeyInfoCard key={card.id} card={card} />
        ))}
      </section>

      {/* Row 3: HRPO Insights — 拿掉 Attention Required / Recent Data Updates 後拉上來,給足空間 */}
      <ScoreCard>
        <div className="text-body font-bold">Domain Insights</div>
        <div className="flex flex-col gap-2 mt-[var(--layout-space-tight)]">
          {/* 2026-08-28 user 指定:拿掉三則的 pin icon;第一則(最新一筆)改用 Sparkles 象徵「new」,
              之後每次有新內容上傳時優先插入陣列最上面(INSIGHTS 已依時間新→舊排序),自動沿用同一顯示規則。 */}
          {INSIGHTS.map((insight, index) => (
            <div key={insight.id} className="flex gap-2 rounded-r-md border-l-[3px] border-primary bg-primary-subtle p-2">
              {index === 0 && <Sparkles size={13} className="mt-0.5 flex-none text-primary" />}
              <p className="text-caption text-foreground leading-relaxed m-0">
                {insight.text}
                <span className="block mt-1 text-caption text-fg-muted font-medium">— {insight.source}</span>
              </p>
            </div>
          ))}
        </div>
      </ScoreCard>
    </div>
  )
}

// Pillar 細節頁 — 5 個 sidebar nav 項目(Talent/Leadership/Culture/Engagement/Globalization)共用同一 template:
// hero score + 關鍵指標(DescriptionList)+ 該 pillar 季度趨勢 + 重點說明。
function PillarDetailPage({ pillar }: { pillar: PillarDetail }) {
  const Icon = pillar.icon
  const config = {
    value: { label: pillar.label, color: 'var(--chart-1)' },
  } satisfies ChartConfig
  return (
    <div className="px-[var(--layout-space-tight)] py-[var(--layout-space-tight)] space-y-[var(--layout-space-tight)]">
      <section className="flex gap-[var(--layout-space-loose)]">
        <ScoreCard className="flex-none w-[220px] flex flex-col items-center justify-center text-center gap-1">
          <Icon size={22} className="text-fg-secondary" />
          <div className="text-h1 font-bold text-primary tabular-nums mt-1">{pillar.score}</div>
          <div className="text-body font-medium text-fg-secondary">{pillar.label}</div>
          <DeltaLabel delta={pillar.delta} />
        </ScoreCard>
        <ScoreCard className="flex-1 min-w-0">
          <div className="text-body font-bold">Key Metrics</div>
          <DescriptionList cols={2} className="mt-[var(--layout-space-tight)]">
            {pillar.metrics.map((m) => (
              <DescriptionItem key={m.label} label={m.label}>{m.value}</DescriptionItem>
            ))}
          </DescriptionList>
        </ScoreCard>
      </section>

      <section className="flex gap-[var(--layout-space-loose)] h-[220px]">
        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <div className="text-body font-bold">Quarterly Trend</div>
          <ChartContainer config={config} className="flex-1 min-h-0 mt-[var(--layout-space-tight)]">
            <BarChart accessibilityLayer data={pillar.trend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            </BarChart>
          </ChartContainer>
        </ScoreCard>

        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col">
          <div className="text-body font-bold">Notes</div>
          <div className="flex gap-2 rounded-r-md border-l-[3px] border-primary bg-primary-subtle p-2 mt-[var(--layout-space-tight)]">
            <Pin size={13} className="mt-0.5 flex-none text-primary" />
            <p className="text-caption text-foreground leading-relaxed m-0">{pillar.note}</p>
          </div>
        </ScoreCard>
      </section>
    </div>
  )
}

export default function App() {
  const [activeId, setActiveId] = useState<string>('overview')
  const [org, setOrg] = useState('overall')

  // 'talent' / 'leadership' 走各自專屬頁面(tab + key/leading drill-down),不套用其餘 pillar
  // 共用的 PillarDetailPage template(見 PillarId type 註解)。
  const isTalent = activeId === 'talent'
  const isLeadership = activeId === 'leadership'
  const activePillar = !isTalent && !isLeadership && activeId in PILLAR_DETAILS ? PILLAR_DETAILS[activeId as PillarId] : undefined
  const pageTitle = isTalent ? 'Talent' : isLeadership ? 'Leadership' : activePillar ? `${activePillar.label} Detail` : 'Overall'

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <SidebarProvider activeId={activeId} onActiveChange={setActiveId}>
        {/* @story-baseline: @qijenchen/design-system/components/AppShell/app-shell.stories.tsx#PrimaryHeader —
            2026-08-31 user 指定改採 TSMC guideline「頂部佈局 Header」:logo 在 globalHeader 左、
            page header 在下方顯示內容標題,對齊 AppShell primary-header layout mode。 */}
        <AppShell
          layout="primary-header"
          globalHeader={<GlobalHeader />}
          sidebar={<AppSidebar />}
          header={<PageHeader title={pageTitle} org={org} onOrgChange={setOrg} />}
        >
          {isTalent ? <TalentPage /> : isLeadership ? <LeadershipPage /> : activePillar ? <PillarDetailPage pillar={activePillar} /> : <OverviewPage />}
        </AppShell>
      </SidebarProvider>
    </TooltipProvider>
  )
}
