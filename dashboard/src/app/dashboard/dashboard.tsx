import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { portfolioData } from '../../../dev_data/portfolioData'
import TransactionHistoryCard from '@/app/dashboard/transaction-history-card'

interface Portfolio {
  date: string
  value: number
}

const Dashboard = () => {
  const chartData: Portfolio[] = portfolioData

  const minValue = Math.min(...chartData.map((item) => item.value))
  const maxValue = Math.max(...chartData.map((item) => item.value))
  const padding = 5

  const portfolioValue = chartData[chartData.length - 1].value

  const minDomain = minValue - padding
  const maxDomain = maxValue + padding
  const chartConfig = {
    value: {
      label: 'Value',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="flex flex-col justify-between mt-4 mb-2">
        <h2 className={'text-xl font-semibold'}>£{portfolioValue}</h2>
        <p>Portfolio Value</p>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className={'mt-4 col-span-2'}>
          {' '}
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <YAxis
                  dataKey="value"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[minDomain, maxDomain]}
                />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="value"
                  type="natural"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this week <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
        <TransactionHistoryCard />
      </div>
    </div>
  )
}

export { Dashboard }
