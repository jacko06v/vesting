import React from "react"
import {
  Activity,
  ArrowUpRight,
  ChartBar,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AnalyticsProps {
  vestingData: {
    totalValue: number
    releasedValue: number
    vestedPercentage: number
    startDate: Date
    endDate: Date
    priceHistory: any[]
    tokenPrice: number
    vestingSchedule: any[]
  }
}

const VestingAnalytics = ({ vestingData }: AnalyticsProps) => {
  // Calcola il ROI basato sul prezzo di ingresso (simulato)
  const entryPrice = 0.01
  const currentPrice = vestingData.tokenPrice
  const roi = ((currentPrice - entryPrice) / entryPrice) * 100

  // Calcola la media mobile del prezzo
  const calculateMA = (data: any[], period: number) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, MA: null }
      const slice = data.slice(index - period + 1, index + 1)
      const average =
        slice.reduce((sum, item) => sum + parseFloat(item.price), 0) / period
      return { ...item, MA: average }
    })
  }

  const priceDataWithMA = calculateMA(vestingData.priceHistory, 7)

  return (
    <div className="grid gap-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roi > 0 ? "+" : ""}
              {roi.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-400">Since vesting start</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">APR</CardTitle>
            <ChartBar className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (roi /
                  ((new Date().getTime() - vestingData.startDate.getTime()) /
                    (365 * 24 * 60 * 60 * 1000))) *
                100
              ).toFixed(2)}
              %
            </div>
            <p className="text-xs text-gray-400">Annualized return</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Time Remaining
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil(
                (vestingData.endDate.getTime() - new Date().getTime()) /
                  (24 * 60 * 60 * 1000)
              )}{" "}
              days
            </div>
            <p className="text-xs text-gray-400">Until full vesting</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">USD Value</CardTitle>
            <DollarSign className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${vestingData.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">Total vesting value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Price Analysis */}
        <Card className="border-gray-800/50 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Price Analysis</CardTitle>
            <CardDescription>
              Token price with 7-day moving average
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceDataWithMA}>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17, 24, 39, 0.9)",
                      border: "1px solid rgba(75, 85, 99, 0.3)",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#4ade80"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="MA"
                    stroke="#ec4899"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vesting Distribution */}
        <Card className="border-gray-800/50 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Vesting Distribution</CardTitle>
            <CardDescription>
              Monthly token distribution analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vestingData.vestingSchedule}>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17, 24, 39, 0.9)",
                      border: "1px solid rgba(75, 85, 99, 0.3)",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="tokens" fill="#8884d8" opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vesting Metrics */}
        <Card className="border-gray-800/50 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Vesting Metrics</CardTitle>
            <CardDescription>
              Detailed vesting performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Released Amount</span>
                  <span className="text-sm font-medium text-white">
                    ${vestingData.releasedValue.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={vestingData.vestedPercentage}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>{vestingData.vestedPercentage}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Average Monthly Release
                  </p>
                  <p className="text-lg font-medium text-white">
                    ${(vestingData.totalValue / 36).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Next Release Value</p>
                  <p className="text-lg font-medium text-white">
                    $
                    {(
                      (vestingData.totalValue / 36) *
                      (1 + roi / 100)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Analysis */}
        <Card className="border-gray-800/50 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
            <CardDescription>Token market performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Price Change (24h)</p>
                  <p className="text-lg font-medium text-white">
                    {(
                      ((currentPrice -
                        vestingData.priceHistory[
                          vestingData.priceHistory.length - 1
                        ]?.price) /
                        vestingData.priceHistory[
                          vestingData.priceHistory.length - 16
                        ]?.price) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Volume (24h)</p>
                  <p className="text-lg font-medium text-white">$1.2M</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Market Cap</p>
                  <p className="text-lg font-medium text-white">$24.5M</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Circulating Supply</p>
                  <p className="text-lg font-medium text-white">45.2M</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VestingAnalytics
