import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Quarter } from '../data/hr-metrics'

interface QuarterContextValue {
  quarter: Quarter
  setQuarter: (quarter: Quarter) => void
}

const QuarterContext = createContext<QuarterContextValue | null>(null)

/** 全域「檢視季度」狀態(2026 Q1~Q4)——header 選擇器與各頁 KPI 卡片共用同一個來源。 */
export function QuarterProvider({ children }: { children: ReactNode }) {
  const [quarter, setQuarter] = useState<Quarter>('Q4')
  const value = useMemo(() => ({ quarter, setQuarter }), [quarter])
  return <QuarterContext.Provider value={value}>{children}</QuarterContext.Provider>
}

export function useQuarter(): QuarterContextValue {
  const ctx = useContext(QuarterContext)
  if (!ctx) throw new Error('useQuarter 必須在 <QuarterProvider> 內使用')
  return ctx
}
