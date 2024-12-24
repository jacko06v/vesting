"use client"

import React from "react"
import {
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { motion } from "framer-motion"
import {
  Activity,
  Download,
  History,
  LineChart,
  Table,
  Wallet,
} from "lucide-react"

import { TableHeader } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import VestingAnalytics from "./analytics"
import VestingDashboard from "./card"
import { useVestingData } from "./hooks/use-vesting-data"

export default function DashboardPage() {
  const vestingData: {
    transactions?: {
      date: string
      type: string
      amount: number
      status: string
      hash: string
    }[]
    totalValue?: number
    releasedValue?: number
    vestedPercentage?: number
    startDate?: Date
    endDate?: Date
    priceHistory?: any[]
    tokenPrice?: number
    vestingSchedule?: any[]
  } = useVestingData() // Hook per centralizzare i dati del vesting

  const analyticsData = {
    totalValue: vestingData?.totalValue || 0,
    releasedValue: vestingData?.releasedValue || 0,
    vestedPercentage: vestingData?.vestedPercentage || 0,
    startDate: vestingData?.startDate
      ? new Date(vestingData.startDate)
      : new Date(),
    endDate: vestingData?.endDate ? new Date(vestingData.endDate) : new Date(),
    priceHistory: vestingData?.priceHistory || [],
    tokenPrice: vestingData?.tokenPrice || 0,
    vestingSchedule: vestingData?.vestingSchedule || [],
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-4"
        >
          <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-2">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Vesting Dashboard
          </h1>
        </motion.div>
        <p className="text-gray-400">
          Monitor and manage your token vesting schedule, track progress, and
          handle withdrawals.
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="border border-gray-700 bg-gray-800/50">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gray-700"
          >
            <LineChart className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gray-700"
          >
            <Activity className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="withdrawals"
            className="data-[state=active]:bg-gray-700"
          >
            <Wallet className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <VestingDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <VestingAnalytics vestingData={analyticsData} />
        </TabsContent>

        <TabsContent value="withdrawals">
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 backdrop-blur">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Transaction History
                  </h3>
                  <p className="text-gray-400">
                    View your past vesting and withdrawal transactions
                  </p>
                </div>
                <Button variant="outlined" className="border-gray-700">
                  <Download className="mr-2 h-4 w-4" />
                  Export History
                </Button>
              </div>

              {vestingData?.transactions?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vestingData.transactions.map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(tx.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                              tx.type === "withdrawal"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </TableCell>
                        <TableCell>{tx.amount.toLocaleString()} OVR</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                              tx.status === "completed"
                                ? "bg-green-500/20 text-green-400"
                                : tx.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <a
                            href={`https://etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-700">
                  <div className="text-center">
                    <History className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-200">
                      No transactions yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Your transaction history will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
