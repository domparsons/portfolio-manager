import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis } from 'recharts'
import * as React from 'react'
interface Portfolio {
  id: number
  close: number
  timestamp: string
}

const AssetChart = ({ data }: { data: Portfolio[] | null }) => {
  const chartData: Portfolio[] = (data ?? []).map((item) => ({
    ...item,
    close: Math.round(item.close * 100) / 100,
    timestamp: new Date(item.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }))
  const minValue = Math.min(...chartData.map((item) => item.close))
  const maxValue = Math.max(...chartData.map((item) => item.close))

  const paddingPercentage = 0.03
  const padding = (maxValue - minValue) * paddingPercentage
  const minDomain = minValue - padding
  const maxDomain = maxValue + padding

  const chartConfig = {
    value: {
      label: 'close',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 10, right: 60, bottom: 10, left: 0 }}
        >
          <ChartTooltip content={<ChartTooltipContent />} />
          <YAxis
            dataKey="close"
            tick={false}
            axisLine={false}
            tickLine={false}
            tickMargin={0}
            domain={[minDomain, maxDomain]}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <XAxis
            dataKey="timestamp"
            // tick={false}
            axisLine={false}
            tickLine={false}
          />
          <Line
            dataKey="close"
            type="natural"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

export default AssetChart
