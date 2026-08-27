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
  Pin,
  Info,
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

// 卡片標題旁的「上次更新」提示 —— hover icon 才顯示時間,不佔用標題列空間。
// @story-baseline: @qijenchen/design-system/components/Tooltip/tooltip.stories.tsx
function CardTitleWithUpdated({ title, updatedAt }: { title: string; updatedAt: string }) {
  return (
    <div className="flex items-center gap-1">
      {/* 24/130(text-h3 token)—— 對齊 designer 指定字級/行高級距 */}
      <span className="text-h3 font-bold">{title}</span>
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
const TURNOVER_TREND = [
  { quarter: '2026 Q1', turnoverRate: 7.2, voluntary: 5.6, regrettable: 4.0 },
  { quarter: '2026 Q2', turnoverRate: 6.8, voluntary: 5.2, regrettable: 3.6 },
  { quarter: '2026 Q3', turnoverRate: 7.6, voluntary: 5.9, regrettable: 4.3 },
  { quarter: '2026 Q4', turnoverRate: 6.5, voluntary: 4.8, regrettable: 3.4 },
]
const turnoverConfig = {
  turnoverRate: { label: 'Turnover rate', color: 'var(--chart-1)' },
  regrettable: { label: 'Regrettable Turnover', color: 'var(--chart-2)' },
  voluntary: { label: 'Voluntary Turnover', color: 'var(--chart-3)' },
} satisfies ChartConfig

const HIRING_GAP_TREND = [
  { quarter: '2026 Q1', gap: 15 },
  { quarter: '2026 Q2', gap: 12 },
  { quarter: '2026 Q3', gap: 9 },
  { quarter: '2026 Q4', gap: 12 },
]
const hiringGapConfig = {
  gap: { label: 'Hiring gap', color: 'var(--chart-1)' },
} satisfies ChartConfig

// 統一時間格式:`<來源>, YYYY/MM/DD`(對齊 DS DatePicker 預設格式 —— date-picker.tsx:37
// 「Default format:YYYY/MM/DD,year-first ISO-like,locale-independent」,非隨意 MMM D, YYYY)。
// 依時間新→舊排序,最新一則在最上面。
const INSIGHTS = [
  { id: 'hiring-gap', text: 'Hiring gap narrowed to 12% in Q4 2026 after two quarters of improvement — driven by faster time-to-fill in R&D.', source: 'HRPO Analysis Team, 2026/12/31' },
  { id: 'briefing', text: 'Q2 Briefing Pack is ready for review. Key highlights: hiring efficiency improved, engagement stable, performance review completion lagging.', source: 'HRPO Analysis Team, 2026/06/30' },
  { id: 'eng-turnover', text: 'Engineering turnover correlates strongly with market comp gap. Recommend targeted retention package for critical tech roles.', source: 'HRPO Analysis Team, 2026/06/28' },
]

// 5 張 key information 小卡(等寬),放在 Turnover rate / Hiring gap 之下、HRPO Insights 之上。皆為假數字。
const KEY_INFO_CARDS: { id: string; title: string; subtitle?: string; value: string; delta: Delta; deltaSuffix: string; updatedAt: string }[] = [
  { id: 'new-hire-engagement', title: 'New Hire Performance', subtitle: 'Wecare Survey', value: '40%', delta: { direction: 'up', text: '+2%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00' },
  { id: 'internal-mobility', title: 'Internal Mobility', value: '40%', delta: { direction: 'up', text: '+5%' }, deltaSuffix: 'vs 14 days ago', updatedAt: '2026/08/26 06:00' },
  { id: 'new-hire-engagement-2', title: 'New Hire Engagement', subtitle: 'Wecare Survey', value: '80%', delta: { direction: 'down', text: '-5%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00' },
  { id: 'manager-fulfillment-gap', title: 'Manager Fulfillment Gap', value: '12%', delta: { direction: 'up', text: '+0.8%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00' },
  { id: 'local-manager-representation', title: 'Local Manager Representation', value: '50%', delta: { direction: 'up', text: '+2%' }, deltaSuffix: 'vs 2026Q3', updatedAt: '2026/08/26 06:00' },
]

function KeyInfoCard({ card }: { card: (typeof KEY_INFO_CARDS)[number] }) {
  return (
    <ScoreCard className="flex flex-col">
      {/* Large/500,16/150(text-body-lg font-medium token)+ 加深至 text-foreground(對齊 designer 要求「黑一點」)。
          固定保留 2 行高度(不論標題實際幾行),避免長標題(如 Local Manager Representation)換行撐開、
          導致下方數字跟別張卡片高度對不齊 —— 對齊 designer 要求「數字高度對齊,不要上上下下的」。 */}
      {/* @story-baseline: @qijenchen/design-system/components/Tooltip/tooltip.stories.tsx#Default —
          hover Info icon 顯示假的最後更新時間,對齊 Turnover rate/Hiring Gap 卡片已用的同一 Tooltip pattern */}
      {/* @layout-space-magic-ok: min-h-[3rem] 是固定 2 行標題高度預留(非 spacing/gap),延續本檔既有 designer 對齊需求 */}
      <div className="flex items-start gap-1 min-h-[3rem]">
        <span className="text-body-lg font-medium text-foreground">{card.title}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="inline-flex items-center text-fg-muted cursor-default flex-none"
              aria-label={`Last updated ${card.updatedAt}`}
            >
              <Info size={14} />
            </span>
          </TooltipTrigger>
          <TooltipContent>Last updated: {card.updatedAt}</TooltipContent>
        </Tooltip>
      </div>
      {/* subtitle 固定佔一行高度(有內容顯示、無內容 invisible 佔位),讓所有卡片的數字 baseline 對齊,不因有無 subtitle 上下飄移 */}
      <div className={`text-caption text-fg-muted ${card.subtitle ? '' : 'invisible'}`}>{card.subtitle || ' '}</div>
      {/* 數字至少 32px(text-h2 token = 32px,designer guideline 下限) */}
      <div className="text-h2 font-bold tabular-nums mt-[var(--layout-space-tight)]">{card.value}</div>
      <div className="mt-1">
        <DeltaLabel delta={card.delta} />
        <span className="text-caption text-fg-muted"> {card.deltaSuffix}</span>
      </div>
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
          <ChartContainer config={turnoverConfig} className="flex-1 min-h-0 mt-[var(--layout-space-tight)]">
            <LineChart accessibilityLayer data={TURNOVER_TREND}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} domain={[0, 10]} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line dataKey="turnoverRate" type="monotone" stroke="var(--color-turnoverRate)" strokeWidth={2} dot={false} />
              <Line dataKey="regrettable" type="monotone" stroke="var(--color-regrettable)" strokeWidth={2} dot={false} />
              <Line dataKey="voluntary" type="monotone" stroke="var(--color-voluntary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </ScoreCard>

        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <CardTitleWithUpdated title="Hiring Gap" updatedAt="2026/08/26 06:00" />
          <ChartContainer config={hiringGapConfig} className="flex-1 min-h-0 mt-[var(--layout-space-tight)]">
            <BarChart accessibilityLayer data={HIRING_GAP_TREND}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="gap" fill="var(--color-gap)" radius={4} />
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
        <div className="text-body font-bold">HRPO Insights</div>
        <div className="flex flex-col gap-2 mt-[var(--layout-space-tight)]">
          {INSIGHTS.map((insight) => (
            <div key={insight.id} className="flex gap-2 rounded-r-md border-l-[3px] border-primary bg-primary-subtle p-2">
              <Pin size={13} className="mt-0.5 flex-none text-primary" />
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
