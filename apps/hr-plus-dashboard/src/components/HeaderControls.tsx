// @story-baseline: @qijenchen/design-system/components/Popover/popover.stories.tsx#FilterPanel
// (Popover trigger asChild + PopoverHeader/PopoverTitle/PopoverBody/PopoverFooter 組合,
//  FAQ / Feedback 兩個淺量浮層都沿用此結構。)
import { useState } from 'react'
import { CircleHelp, MessageSquare, Moon, Sun } from 'lucide-react'
import {
  AccountMenu,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverBody,
  PopoverFooter,
  Select,
  Textarea,
  toast,
} from '@qijenchen/design-system'
import { QUARTER_OPTIONS, type Quarter } from '../data/hr-metrics'

const FAQ_ITEMS = [
  { q: 'HR Health Score 怎麼算?', a: '六大類別關鍵指標依權重加總,滿分 100。' },
  { q: '資料多久更新一次?', a: '各類別由對應窗口每週手動上傳,時間見 Overview 頁「Last Updated」。' },
  { q: '季度選擇器改的是什麼?', a: '切換右上角季度會重新計算該季度的數值與季度環比。' },
]

function FaqControl() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="text" iconOnly startIcon={CircleHelp} aria-label="FAQ" />
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>常見問題</PopoverTitle>
        </PopoverHeader>
        <PopoverBody className="flex flex-col gap-[var(--layout-space-tight)]">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q}>
              <p className="text-body font-medium text-foreground">{item.q}</p>
              <p className="text-caption text-fg-secondary mt-[var(--layout-space-tight)]">{item.a}</p>
            </div>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

function FeedbackControl() {
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    toast({ variant: 'success', title: '感謝回饋', description: '你的意見已送出給 HR Plus 團隊。' })
    setMessage('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="text" iconOnly startIcon={MessageSquare} aria-label="Feedback" />
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>意見回饋</PopoverTitle>
        </PopoverHeader>
        <PopoverBody>
          <Textarea
            placeholder="告訴我們這個 Dashboard 哪裡可以做得更好…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </PopoverBody>
        <PopoverFooter>
          <Button variant="tertiary" size="sm" className="flex-1" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button variant="primary" size="sm" className="flex-1" disabled={!message.trim()} onClick={handleSubmit}>
            送出
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  )
}

interface HeaderControlsProps {
  quarter: Quarter
  onQuarterChange: (quarter: Quarter) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

/** 頁面 header 右側控制列:季度選擇器 + 淺色/深色模式切換 + FAQ + Feedback + 登入資訊。 */
export function HeaderControls({ quarter, onQuarterChange, theme, onToggleTheme }: HeaderControlsProps) {
  return (
    <div className="flex items-center gap-[var(--layout-space-tight)]">
      <Select
        size="sm"
        width="hug"
        options={QUARTER_OPTIONS}
        value={quarter}
        onChange={(value) => onQuarterChange(value as Quarter)}
        aria-label="檢視季度"
      />
      <Button
        variant="text"
        iconOnly
        pressed={theme === 'dark'}
        startIcon={theme === 'dark' ? Moon : Sun}
        aria-label={theme === 'dark' ? '切換為淺色模式' : '切換為深色模式'}
        onClick={onToggleTheme}
      />
      <FaqControl />
      <FeedbackControl />
      <AccountMenu user={{ name: '當前使用者', avatar: { color: 'blue' } }} align="end" />
    </div>
  )
}
