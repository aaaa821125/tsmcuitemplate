import { Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@qijenchen/design-system'

interface ScoreDonutChartProps {
  /** 0-100 綜合分數 */
  score: number
  label: string
}

const config = {
  achieved: { label: 'Score', color: 'var(--chart-1)' },
  remaining: { label: 'Remaining', color: 'var(--secondary)' },
} satisfies ChartConfig

/**
 * 單一分數的環圈進度呈現(HR Health 綜合分數)。對齊 chart.spec.md「Donut 中心空白可放合計數字」。
 * 與 CategoryDonutChart 的差異:這裡是 2 段 achieved/remaining 的進度語意,非多類別組成比例。
 */
export function ScoreDonutChart({ score, label }: ScoreDonutChartProps) {
  const data = [
    { name: 'achieved', value: score, fill: 'var(--color-achieved)' },
    { name: 'remaining', value: 100 - score, fill: 'var(--color-remaining)' },
  ]
  return (
    <div className="relative w-full" style={{ maxWidth: 180 }}>
      <ChartContainer config={config} className="aspect-square w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={78} strokeWidth={2} />
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-h2 font-medium text-foreground">{score}</span>
        <span className="text-caption text-fg-muted">{label}</span>
      </div>
    </div>
  )
}
