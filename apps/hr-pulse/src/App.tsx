// HR Pulse — Executive Overview + per-theme detail pages
//
// @story-baseline: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#IconCollapse
// @story-baseline: @qijenchen/design-system/components/Select/select.stories.tsx#Modes
// @story-baseline: @qijenchen/design-system/components/Alert/alert.stories.tsx
// @story-baseline: @qijenchen/design-system/components/ScrollArea/scroll-area.stories.tsx
// @story-baseline: @qijenchen/design-system/components/PeoplePicker/people-picker.stories.tsx
// @story-baseline: @qijenchen/design-system/components/DescriptionList/description-list.stories.tsx
// @story-baseline: @qijenchen/design-system/components/Chart/chart.stories.tsx#BarChartRevenue
// (AppShell + Sidebar + ChromeHeader shell 對齊 apps/template/src/App.tsx 同一 canonical baseline;
// Select width 用 width="hug",非 field-controls.spec.md「寬度軸」硬寬 class)
//
// SSOT 鐵律:
//   - Consumer 只 import `@qijenchen/design-system` public exports
//   - 禁修改 DS source(走 fork DS repo)
//   - 視覺 token 透過 DS 提供的 CSS variable / utility class 消費
//
// 導覽:sidebar 項目(SidebarMenuButton id=)自動驅動 SidebarProvider.activeId,
// Overview 6 個主題卡也可點擊,兩者共用同一 activeId → 各自的主題細節頁。

import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  Alert,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  buildPersonProfileCard,
  ScrollArea,
  DescriptionList,
  DescriptionItem,
} from '@qijenchen/design-system'
import {
  LayoutDashboard,
  Target,
  RefreshCw,
  MessageSquare,
  Star,
  Building2,
  DollarSign,
  User,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
  Pin,
} from 'lucide-react'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'acquire', label: 'Acquire', icon: Target },
  { id: 'retain', label: 'Retain', icon: RefreshCw },
  { id: 'engage', label: 'Engage', icon: MessageSquare },
  { id: 'perform', label: 'Perform', icon: Star },
  { id: 'plan', label: 'Plan', icon: Building2 },
  { id: 'compensate', label: 'Compensate', icon: DollarSign },
] as const

const PERIOD_OPTIONS = [
  { value: 'q2-2025', label: 'Q2 2025' },
  { value: 'q1-2025', label: 'Q1 2025' },
  { value: 'q4-2024', label: 'Q4 2024' },
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

type ThemeId = 'acquire' | 'retain' | 'engage' | 'perform' | 'plan' | 'compensate'

type ThemeDetail = {
  id: ThemeId
  label: string
  icon: typeof Target
  score: number
  delta: Delta
  metrics: { label: string; value: string }[]
  trend: { period: string; value: number }[]
  note: string
}

// 各主題細節頁資料 — 與 Overview 的 THEME_SCORES / ATTENTION_ITEMS 同一敘事(數字互相呼應)。
const THEME_DETAILS: Record<ThemeId, ThemeDetail> = {
  acquire: {
    id: 'acquire', label: 'Acquire', icon: Target, score: 82, delta: { direction: 'up', text: '+5' },
    metrics: [
      { label: 'Time to Fill', value: '32 days' },
      { label: 'Cost per Hire', value: '$4,850' },
      { label: 'Offer Acceptance Rate', value: '87%' },
      { label: 'Open Requisitions', value: '24' },
    ],
    trend: [{ period: "Q3'24", value: 74 }, { period: "Q4'24", value: 78 }, { period: "Q1'25", value: 80 }, { period: "Q2'25", value: 82 }],
    note: 'Offer acceptance rate improved to 87% this quarter, above the 80% target. Continue monitoring time-to-fill in Engineering.',
  },
  retain: {
    id: 'retain', label: 'Retain', icon: RefreshCw, score: 71, delta: { direction: 'down', text: '-3' },
    metrics: [
      { label: 'Voluntary Turnover', value: '12.4%' },
      { label: 'Involuntary Turnover', value: '3.1%' },
      { label: 'Regrettable Loss Rate', value: '8.2%' },
      { label: 'Avg. Tenure', value: '3.4 yrs' },
    ],
    trend: [{ period: "Q3'24", value: 76 }, { period: "Q4'24", value: 75 }, { period: "Q1'25", value: 74 }, { period: "Q2'25", value: 71 }],
    note: "Engineering turnover (8.2%) is the top contributor to this quarter's decline — correlates with market comp gap.",
  },
  engage: {
    id: 'engage', label: 'Engage', icon: MessageSquare, score: 85, delta: { direction: 'up', text: '+2' },
    metrics: [
      { label: 'eNPS', value: '+34' },
      { label: 'Survey Participation', value: '91%' },
      { label: 'Manager Effectiveness', value: '4.2 / 5' },
      { label: 'Recognition Usage', value: '68%' },
    ],
    trend: [{ period: "Q3'24", value: 81 }, { period: "Q4'24", value: 82 }, { period: "Q1'25", value: 83 }, { period: "Q2'25", value: 85 }],
    note: 'Engagement remains stable; manager effectiveness is the strongest driver this quarter.',
  },
  perform: {
    id: 'perform', label: 'Perform', icon: Star, score: 58, delta: { direction: 'down', text: '-12' },
    metrics: [
      { label: 'Review Completion', value: '58%' },
      { label: 'On-Track Goals', value: '71%' },
      { label: 'Avg. Training Hours', value: '12.4 hrs' },
      { label: 'Top-Talent Rate', value: '18%' },
    ],
    trend: [{ period: "Q3'24", value: 74 }, { period: "Q4'24", value: 72 }, { period: "Q1'25", value: 70 }, { period: "Q2'25", value: 58 }],
    note: 'Performance reviews are 42% behind target, due June 30 — owned by Performance/L&D Division.',
  },
  plan: {
    id: 'plan', label: 'Plan', icon: Building2, score: 80, delta: { direction: 'up', text: '+1' },
    metrics: [
      { label: 'Headcount vs. Plan', value: '+4%' },
      { label: 'Absenteeism Rate', value: '2.8%' },
      { label: 'Revenue per Employee', value: '$312K' },
      { label: 'Span of Control', value: '6.2' },
    ],
    trend: [{ period: "Q3'24", value: 77 }, { period: "Q4'24", value: 78 }, { period: "Q1'25", value: 79 }, { period: "Q2'25", value: 80 }],
    note: 'Engineering headcount is 4% over plan — review hiring pace against budget.',
  },
  compensate: {
    id: 'compensate', label: 'Compensate', icon: DollarSign, score: 76, delta: { direction: 'flat', text: '0' },
    metrics: [
      { label: 'Compa-Ratio', value: '0.98' },
      { label: 'Pay Equity Ratio', value: '98.2%' },
      { label: 'Benefits Enrollment', value: '94%' },
      { label: 'Bonus Payout Rate', value: '102%' },
    ],
    trend: [{ period: "Q3'24", value: 76 }, { period: "Q4'24", value: 76 }, { period: "Q1'25", value: 76 }, { period: "Q2'25", value: 76 }],
    note: 'Pay equity ratio remains within the target band across all job levels.',
  },
}

const THEME_SCORES: ThemeDetail[] = [
  THEME_DETAILS.acquire, THEME_DETAILS.retain, THEME_DETAILS.engage,
  THEME_DETAILS.perform, THEME_DETAILS.plan, THEME_DETAILS.compensate,
]

type AttentionVariant = 'error' | 'warning' | 'success'

// 消費 DS `Alert`(alert.spec.md:「頁面內需要持續存在的狀態通知」+ variant 對應 icon/色彩 canonical),
// 取代手刻色塊 row —— title/description 對齊 Alert 既有 anatomy,不再自訂 status dot。
const ATTENTION_ITEMS: { id: string; variant: AttentionVariant; title: string; description: string }[] = [
  { id: 'perf-reviews', variant: 'error', title: 'Performance reviews at 58% — 42% behind target', description: 'Due June 30. Owner: Performance/L&D Division.' },
  { id: 'er-data', variant: 'error', title: 'Employee Relations data overdue', description: '0% submitted. Due Jul 5.' },
  { id: 'turnover', variant: 'warning', title: 'Voluntary turnover up 3% QoQ', description: 'Top affected: Engineering (8.2%).' },
  { id: 'headcount', variant: 'warning', title: 'Headcount 4% over plan in Engineering', description: 'Review hiring pace against budget.' },
]

const ACTIVITY_ROWS = [
  { id: 'comp', theme: 'Compensation & Benefits', date: 'Jun 30, 2025', time: '2:14 PM', uploader: 'M. Lai', employeeNumber: '103482' },
  { id: 'wfp', theme: 'Workforce Planning', date: 'Jun 30, 2025', time: '11:47 AM', uploader: 'R. Wu', employeeNumber: '108217' },
  { id: 'perf', theme: 'Performance/L&D', date: 'Jun 30, 2025', time: '9:02 AM', uploader: 'T. Hsu', employeeNumber: '105690' },
  { id: 'ta', theme: 'Talent Acquisition', date: 'Jun 28, 2025', time: '4:38 PM', uploader: 'J. Kao', employeeNumber: '101933' },
  { id: 'retain', theme: 'Retention & Turnover', date: 'Jun 28, 2025', time: '10:21 AM', uploader: 'S. Fang', employeeNumber: '107456' },
]

// Activity row — 3 欄(item / upload time / uploader),各欄各自留白、不互相擠壓:
// 消費 DS Avatar primitive(無 src → 自動降級 initials fallback,avatar.spec.md「Text fallback」canonical,
// 不依賴外部頭像圖床)+ buildPersonProfileCard(person avatar hover → ProfileCard),
// icon/姓名/工號橫向展開同一行(非直式堆疊),名字/工號直接顯示(非只靠 hover)。
function ActivityRow({ theme, date, time, uploader, employeeNumber }: { theme: string; date: string; time: string; uploader: string; employeeNumber: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-[var(--layout-space-loose)]">
      <span className="text-caption font-bold text-foreground min-w-0 truncate">{theme}</span>
      <span className="text-caption text-fg-muted tabular-nums whitespace-nowrap">{date}, {time}</span>
      <div className="flex items-center gap-2">
        <Avatar alt={uploader} size={24} hoverCard={buildPersonProfileCard({ name: uploader, employeeNumber })} />
        <span className="text-caption font-bold text-foreground whitespace-nowrap">{uploader}</span>
        <span className="text-caption text-fg-muted whitespace-nowrap">{employeeNumber}</span>
      </div>
    </div>
  )
}

const trendData = [
  { quarter: "Q3'24", score: 72 },
  { quarter: "Q4'24", score: 74 },
  { quarter: "Q1'25", score: 75 },
  { quarter: "Q2'25", score: 78 },
]
const trendConfig = {
  score: { label: 'HR Health Score', color: 'var(--chart-1)' },
} satisfies ChartConfig

const INSIGHTS = [
  { id: 'eng-turnover', text: 'Engineering turnover correlates strongly with market comp gap. Recommend targeted retention package for critical tech roles.', source: 'HRPO Analysis Team, Jun 28, 2025' },
  { id: 'briefing', text: 'Q2 Briefing Pack is ready for review. Key highlights: hiring efficiency improved, engagement stable, performance review completion lagging.', source: 'HRPO, Jun 30, 2025' },
]

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

function PageHeader({ title, period, onPeriodChange }: { title: string; period: string; onPeriodChange: (value: string) => void }) {
  return (
    <ChromeHeader className="bg-surface">
      <SidebarTrigger />
      <h1 className="text-body-lg font-medium flex-1 truncate">{title}</h1>
      <Tag color="blue">CHRO view</Tag>
      <Select
        options={PERIOD_OPTIONS}
        value={period}
        onChange={onPeriodChange}
        aria-label="報告期間"
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

function ScoreCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const interactive = onClick !== undefined
  return (
    <div
      className={`rounded-lg border border-divider bg-surface p-[var(--layout-space-tight)] ${interactive ? 'cursor-pointer transition-colors hover:border-primary hover:bg-primary-subtle' : ''} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } } : undefined}
    >
      {children}
    </div>
  )
}

function OverviewPage({ onNavigate }: { onNavigate: (id: ThemeId) => void }) {
  return (
    <div className="px-[var(--layout-space-tight)] py-[var(--layout-space-tight)] space-y-[var(--layout-space-tight)]">
      {/* Row 1: HR Health hero + 6 theme scores(可點擊 → 各自主題細節頁) */}
      <section className="grid grid-cols-4 gap-[var(--layout-space-tight)]">
        <ScoreCard className="row-span-2 flex flex-col items-center justify-center text-center gap-1">
          <div className="text-h1 font-bold text-primary tabular-nums">78</div>
          <div className="text-body font-medium text-fg-secondary">HR Health</div>
          <DeltaLabel delta={{ direction: 'up', text: '+3 vs Q1 2025' }} />
        </ScoreCard>
        {THEME_SCORES.map(({ id, label, icon: Icon, score, delta }) => (
          <ScoreCard key={id} className="flex flex-col items-center text-center gap-1" onClick={() => onNavigate(id)}>
            <Icon size={18} className="text-fg-secondary" />
            <div className="text-h3 font-bold tabular-nums mt-1">{score}</div>
            <div className="text-caption font-bold uppercase text-fg-muted">{label}</div>
            <DeltaLabel delta={delta} />
          </ScoreCard>
        ))}
      </section>

      {/* Row 2: Attention Required + Recent Data Updates */}
      <section className="grid grid-cols-2 gap-[var(--layout-space-loose)] items-stretch">
        <ScoreCard className="flex flex-col">
          <div className="text-body font-bold">Attention Required</div>
          {/* 填滿卡片剩餘高度(對齊右側 Recent Data Updates 卡片,由 grid items-stretch 決定),超出捲動 */}
          <ScrollArea className="flex-1 min-h-0 mt-[var(--layout-space-tight)]">
          <div className="flex flex-col gap-[var(--layout-space-tight)]">
            {ATTENTION_ITEMS.map((item) => (
              <Alert key={item.id} variant={item.variant} title={item.title} description={item.description} />
            ))}
          </div>
          </ScrollArea>
        </ScoreCard>

        <ScoreCard>
          <div className="text-body font-bold">Recent Data Updates</div>
          <p className="text-caption text-fg-muted mt-0.5">
            The 5 most recent refreshes across source teams — when each was updated and by whom.
          </p>
          <div className="mt-[var(--layout-space-tight)] flex flex-col">
            {ACTIVITY_ROWS.map((row, index) => (
              <div key={row.id} className={`py-[var(--layout-space-tight)] ${index > 0 ? 'border-t border-divider' : ''}`}>
                <ActivityRow {...row} />
              </div>
            ))}
          </div>
        </ScoreCard>
      </section>

      {/* Row 3: Quarterly Trend + HRPO Insights — flex(非 grid)+ 固定高度,子項超出各自捲動,不撐開版面 */}
      <section className="flex gap-[var(--layout-space-loose)] h-[168px]">
        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <div className="text-body font-bold">Quarterly Trend</div>
          {/* 卡片高度有限(視窗預算),直接給 ChartContainer 明確高度取代預設 aspect-video —— chart.spec.md
              「Recharts ResponsiveContainer 需 parent 有高度,不給 fallback 會坍塌」,明確高度即滿足此前提,
              不透過 AspectRatio 包裝(該組合未見於任何現有 consumer,經測試在固定高度 flex 卡片內不穩定) */}
          <ChartContainer config={trendConfig} className="flex-1 min-h-0 mt-[var(--layout-space-tight)]">
            <BarChart accessibilityLayer data={trendData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="score" fill="var(--color-score)" radius={4} />
            </BarChart>
          </ChartContainer>
        </ScoreCard>

        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col">
          <div className="text-body font-bold">HRPO Insights</div>
          <ScrollArea className="flex-1 min-h-0 mt-[var(--layout-space-tight)]">
          <div className="flex flex-col gap-2">
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
          </ScrollArea>
        </ScoreCard>
      </section>
    </div>
  )
}

// 主題細節頁 — 6 個 sidebar nav 項目(Acquire/Retain/Engage/Perform/Plan/Compensate)共用同一 template:
// hero score + 關鍵指標(DescriptionList)+ 該主題季度趨勢 + 重點說明。
function ThemeDetailPage({ theme }: { theme: ThemeDetail }) {
  const Icon = theme.icon
  const config = {
    value: { label: theme.label, color: 'var(--chart-1)' },
  } satisfies ChartConfig
  return (
    <div className="px-[var(--layout-space-tight)] py-[var(--layout-space-tight)] space-y-[var(--layout-space-tight)]">
      <section className="flex gap-[var(--layout-space-loose)]">
        <ScoreCard className="flex-none w-[220px] flex flex-col items-center justify-center text-center gap-1">
          <Icon size={22} className="text-fg-secondary" />
          <div className="text-h1 font-bold text-primary tabular-nums mt-1">{theme.score}</div>
          <div className="text-body font-medium text-fg-secondary">{theme.label}</div>
          <DeltaLabel delta={theme.delta} />
        </ScoreCard>
        <ScoreCard className="flex-1 min-w-0">
          <div className="text-body font-bold">Key Metrics</div>
          <DescriptionList cols={2} className="mt-[var(--layout-space-tight)]">
            {theme.metrics.map((m) => (
              <DescriptionItem key={m.label} label={m.label}>{m.value}</DescriptionItem>
            ))}
          </DescriptionList>
        </ScoreCard>
      </section>

      <section className="flex gap-[var(--layout-space-loose)] h-[220px]">
        <ScoreCard className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <div className="text-body font-bold">Quarterly Trend</div>
          <ChartContainer config={config} className="flex-1 min-h-0 mt-[var(--layout-space-tight)]">
            <BarChart accessibilityLayer data={theme.trend}>
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
            <p className="text-caption text-foreground leading-relaxed m-0">{theme.note}</p>
          </div>
        </ScoreCard>
      </section>
    </div>
  )
}

export default function App() {
  const [activeId, setActiveId] = useState<string>('overview')
  const [period, setPeriod] = useState('q2-2025')

  const activeNav = NAV.find((n) => n.id === activeId) ?? NAV[0]
  const activeTheme = activeId in THEME_DETAILS ? THEME_DETAILS[activeId as ThemeId] : undefined

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <SidebarProvider activeId={activeId} onActiveChange={setActiveId}>
        <AppShell
          layout="primary-sidebar"
          sidebar={<AppSidebar />}
          header={<PageHeader title={activeTheme ? `${activeTheme.label} Detail` : 'Executive Overview'} period={period} onPeriodChange={setPeriod} />}
        >
          {activeTheme ? <ThemeDetailPage theme={activeTheme} /> : <OverviewPage onNavigate={setActiveId} />}
        </AppShell>
      </SidebarProvider>
    </TooltipProvider>
  )
}
