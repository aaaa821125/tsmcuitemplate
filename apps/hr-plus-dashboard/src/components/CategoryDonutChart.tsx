import { Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@qijenchen/design-system'

export interface DonutSegment {
  name: string
  value: number
  fill: string
}

interface CategoryDonutChartProps {
  segments: DonutSegment[]
}

/**
 * 類別組成環圈圖(People Manager Effectiveness / Local Manager Representation)。
 * 對齊 chart.spec.md DonutChartTrafficSource baseline:innerRadius + legend + tooltip。
 */
export function CategoryDonutChart({ segments }: CategoryDonutChartProps) {
  const config = Object.fromEntries(
    segments.map((s) => [s.name, { label: s.name, color: s.fill }]),
  ) satisfies ChartConfig

  return (
    <ChartContainer config={config} className="max-h-40 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
        <Pie data={segments} dataKey="value" nameKey="name" innerRadius={40} strokeWidth={2} />
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  )
}
