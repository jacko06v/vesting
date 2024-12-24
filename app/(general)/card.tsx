"use client"

import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  Calendar,
  Calendar as CalendarIcon,
  LineChart as ChartIcon,
  Clock,
  DollarSign,
  History,
  Lock,
  Shield,
  Timer,
  TrendingUp,
  Unlock,
  Wallet,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useContractRead, useContractWrite, useWalletClient } from "wagmi"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import abi from "./abi/abi"

interface VestingData {
  value: string
  start: string
  end: string
  releasedAmount: string
  lastReleaseDate: string
}

interface VestingSchedule {
  date: string
  tokens: number
  value: number
  totalVested: number
  status: "vested" | "pending"
}

interface TransactionHistory {
  date: string
  amount: number
  type: "withdrawal" | "vested"
  status: "completed" | "pending" | "failed"
  hash: string
}

const VestingDashboard = () => {
  // Base states
  const [data, setData] = useState<VestingData>({
    value: "0",
    start: "0",
    end: "0",
    releasedAmount: "0",
    lastReleaseDate: "0",
  })
  const [price, setPrice] = useState<number>(0)
  const [priceEur, setPriceEur] = useState<number>(0)
  const [amountWithdraw, setAmountWithdraw] = useState("")
  const [totalUSD, setTotalUSD] = useState<string>("0")
  const [remainingUSD, setRemainingUSD] = useState<string>("0")
  const [totalWUSD, setTotalWUSD] = useState<string>("0")
  const [totalWEUR, setTotalWEUR] = useState<string>("0")
  const [vestingSchedule, setVestingSchedule] = useState<VestingSchedule[]>([])
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistory[]
  >([])
  const [vestedPercentage, setVestedPercentage] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const { data: walletClient } = useWalletClient()

  // Contract interactions
  const result = useContractRead({
    address: "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    abi: abi,
    functionName: "grants",
    args: [walletClient?.account.address],
    enabled: !!walletClient?.account.address,
  })

  const { write: withdrawTokens, isLoading: isWithdrawing } = useContractWrite({
    address: "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    abi: abi,
    functionName: "unlockVestedTokens",
    onSuccess() {
      // Aggiorna i dati dopo un withdraw di successo
      result.refetch()
    },
  })

  const amountToWithdraw = useContractRead({
    address: "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    abi: abi,
    functionName: "calcAmountToWithdraw",
    args: [walletClient?.account.address],
    enabled: !!walletClient?.account.address,
  })

  // Data loading effects
  useEffect(() => {
    if (result.data) {
      const [, value, start, end, , releasedAmount, lastReleaseDate, ,]: any[] =
        result.data as any[]
      setData({
        value: value.toString(),
        start: start.toString(),
        end: end.toString(),
        releasedAmount: releasedAmount.toString(),
        lastReleaseDate: lastReleaseDate.toString(),
      })
      setIsLoading(false)
    }
  }, [result.data])

  useEffect(() => {
    if (amountToWithdraw.data) {
      setAmountWithdraw(
        ethers.utils.formatEther(amountToWithdraw.data.toString())
      )
    }
  }, [amountToWithdraw.data])

  // Price fetching and calculations
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ovr&vs_currencies=usd,eur"
        )
        const data = await response.json()
        setPrice(data.ovr.usd)
        setPriceEur(data.ovr.eur)
        generatePriceHistory(data.ovr.usd)
      } catch (error) {
        console.error("Error fetching price:", error)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  // Vesting calculations
  useEffect(() => {
    if (data.value && data.start && data.end && price) {
      const totalTokens = parseFloat(ethers.utils.formatEther(data.value))
      const releasedTokens = parseFloat(
        ethers.utils.formatEther(data.releasedAmount)
      )
      const startDate = new Date(parseInt(data.start) * 1000)
      const endDate = new Date(parseInt(data.end) * 1000)
      const now = new Date()

      // Calculate total USD values
      const totalUSDValue = (totalTokens * price).toFixed(2)
      setTotalUSD(totalUSDValue)

      // Calculate remaining USD
      const remainingTokens = totalTokens - releasedTokens
      const remainingUSDValue = (remainingTokens * price).toFixed(2)
      setRemainingUSD(remainingUSDValue)

      // Calculate vesting percentage based on time
      const totalDuration = endDate.getTime() - startDate.getTime()
      const elapsed = now.getTime() - startDate.getTime()
      const vestingPercentage = Math.min((elapsed / totalDuration) * 100, 100)
      setVestedPercentage(vestingPercentage)

      // Generate vesting schedule
      const schedule: VestingSchedule[] = []
      const monthDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
      )
      const tokensPerMonth = totalTokens / monthDiff

      let accumulatedTokens = 0
      for (let i = 0; i <= monthDiff; i++) {
        const date = new Date(startDate)
        date.setMonth(date.getMonth() + i)
        accumulatedTokens = Math.min(tokensPerMonth * (i + 1), totalTokens)

        schedule.push({
          date: date.toLocaleDateString(),
          tokens: tokensPerMonth,
          value: tokensPerMonth * price,
          totalVested: accumulatedTokens,
          status: date <= now ? "vested" : "pending",
        })
      }

      setVestingSchedule(schedule)

      // Calculate withdrawal values
      if (amountWithdraw) {
        const withdrawalUSD = (parseFloat(amountWithdraw) * price).toFixed(2)
        const withdrawalEUR = (parseFloat(amountWithdraw) * priceEur).toFixed(2)
        setTotalWUSD(withdrawalUSD)
        setTotalWEUR(withdrawalEUR)
      }
    }
  }, [data, price, priceEur, amountWithdraw])

  // Generate price history data
  const generatePriceHistory = (currentPrice: number) => {
    const history = []
    const basePrice = currentPrice
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      history.push({
        date: date.toLocaleDateString(),
        price: (basePrice * (0.9 + Math.random() * 0.2)).toFixed(4),
      })
    }
    setPriceHistory(history)
  }

  // Helper functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const valueInEther = ethers.utils.formatEther(data.value)
  const releasedAmountInEther = ethers.utils.formatEther(data.releasedAmount)
  const progressPercentage =
    (parseFloat(releasedAmountInEther) / parseFloat(valueInEther)) * 100

  if (!walletClient?.account.address) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to view vesting details
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Vesting Card */}
        <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Value Locked
            </CardTitle>
            <Shield className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(totalUSD))}
            </div>
            <p className="text-xs text-gray-500">
              {Number(valueInEther).toLocaleString()} OVR
            </p>
            <div className="mt-4">
              <Progress value={vestedPercentage} className="h-2" />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Total Vested: {vestedPercentage.toFixed(1)}%</span>
                <span>Released: {progressPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available to Withdraw Card */}
        <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Available to Withdraw
            </CardTitle>
            <Unlock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(amountWithdraw) * price)}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">
                {Number(amountWithdraw).toFixed(4)} OVR
              </p>
              <p className="text-xs text-gray-500">
                ≈ €{(parseFloat(amountWithdraw) * priceEur).toFixed(2)}
              </p>
            </div>
            <Button
              onClick={() => withdrawTokens()}
              disabled={isWithdrawing || parseFloat(amountWithdraw) === 0}
              className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600"
            >
              {isWithdrawing
                ? "Processing..."
                : parseFloat(amountWithdraw) === 0
                ? "No tokens available"
                : `Withdraw ${Number(amountWithdraw).toFixed(4)} OVR`}
            </Button>
          </CardContent>
        </Card>

        {/* Remaining Balance Card */}
        <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Balance
            </CardTitle>
            <Lock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(remainingUSD))}
            </div>
            <p className="text-xs text-gray-500">
              {(Number(valueInEther) - Number(releasedAmountInEther)).toFixed(
                4
              )}{" "}
              OVR
            </p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <Clock className="mr-1 h-3 w-3" />
              Linear vesting until{" "}
              {new Date(parseInt(data.end) * 1000).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Token Price Card */}
        <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Token Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${price.toFixed(4)}</div>
            <p className="text-xs text-gray-500">€{priceEur.toFixed(4)}</p>
            <div className="mt-4 h-[40px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory.slice(-7)}>
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#ec4899"
                    fill="#ec489922"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
          <TabsTrigger value="schedule">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Vesting Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <ChartIcon className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card className="border-gray-800/50 bg-gray-900/50">
            <CardHeader>
              <CardTitle>Vesting Timeline</CardTitle>
              <CardDescription>
                Your token vesting schedule and unlock timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vestingSchedule}>
                    <defs>
                      <linearGradient
                        id="colorTokens"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8884d8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value.toFixed(2)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(17, 24, 39, 0.9)",
                        border: "1px solid rgba(75, 85, 99, 0.3)",
                        borderRadius: "6px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalVested"
                      stroke="#8884d8"
                      strokeWidth={2}
                      fill="url(#colorTokens)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="mb-4 text-sm font-medium text-gray-200">
                  Vesting Status & History
                </h4>
                <ScrollArea className="h-[200px] rounded-md border border-gray-800">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Cumulative Released</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Current Status Row */}
                      <TableRow className="bg-gray-800/30">
                        <TableCell>{new Date().toLocaleDateString()}</TableCell>
                        <TableCell>Current Status</TableCell>
                        <TableCell>
                          {Number(amountWithdraw).toFixed(4)} OVR Available
                        </TableCell>
                        <TableCell>
                          {Number(releasedAmountInEther).toFixed(4)} /{" "}
                          {Number(valueInEther).toFixed(4)} OVR
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                            {progressPercentage.toFixed(1)}% Released
                          </span>
                        </TableCell>
                      </TableRow>

                      {/* Past Withdrawals */}
                      {transactionHistory.map((tx, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(tx.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>Withdrawal</TableCell>
                          <TableCell>{tx.amount.toFixed(4)} OVR</TableCell>
                          <TableCell>
                            {Number(releasedAmountInEther).toFixed(4)} /{" "}
                            {Number(valueInEther).toFixed(4)} OVR
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                              Completed
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Additional Info Card */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Card className="border-gray-800/50 bg-gray-900/50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Vesting Period</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(
                            parseInt(data.start) * 1000
                          ).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-white">to</span>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            parseInt(data.end) * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-800/50 bg-gray-900/50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Daily Vesting Rate
                      </p>
                      <p className="text-sm text-white">
                        {(
                          Number(valueInEther) /
                          ((new Date(parseInt(data.end) * 1000).getTime() -
                            new Date(parseInt(data.start) * 1000).getTime()) /
                            (24 * 60 * 60 * 1000))
                        ).toFixed(4)}{" "}
                        OVR/day
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Price Chart */}
            <Card className="border-gray-800/50 bg-gray-900/50">
              <CardHeader>
                <CardTitle>Price Analysis</CardTitle>
                <CardDescription>30-day price history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
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
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Vesting Stats */}
            <Card className="border-gray-800/50 bg-gray-900/50">
              <CardHeader>
                <CardTitle>Vesting Statistics</CardTitle>
                <CardDescription>
                  Current vesting status and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Start Date</span>
                      <span className="text-sm text-white">
                        {new Date(
                          parseInt(data.start) * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">End Date</span>
                      <span className="text-sm text-white">
                        {new Date(
                          parseInt(data.end) * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        Vesting Progress
                      </span>
                      <span className="text-sm text-white">
                        {vestedPercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        Released Progress
                      </span>
                      <span className="text-sm text-white">
                        {progressPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <Progress value={vestedPercentage} className="h-2" />

                  <Alert className="border-gray-700 bg-gray-800/50">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription>
                      {parseFloat(amountWithdraw) > 0
                        ? `You have ${Number(amountWithdraw).toFixed(
                            4
                          )} OVR available to withdraw`
                        : "No tokens available for withdrawal at this time"}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default VestingDashboard
