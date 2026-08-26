// 完整 AppShell 範例 — 對齊 DS canonical `sidebar.stories.tsx#IconCollapse` baseline
// (per `.claude/rules/story-rules.md`「Production-grade composition fidelity」+ M23(d) nearest-same-purpose canonical wins)
//
// @story-baseline: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#IconCollapse
// (2026-06-02 conformance-model:@story-baseline = consume canonical 結構的意圖,由靜態 conformance hook 驗
//  〔check_consumer_ds_primitive_misuse〔含 Pattern 8〕/ check_layout_space_magic_numbers / check_story_invariants
//  R7+R8〕。舊的 shell-only 視覺 identity-diff 標記已移除(此範本品牌 Acme Product / nav / 內容 by-design
//  異於 DS demo Acme Inc / MAIN_NAV,連 shell 文字都不同,pixel/DOM identity 即使遮罩內容也必 false-positive,
//  per composition-fidelity.md「禁拿產品範本 pixel 比 showcase」)。注意:此註解刻意不寫可被 diff script regex
//  解析的標記字面,以免「解釋移除」反而把標記種回去。)
//
// SSOT 鐵律:
//   - Consumer 只 import `@qijenchen/design-system` public exports
//   - 禁修改 DS source(走 fork DS repo)
//   - 視覺 token 透過 DS 提供的 `@qijenchen/design-system/styles/tokens` 載入
//
// Fork user 替換步驟:
//   1. 替換 NAV array(新 product 的真實導覽項)
//   2. 替換 WorkspaceBrand 內 workspace 名 / Avatar 顏色
//   3. 替換 DashboardPage 為真實業務 widgets(DataTable / Chart / Card 等 DS 元件)
//   4. 替換 PageHeader rightSlot 的 primary action(若有)

import { useEffect, useState, type ReactElement } from 'react'
import {
  AppShell,
  SidebarProvider,
  Sidebar,
  SidebarContent,
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
} from '@qijenchen/design-system'
import { LayoutDashboard } from 'lucide-react'
import { CATEGORIES } from './data/hr-metrics'
import { QuarterProvider, useQuarter } from './context/quarter-context'
import { OverviewPage } from './pages/OverviewPage'
import { CategoryDetailPage } from './pages/CategoryDetailPage'
import { HeaderControls } from './components/HeaderControls'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, icon: c.icon })),
] as const

// ── Sidebar(對齊 DS IconCollapse baseline:collapsible="icon" + WorkspaceBrand + footer)──
function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Chrome header avatar canonical(per header-canonical.spec.md:57-72):chrome header 不是 row context → raw <Avatar size={24}>,禁用 <ItemAvatar>(會誤啟動 row anatomy lookup)*/}
        {/* @story-baseline: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#IconCollapse */}
        {/* @layout-space-magic-ok: Sidebar#IconCollapse chrome-header-brand baseline owns fixed 8px Avatar-to-label micro spacing; layout-space tokens govern macro spacing */}
        <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
          <Avatar alt="HR Plus" size={24} shape="square" color="blue" solid />
          <span className="text-body-lg font-medium truncate group-data-[collapsible=icon]:hidden">
            HR Plus
          </span>
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
      {/* 帳號入口(Account entry)per user 2026-08-26 directive「登入資訊放頁面 header 右側」,
          從 SidebarFooter 移至 PageHeader rightSlot 的 <HeaderControls>(AccountMenu)——
          「帳號入口只能出現一次」per app-shell.spec.md 放置 SSOT,此為刻意的單一移置,非新增。 */}
    </Sidebar>
  )
}

// ── PageHeader(消費 DS ChromeHeader primitive,2026-06-12 修:原手刻 <header className=...>
// 繞過 header-canonical 全部機械簽名 + 違反「消費 primitive 不 hand-craft」canonical;
// 對齊 _demo-helpers.tsx PageHeader 同款消費形)──
// SidebarTrigger 必有(primary-sidebar mode 的 menu toggle 入口,⌘B keyboard shortcut)
// rightSlot 型別用 ReactElement<any, any>(= 舊全域 JSX.Element 的去全域等價寫法):
//   - 不用裸 JSX.Element:React 19 @types/react 移除「全域」JSX namespace → `JSX.Element` 在 fresh React19 install
//     下 TS2503「Cannot find namespace 'JSX'」(本機 @types/react 19.2.15 仍含全域 shim → 源端 tsc 假陰性,
//     只在 receiver 拿到無 shim 的 19.x fresh install 才炸;2026-06-12 bde81e7e 引入,brick 下游 receiver build + audit)
//   - 不用裸 ReactElement:@types/react@19 預設參數由 any 改 unknown,`ReactElement<unknown>` 因 ReactPortal.children
//     分支不可指派給 ReactNode(TS2322)→ 必顯式 <any, any>(JSX.Element 本就是 ReactElement<any, any>,語意不變)
//   - 不用 ReactNode:workspace app 自帶 @types/react 副本與 DS .d.ts 的 ReactNode 版本 bigint 差異不相容
function PageHeader({ title, rightSlot }: { title: string; rightSlot?: ReactElement<any, any> }) {
  return (
    <ChromeHeader className="bg-surface">
      <SidebarTrigger />
      <h1 className="text-body-lg font-medium flex-1 truncate">{title}</h1>
      {rightSlot}
    </ChromeHeader>
  )
}

// @story-baseline: @qijenchen/design-system/components/AppShell/app-shell.stories.tsx#PrimarySidebar
// (Overview 走 OverviewPage;六大類別走同款 CategoryDetailPage shell,id 對齊 CATEGORIES SSOT。)
type NavId = (typeof NAV)[number]['id']

function renderPage(activeId: NavId) {
  if (activeId === 'overview') return <OverviewPage />
  return <CategoryDetailPage categoryId={activeId} />
}

// @story-baseline: @qijenchen/design-system/components/AppShell/app-shell.stories.tsx#PrimarySidebar
type Theme = 'light' | 'dark'

function AppContent() {
  const [activeId, setActiveId] = useState<NavId>('overview')
  const [theme, setTheme] = useState<Theme>('light')
  const { quarter, setQuarter } = useQuarter()
  const current = NAV.find((n) => n.id === activeId) ?? NAV[0]

  // Light/dark mode(2026-08-26 user directive)——DS token 切換點是 [data-theme] attribute
  // (見 tokens/color/semantic.css「所有語義 token 用 :root, [data-theme] 定義」),預設 light。
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <SidebarProvider activeId={activeId} onActiveChange={(id) => setActiveId(id as NavId)}>
      <AppShell
        layout="primary-sidebar"
        sidebar={<AppSidebar />}
        header={
          <PageHeader
            title={current.label}
            rightSlot={
              <HeaderControls
                quarter={quarter}
                onQuarterChange={setQuarter}
                theme={theme}
                onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              />
            }
          />
        }
      >
        {renderPage(activeId)}
      </AppShell>
    </SidebarProvider>
  )
}

export default function App() {
  // TooltipProvider self-wrap(Storybook story render 跳過 main.tsx → App 必自帶 TooltipProvider context)
  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <QuarterProvider>
        <AppContent />
      </QuarterProvider>
    </TooltipProvider>
  )
}
