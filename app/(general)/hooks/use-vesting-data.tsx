import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useContractRead, useWalletClient } from "wagmi"

import abi from "../abi/abi"

interface PriceHistoryItem {
  date: string
  price: number
}

interface VestingData {
  totalValue: number
  releasedValue: number
  vestedPercentage: number
  startDate: Date
  endDate: Date
  priceHistory: PriceHistoryItem[]
  tokenPrice: number
  vestingSchedule: Array<{
    date: string
    tokens: number
    value: number
  }>
  transactions: any[]
}

export function useVestingData() {
  const [data, setData] = useState<VestingData>({
    totalValue: 0,
    releasedValue: 0,
    vestedPercentage: 0,
    startDate: new Date(),
    endDate: new Date(),
    priceHistory: [],
    tokenPrice: 0,
    vestingSchedule: [],
    transactions: [],
  })

  const { data: walletClient } = useWalletClient()

  const vestingContract = useContractRead({
    address: "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    abi: abi,
    functionName: "grants",
    args: [walletClient?.account?.address],
    enabled: !!walletClient?.account?.address,
  })

  const amountToWithdraw = useContractRead({
    address: "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    abi: abi,
    functionName: "calcAmountToWithdraw",
    args: [walletClient?.account?.address],
    enabled: !!walletClient?.account?.address,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current price
        const priceResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ovr&vs_currencies=usd"
        )
        if (!priceResponse.ok) throw new Error("Failed to fetch current price")
        const priceData = await priceResponse.json()
        const currentPrice = priceData.ovr?.usd || 0

        // Fetch historical price data (last 30 days)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - 30)

        const historicalPriceResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/ovr/market_chart/range?vs_currency=usd&from=${Math.floor(
            startDate.getTime() / 1000
          )}&to=${Math.floor(endDate.getTime() / 1000)}`
        )
        if (!historicalPriceResponse.ok)
          throw new Error("Failed to fetch historical prices")
        const historicalPriceData = await historicalPriceResponse.json()

        const priceHistory: PriceHistoryItem[] = historicalPriceData.prices.map(
          ([timestamp, price]: [number, number]) => ({
            date: new Date(timestamp).toLocaleDateString(),
            price,
          })
        )

        // Check if vesting contract data exists
        if (vestingContract.data) {
          const {
            1: totalValueRaw,
            2: contractStartDateRaw,
            3: contractEndDateRaw,
            5: releasedValueRaw,
          } = vestingContract.data as any

          const totalTokens = parseFloat(
            ethers.utils.formatEther(totalValueRaw.toString())
          )
          const releasedTokens = parseFloat(
            ethers.utils.formatEther(releasedValueRaw.toString())
          )

          const startDate = new Date(
            parseInt(contractStartDateRaw.toString()) * 1000
          )
          const endDate = new Date(
            parseInt(contractEndDateRaw.toString()) * 1000
          )
          const now = new Date()

          // Calculate vesting percentage
          const totalDuration = endDate.getTime() - startDate.getTime()
          const elapsed = now.getTime() - startDate.getTime()
          const vestedPercentage = Math.min(
            (elapsed / totalDuration) * 100,
            100
          )

          // Generate vesting schedule
          const monthDiff = Math.ceil(
            totalDuration / (30 * 24 * 60 * 60 * 1000)
          )
          const tokensPerMonth = totalTokens / monthDiff

          const schedule = Array.from({ length: monthDiff + 1 }, (_, i) => {
            const date = new Date(startDate)
            date.setMonth(startDate.getMonth() + i)
            return {
              date: date.toLocaleDateString(),
              tokens: tokensPerMonth * (i + 1),
              value: tokensPerMonth * (i + 1) * currentPrice,
            }
          })

          setData({
            totalValue: totalTokens * currentPrice,
            releasedValue: releasedTokens * currentPrice,
            vestedPercentage,
            startDate,
            endDate,
            priceHistory,
            tokenPrice: currentPrice,
            vestingSchedule: schedule,
            transactions: [], // Add logic for transactions if needed
          })
        }
      } catch (error) {
        console.error("Error fetching vesting data:", error)
      }
    }

    fetchData()
  }, [vestingContract.data, walletClient?.account?.address])

  return data
}
