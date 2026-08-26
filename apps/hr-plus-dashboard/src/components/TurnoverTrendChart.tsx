import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@qijenchen/design-system'
import type { Quarter } from '../data/hr-metrics'

const config = {
  rate: { label: 'Turnover Rate', color: 'var(--chart-1)' },
} satisfies ChartConfig

interface TurnoverTrendChartProps {
  quarters: { quarter: Quarter; rate: number }[]
}

/** Retention & Turnover — 2026 Q1~Q4 overall turnover rate 折線趨勢。 */
export function TurnoverTrendChart({ quarters }: TurnoverTrendChartProps) {
  return (
    <ChartContainer config={config} className="max-h-32 w-full">
      <LineChart accessibilityLayer data={quarters}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={(value: number) => `${value}%`}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line
          dataKey="rate"
          type="monotone"
          stroke="var(--color-rate)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
