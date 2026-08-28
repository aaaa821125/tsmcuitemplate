// HR Pulse — Executive Overview + per-pillar detail pages
//
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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  ChromeHeader,
  TooltipProvider,
  Avatar,
  ItemAvatar,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  Select,
  Tag,
  Badge,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
  DescriptionList,
  DescriptionItem,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@qijenchen/design-system'
import {
  LayoutDashboard,
  Users,
  Award,
  Heart,
  MessageSquare,
  Globe,
  User,
  Settings,
  LogOut,
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
function CardTitleWithUpdated({ title, updatedAt }: { title: string; updatedAt: string }) {
  return (
    <div className="flex items-center gap-1">
      {/* 24/130(text-h3 token)—— 對齊 designer 指定字級/行高級距;字重 medium(對齊 designer 要求) */}
      <span className="text-h3 font-medium">{title}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center text-fg-muted cursor-default" aria-label={`Last updated ${updatedAt}`}>
            <Info size={14} />
          </span>
        </TooltipTrigger>
        <TooltipContent>Last updated: {updatedAt}</TooltipContent>
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
  return (
    <div className="flex w-full flex-1 justify-between gap-[var(--layout-space-tight)]">
      <span className="text-fg-secondary">{hiringGapConfig[key].label}</span>
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
  { id: 'new-hire-engagement-2', title: 'New Hire Engagement (EES Survey)', value: '80%', delta: { direction: 'down', text: '-5%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00', description: '% of new hires reporting positive engagement in first 6 months (EES survey response rate ~82%)' },
  { id: 'manager-fulfillment-gap', title: 'Manager Fulfillment Gap', value: '12%', delta: { direction: 'up', text: '+0.8%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00', description: '% gap between approved manager headcount and actual filled manager roles (current quarter)' },
  { id: 'local-manager-representation', title: 'Local Manager Representation (Oversea fab)', value: '50%', delta: { direction: 'up', text: '+2%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00', description: '% of overseas fab manager roles held by local (in-country) hires' },
]

function KeyInfoCard({ card }: { card: (typeof KEY_INFO_CARDS)[number] }) {
  return (
    <ScoreCard className="flex flex-col">
      {/* Large/500,16/150(text-body-lg font-medium token)+ 加深至 text-foreground(對齊 designer 要求「黑一點」)。
          固定保留 2 行高度(不論標題實際幾行),避免長標題(如 Local Manager Representation)換行撐開、
          導致下方數字跟別張卡片高度對不齊 —— 對齊 designer 要求「數字高度對齊,不要上上下下的」。 */}
      {/* @layout-space-magic-ok: min-h-[3rem] 是固定 2 行標題高度預留(非 spacing/gap),延續本檔既有 designer 對齊需求 */}
      <div className="text-body-lg font-medium text-foreground min-h-[3rem]">{card.title}</div>
      {/* 2026-08-28 user 指定:(!) hover 提示拿掉,Last updated 日期改常駐顯示於標題下方、灰階小字
          (text-caption + text-fg-muted,對齊本檔既有小字說明規範,如 deltaSuffix / Insights source 行)。 */}
      <div className="text-caption text-fg-muted">Last updated: {card.updatedAt}</div>
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
      {/* Key data description —— 原 (!) hover 內容改常駐顯示,同樣走 text-caption + text-fg-muted 小字灰階規範 */}
      <div className="text-caption text-fg-muted mt-[var(--layout-space-tight)]">{card.description}</div>
    </ScoreCard>
  )
}

type PillarId = 'talent' | 'leadership' | 'culture' | 'engagement' | 'globalization'

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
  talent: {
    id: 'talent', label: 'Talent', icon: Users, score: 82, delta: { direction: 'up', text: '+5' },
    metrics: [
      { label: 'Time to Fill', value: '32 days' },
      { label: 'Cost per Hire', value: '$4,850' },
      { label: 'Offer Acceptance Rate', value: '87%' },
      { label: 'Open Requisitions', value: '24' },
    ],
    trend: [{ period: "Q3'24", value: 74 }, { period: "Q4'24", value: 78 }, { period: "Q1'25", value: 80 }, { period: "Q2'25", value: 82 }],
    note: 'Offer acceptance rate improved to 87% this quarter, above the 80% target. Continue monitoring time-to-fill in Engineering.',
  },
  leadership: {
    id: 'leadership', label: 'Leadership', icon: Award, score: 75, delta: { direction: 'up', text: '+2' },
    metrics: [
      { label: 'Succession Coverage', value: '68%' },
      { label: 'High-Potential Retention', value: '91%' },
      { label: 'Leadership Bench Strength', value: 'Medium' },
      { label: 'Avg. Span of Control', value: '6.2' },
    ],
    trend: [{ period: "Q3'24", value: 70 }, { period: "Q4'24", value: 72 }, { period: "Q1'25", value: 73 }, { period: "Q2'25", value: 75 }],
    note: 'Succession coverage for critical roles remains below the 75% target — 12 roles still lack a ready-now successor.',
  },
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

function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
          <Avatar alt="HR Pulse" size={24} shape="square" color="indigo" solid />
          <span className="text-body-lg font-medium truncate group-data-[collapsible=icon]:hidden">HR Pulse</span>
        </div>
      </SidebarHeader>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton asChild tooltip="檢視身分">
                  <button type="button" aria-label="檢視身分與帳號設定">
                    <ItemAvatar alt="CHRO" color="indigo" />
                    <span data-sidebar="menu-label" className="min-w-0 flex-1 truncate">View as CHRO</span>
                  </button>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" minWidth={280}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>當前使用者</DropdownMenuLabel>
                  <DropdownMenuItem startIcon={User}>個人資料</DropdownMenuItem>
                  <DropdownMenuItem startIcon={Settings}>設定</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuItem startIcon={LogOut}>登出</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function PageHeader({ title, org, onOrgChange }: { title: string; org: string; onOrgChange: (value: string) => void }) {
  return (
    <ChromeHeader className="bg-surface">
      <SidebarTrigger />
      <h1 className="text-body-lg font-medium flex-1 truncate">{title}</h1>
      <Tag color="blue">CHRO view</Tag>
      <Select
        options={ORG_OPTIONS}
        value={org}
        onChange={onOrgChange}
        aria-label="Organization"
        width="hug"
      />
      <Button
        variant="tertiary"
        size="sm"
        iconOnly
        startIcon={Bell}
        aria-label="通知 (3 則)"
        overlayBadge={<Badge count={3} variant="high" />}
      />
      <Avatar alt="CHRO" size={34} color="indigo" solid>CH</Avatar>
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
      <section className="flex gap-[var(--layout-space-loose)] h-[280px]">
        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <CardTitleWithUpdated title="Turnover rate" updatedAt="2026/08/26 06:00" />
          {/* 標題與圖表間距拉開至 16px(loose token,對齊 designer 規範下限) */}
          <ChartContainer config={turnoverConfig} className="flex-1 min-h-0 mt-[var(--layout-space-loose)]">
            <LineChart accessibilityLayer data={TURNOVER_TREND}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} domain={[0, 10]} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line dataKey="turnover" type="monotone" stroke="var(--color-turnover)" strokeWidth={2} dot={false} />
              <Line dataKey="newcomer" type="monotone" stroke="var(--color-newcomer)" strokeWidth={2} dot={false} />
              <Line dataKey="voluntary" type="monotone" stroke="var(--color-voluntary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </ScoreCard>

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

  const activePillar = activeId in PILLAR_DETAILS ? PILLAR_DETAILS[activeId as PillarId] : undefined

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <SidebarProvider activeId={activeId} onActiveChange={setActiveId}>
        <AppShell
          layout="primary-sidebar"
          sidebar={<AppSidebar />}
          header={<PageHeader title={activePillar ? `${activePillar.label} Detail` : 'Executive Overview'} org={org} onOrgChange={setOrg} />}
        >
          {activePillar ? <PillarDetailPage pillar={activePillar} /> : <OverviewPage />}
        </AppShell>
      </SidebarProvider>
    </TooltipProvider>
  )
}
