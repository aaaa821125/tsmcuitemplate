// HR Pulse — Executive Overview dashboard
//
// @story-baseline: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#IconCollapse
// @story-baseline: @qijenchen/design-system/components/Select/select.stories.tsx#Modes
// (AppShell + Sidebar + ChromeHeader shell 對齊 apps/template/src/App.tsx 同一 canonical baseline;
// Select width 用 width="hug",非 field-controls.spec.md「寬度軸」硬寬 class)
//
// SSOT 鐵律:
//   - Consumer 只 import `@qijenchen/design-system` public exports
//   - 禁修改 DS source(走 fork DS repo)
//   - 視覺 token 透過 DS 提供的 CSS variable / utility class 消費
//
// 內容參考:HR Pulse Overview 設計稿(sidebar nav + HR Health hero score + 6 主題分數卡 +
// Attention Required + Recent Data Updates + Quarterly Trend + HRPO Insights)。
// v1 先搭建結構,之後逐步調整內容與細節。

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
  // @story-baseline: @qijenchen/design-system/components/Alert/alert.stories.tsx
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  buildPersonProfileCard,
  ScrollArea,
  // @story-baseline: @qijenchen/design-system/components/ScrollArea/scroll-area.stories.tsx
  // @story-baseline: @qijenchen/design-system/components/PeoplePicker/people-picker.stories.tsx
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

type ThemeScore = { id: string; label: string; icon: typeof Target; score: number; delta: Delta }

const THEME_SCORES: ThemeScore[] = [
  { id: 'acquire', label: 'Acquire', icon: Target, score: 82, delta: { direction: 'up', text: '+5' } },
  { id: 'retain', label: 'Retain', icon: RefreshCw, score: 71, delta: { direction: 'down', text: '-3' } },
  { id: 'engage', label: 'Engage', icon: MessageSquare, score: 85, delta: { direction: 'up', text: '+2' } },
  { id: 'perform', label: 'Perform', icon: Star, score: 58, delta: { direction: 'down', text: '-12' } },
  { id: 'plan', label: 'Plan', icon: Building2, score: 80, delta: { direction: 'up', text: '+1' } },
  { id: 'compensate', label: 'Compensate', icon: DollarSign, score: 76, delta: { direction: 'flat', text: '0' } },
]

type AttentionVariant = 'error' | 'warning' | 'success'

// 消費 DS `Alert`(alert.spec.md:「頁面內需要持續存在的狀態通知」+ variant 對應 icon/色彩 canonical),
// 取代手刻色塊 row —— title/description 對齊 Alert 既有 anatomy,不再自訂 status dot。
const ATTENTION_ITEMS: { id: string; variant: AttentionVariant; title: string; description: string }[] = [
  { id: 'perf-reviews', variant: 'error', title: 'Performance reviews at 58% — 42% behind target', description: 'Due June 30. Owner: Performance/L&D Division.' },
  { id: 'er-data', variant: 'error', title: 'Employee Relations data overdue', description: '0% submitted. Due Jul 5.' },
  { id: 'turnover', variant: 'warning', title: 'Voluntary turnover up 3% QoQ', description: 'Top affected: Engineering (8.2%).' },
  { id: 'headcount', variant: 'warning', title: 'Headcount 4% over plan in Engineering', description: 'Review hiring pace against budget.' },
  { id: 'offer-rate', variant: 'success', title: 'Offer acceptance rate improved to 87%', description: 'Above target.' },
]

const ACTIVITY_ROWS = [
  { id: 'comp', theme: 'Compensation & Benefits', date: 'Jun 30, 2025', uploader: 'M. Lai', employeeNumber: '103482', avatarUrl: 'https://i.pravatar.cc/64?img=47' },
  { id: 'wfp', theme: 'Workforce Planning', date: 'Jun 30, 2025', uploader: 'R. Wu', employeeNumber: '108217', avatarUrl: 'https://i.pravatar.cc/64?img=12' },
  { id: 'perf', theme: 'Performance/L&D', date: 'Jun 30, 2025', uploader: 'T. Hsu', employeeNumber: '105690', avatarUrl: 'https://i.pravatar.cc/64?img=33' },
  { id: 'ta', theme: 'Talent Acquisition', date: 'Jun 28, 2025', uploader: 'J. Kao', employeeNumber: '101933', avatarUrl: 'https://i.pravatar.cc/64?img=68' },
  { id: 'retain', theme: 'Retention & Turnover', date: 'Jun 28, 2025', uploader: 'S. Fang', employeeNumber: '107456', avatarUrl: 'https://i.pravatar.cc/64?img=5' },
]

// Activity row — 3 欄(item / latest update time / uploader),各欄各自留白、不互相擠壓:
// 消費 DS Avatar primitive(帶 src 頭像照片)+ buildPersonProfileCard(avatar.spec.md「person avatar
// hover → ProfileCard」),名字/工號直接顯示(非只靠 hover)。
// @story-baseline: @qijenchen/design-system/components/PeoplePicker/people-picker.stories.tsx
function ActivityRow({ theme, date, uploader, employeeNumber, avatarUrl }: { theme: string; date: string; uploader: string; employeeNumber: string; avatarUrl: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-[var(--layout-space-loose)]">
      <span className="text-caption font-bold text-foreground min-w-0 truncate">{theme}</span>
      <span className="text-caption text-fg-muted tabular-nums whitespace-nowrap">{date}</span>
      <div className="flex items-center gap-2">
        <Avatar src={avatarUrl} alt={uploader} size={24} hoverCard={buildPersonProfileCard({ name: uploader, avatarUrl, employeeNumber })} />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-caption font-bold text-foreground whitespace-nowrap">{uploader}</span>
          <span className="text-caption text-fg-muted whitespace-nowrap">{employeeNumber}</span>
        </div>
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

function PageHeader({ period, onPeriodChange }: { period: string; onPeriodChange: (value: string) => void }) {
  return (
    <ChromeHeader className="bg-surface">
      <SidebarTrigger />
      <h1 className="text-body-lg font-medium flex-1 truncate">Executive Overview</h1>
      <Tag color="blue">CHRO view</Tag>
      {/* @story-baseline: @qijenchen/design-system/components/Select/select.stories.tsx#Modes */}
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

function ScoreCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-divider bg-surface p-[var(--layout-space-loose)] ${className}`}>
      {children}
    </div>
  )
}

function OverviewPage() {
  return (
    <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-tight)] space-y-[var(--layout-space-loose)]">
      {/* Row 1: HR Health hero + 6 theme scores */}
      <section className="grid grid-cols-4 gap-[var(--layout-space-loose)]">
        <ScoreCard className="row-span-2 flex flex-col items-center justify-center text-center gap-1">
          <div className="text-h1 font-bold text-primary tabular-nums">78</div>
          <div className="text-body font-medium text-fg-secondary">HR Health</div>
          <DeltaLabel delta={{ direction: 'up', text: '+3 vs Q1 2025' }} />
        </ScoreCard>
        {THEME_SCORES.map(({ id, label, icon: Icon, score, delta }) => (
          <ScoreCard key={id} className="flex flex-col items-center text-center gap-1">
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
          {/* @story-baseline: @qijenchen/design-system/components/ScrollArea/scroll-area.stories.tsx */}
          {/* 填滿卡片剩餘高度(對齊右側 Recent Data Updates 卡片,由 grid items-stretch 決定),超出捲動 */}
          {/* @story-baseline: @qijenchen/design-system/components/Alert/alert.stories.tsx */}
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
          <p className="text-caption text-fg-muted mt-[var(--layout-space-tight)] pt-2.5 border-t border-divider leading-relaxed">
            Sample data shown for design purposes. Submitter names/IDs are placeholders.
          </p>
        </ScoreCard>
      </section>

      {/* Row 3: Quarterly Trend + HRPO Insights */}
      <section className="grid grid-cols-2 gap-[var(--layout-space-loose)] items-start">
        <ScoreCard>
          <div className="text-body font-bold">Quarterly Trend</div>
          <ChartContainer config={trendConfig} className="mt-[var(--layout-space-tight)]">
            <BarChart accessibilityLayer data={trendData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="score" fill="var(--color-score)" radius={4} />
            </BarChart>
          </ChartContainer>
          <p className="text-center text-caption text-fg-muted mt-2">Overall HR Health Score Trend</p>
        </ScoreCard>

        <ScoreCard>
          <div className="text-body font-bold">HRPO Insights</div>
          <div className="flex flex-col gap-2.5 mt-[var(--layout-space-tight)]">
            {INSIGHTS.map((insight) => (
              <div key={insight.id} className="flex gap-2 rounded-r-md border-l-[3px] border-primary bg-primary-subtle p-2.5">
                <Pin size={13} className="mt-0.5 flex-none text-primary" />
                <p className="text-caption text-foreground leading-relaxed m-0">
                  {insight.text}
                  <span className="block mt-1 text-caption text-fg-muted font-medium">— {insight.source}</span>
                </p>
              </div>
            ))}
          </div>
        </ScoreCard>
      </section>
    </div>
  )
}

export default function App() {
  const [activeId, setActiveId] = useState<string>('overview')
  const [period, setPeriod] = useState('q2-2025')

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <SidebarProvider activeId={activeId} onActiveChange={setActiveId}>
        <AppShell
          layout="primary-sidebar"
          sidebar={<AppSidebar />}
          header={<PageHeader period={period} onPeriodChange={setPeriod} />}
        >
          <OverviewPage />
        </AppShell>
      </SidebarProvider>
    </TooltipProvider>
  )
}
