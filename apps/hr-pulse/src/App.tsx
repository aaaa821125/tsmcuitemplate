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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
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

type AttentionSeverity = 'error' | 'warning' | 'success'

const ATTENTION_ITEMS: { id: string; severity: AttentionSeverity; text: string }[] = [
  { id: 'perf-reviews', severity: 'error', text: 'Performance reviews at 58% — 42% behind target. Due June 30. Owner: Performance/L&D Division.' },
  { id: 'er-data', severity: 'error', text: 'Employee Relations data overdue — 0% submitted. Due Jul 5.' },
  { id: 'turnover', severity: 'warning', text: 'Voluntary turnover up 3% QoQ — Top affected: Engineering (8.2%).' },
  { id: 'offer-rate', severity: 'success', text: 'Offer acceptance rate improved to 87% — above target.' },
]

// List item anatomy(Family 2,無單一 canonical component,依 element-anatomy.spec.md 自行組 row):
// [status dot] [content] — reading-mode 掃視列表,非 Menu item / DataTable 情境。
const SEVERITY_DOT_CLASS: Record<AttentionSeverity, string> = {
  error: 'bg-error',
  warning: 'bg-warning',
  success: 'bg-success',
}
const SEVERITY_BG_CLASS: Record<AttentionSeverity, string> = {
  error: 'bg-error-subtle',
  warning: 'bg-warning-subtle',
  success: 'bg-success-subtle',
}

const ACTIVITY_ROWS = [
  { id: 'comp', theme: 'Compensation & Benefits', desc: 'Compa-ratio and pay equity ratio refreshed', date: 'Jun 30, 2025', uploader: 'M. Lai', empId: '103482' },
  { id: 'wfp', theme: 'Workforce Planning', desc: 'Headcount, absenteeism and revenue/employee refreshed', date: 'Jun 30, 2025', uploader: 'R. Wu', empId: '108217' },
  { id: 'perf', theme: 'Performance/L&D', desc: 'Review completion data refreshed', date: 'Jun 30, 2025', uploader: 'T. Hsu', empId: '105690' },
  { id: 'ta', theme: 'Talent Acquisition', desc: 'Time to fill, cost per hire and offer acceptance refreshed', date: 'Jun 28, 2025', uploader: 'J. Kao', empId: '101933' },
  { id: 'retain', theme: 'Retention & Turnover', desc: 'Turnover and exit data refreshed', date: 'Jun 28, 2025', uploader: 'S. Fang', empId: '107456' },
]

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
        <ScoreCard>
          <div className="text-body font-bold flex items-center gap-2">⚠️ Attention Required</div>
          <div className="flex flex-col gap-2 mt-[var(--layout-space-tight)]">
            {ATTENTION_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-2 rounded-md border border-divider p-2.5 ${SEVERITY_BG_CLASS[item.severity]}`}
              >
                <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${SEVERITY_DOT_CLASS[item.severity]}`} />
                <p className="text-caption text-foreground leading-relaxed m-0">{item.text}</p>
              </div>
            ))}
          </div>
        </ScoreCard>

        <ScoreCard>
          <div className="text-body font-bold flex items-center gap-2">🕒 Recent Data Updates</div>
          <p className="text-caption text-fg-muted mt-0.5">
            The 5 most recent refreshes across source teams — when each was updated and by whom.
          </p>
          <div className="mt-[var(--layout-space-tight)]">
            {ACTIVITY_ROWS.map((row, index) => (
              <div
                key={row.id}
                className={`flex items-start justify-between gap-3 py-2.5 flex-wrap ${index > 0 ? 'border-t border-divider' : ''}`}
              >
                <div className="min-w-0 flex-1 basis-64">
                  <div className="text-caption font-bold text-foreground">{row.theme}</div>
                  <div className="text-caption text-fg-secondary mt-0.5">{row.desc}</div>
                </div>
                <div className="flex flex-none flex-col items-end gap-1 text-right ml-auto">
                  <span className="text-caption text-fg-muted tabular-nums whitespace-nowrap">{row.date}</span>
                  <span className="text-caption font-medium text-fg-secondary whitespace-nowrap">
                    {row.uploader} <span className="text-fg-muted font-normal">({row.empId})</span>
                  </span>
                </div>
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
          <div className="text-body font-bold flex items-center gap-2">📈 Quarterly Trend</div>
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
          <div className="text-body font-bold flex items-center gap-2">💡 HRPO Insights</div>
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
