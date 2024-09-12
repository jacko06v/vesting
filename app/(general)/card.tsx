"use client"

import { useEffect, useState } from "react"
import Divider from "@mui/material/Divider"
import { ethers } from "ethers"
import { useContractRead, useContractWrite, useWalletClient } from "wagmi"

import { Button } from "@/components/ui/button"

import abi from "./abi/abi"

// Definizione del tipo per i dati dello stato
interface VestingData {
  value: string
  start: string
  end: string
  releasedAmount: string
  lastReleaseDate: string
}

export default function Card() {
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

  const { data: walletClient } = useWalletClient()
  const result = useContractRead({
    address: "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    abi: abi,
    functionName: "grants",
    args: [walletClient?.account.address],
  })

  const {
    write,
  } = useContractWrite({
    address: "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    abi: abi,
    functionName: "unlockVestedTokens",
  })

  const amountToWithdraw = useContractRead({
    address: "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    abi: abi,
    functionName: "calcAmountToWithdraw",
    args: [walletClient?.account.address],
  })

  useEffect(() => {
    if (result.data) {
      const [
        beneficiary,
        value,
        start,
        end,
        duration,
        releasedAmount,
        lastReleaseDate,
        exist,
        revocable,
      ] = result.data

      setData({
        value: value.toString(),
        start: start.toString(),
        end: end.toString(),
        releasedAmount: releasedAmount.toString(),
        lastReleaseDate: lastReleaseDate.toString(),
      })
    }
  }, [result.data])

  useEffect(() => {
    if (amountToWithdraw.data) {
      const withd = ethers.utils.formatEther(amountToWithdraw.data.toString())
      setAmountWithdraw(withd)
    }
  }, [amountToWithdraw.data])

  useEffect(() => {
    const fetchPrice = async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ovr&vs_currencies=usd"
      )
      const data = await response.json()
      setPrice(data.ovr.usd)

      const responseEur = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ovr&vs_currencies=eur"
      )
      const dataEur = await responseEur.json()
      setPriceEur(dataEur.ovr.eur)
    }

    void fetchPrice()
  }, [])

  useEffect(() => {
    if (price && data.value && amountWithdraw) {
      const valueInEther = ethers.utils.formatEther(data.value)
      const totalUSD = (parseFloat(valueInEther) * price).toFixed(2)
      const totalWithdrawUSD = (parseFloat(amountWithdraw) * price).toFixed(2)
      const totalWithdrawEUR = (parseFloat(amountWithdraw) * priceEur).toFixed(
        2
      )
      const remainingUSD = (
        (Number(valueInEther) - Number(releasedAmountInEther)) *
        price
      ).toFixed(2)
      setTotalUSD(totalUSD)
      setTotalWUSD(totalWithdrawUSD)
      setRemainingUSD(remainingUSD)
      setTotalWEUR(totalWithdrawEUR)
    }
  }, [price, data.value, amountWithdraw])

  const formatDate = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp) * 1000)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0") // I mesi partono da 0
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }

  function formatDifference(startTimestamp: string, endTimestamp: string) {
    const startDate = new Date()
    const endDate = new Date(parseInt(endTimestamp) * 1000)

    let years = endDate.getFullYear() - startDate.getFullYear()
    let months = endDate.getMonth() - startDate.getMonth()
    let days = endDate.getDate() - startDate.getDate()
    let hours = endDate.getHours() - startDate.getHours()

    // Correzione delle ore
    if (hours < 0) {
      hours += 24
      days--
    }

    // Correzione dei giorni
    if (days < 0) {
      const previousMonth = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        0
      )
      days += previousMonth.getDate()
      months--
    }

    // Correzione dei mesi
    if (months < 0) {
      months += 12
      years--
    }

    let result = ""

    if (years > 0) {
      result += `${years}Y `
    }
    if (months > 0 || years > 0) {
      result += `${months}M `
    }
    if (days > 0 || months > 0 || years > 0) {
      result += `${days}D `
    }
    if (hours > 0 && years === 0) {
      result += `${hours}H `
    }

    return result.trim()
  }

  const valueInEther = ethers.utils.formatEther(data.value)
  const releasedAmountInEther = ethers.utils.formatEther(data.releasedAmount)
  const progressPercentage =
    (parseFloat(releasedAmountInEther) / parseFloat(valueInEther)) * 100

  return (
    <div style={{ width: "100%", marginTop: "40px" }}>
      <div style={{ display: "flex", marginBottom: "30px" }}>
        <img
          alt="ovr"
          src=" https://vicetoken.com/wp-content/uploads/2021/11/OVR-OVR.png"
          style={{
            width: 50,
            height: 50,
            marginRight: "5px",
            marginTop: "18px",
          }}
        />
        <h1 style={{ fontSize: 50, fontWeight: 700 }}>OVR Vesting</h1>
      </div>
      <p style={{ color: "#aeb2c1" }}>
        Already withdrawn: {progressPercentage.toFixed(2)}%
      </p>
      <div
        style={{
          height: "30px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <div
          className="bg-gradient-to-br from-blue-900 via-purple-800 to-pink-900"
          style={{
            width: `${progressPercentage}%`,
            height: "100%",
            transition: "width 0.5s ease-in-out",
          }}
        />
      </div>
      <Button
        variant={"outline"}
        style={{ marginTop: "20px" }}
        onClick={() => write()}
      >
        Withdraw{" "}
      </Button>

      <div
        style={{ display: "flex", marginTop: "50px", marginBottom: "100px" }}
      >
        <div
          style={{
            width: "15rem",
            height: "15rem",
            borderRadius: "80px",
            left: "50%",
          }}
          className="absolute  bg-gradient-to-br from-blue-900 via-purple-800 to-pink-900 opacity-80 blur-3xl"
        />
        <div
          style={{
            backgroundColor: "#1b1d21",
            borderRadius: "15px",
            zIndex: 20,
            padding: "25px 40px 25px 25px",
            marginRight: "20px",
            marginLeft: "20%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              zIndex: 20,
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: "20px", marginBottom: "10px" }}>
              <strong>Vesteing:</strong>
            </p>
            <p
              style={{
                fontSize: "16px",
                marginBottom: "3px",
                color: "#68696D",
                fontWeight: 400,
                display: "flex",
              }}
            >
              Chain:{" "}
              <img
                alt="eth"
                src="https://www.pngkey.com/png/full/264-2645391_ethereum-white-logo.png"
                style={{
                  width: 10,
                  height: 16,
                  marginLeft: "8px",
                  marginTop: "4px",
                }}
              />
            </p>
            <p
              style={{
                fontSize: "16px",
                marginBottom: "3px",
                color: "#68696D",
                fontWeight: 400,
              }}
            >
              Total OVR: {Number(valueInEther).toLocaleString("it-IT")} OVR
            </p>
            <p
              style={{
                fontSize: "16px",
                marginBottom: "3px",
                color: "#68696D",
                fontWeight: 400,
              }}
            >
              USD: ${Number(totalUSD).toLocaleString("it-IT")}
            </p>
            <p
              style={{
                fontSize: "16px",
                marginBottom: "3px",
                color: "#68696D",
                fontWeight: 400,
              }}
            >
              Remaining Time: {formatDifference(data.start, data.end)}
            </p>
            <p
              style={{
                fontSize: "16px",
                marginBottom: "3px",
                color: "#68696D",
                fontWeight: 400,
              }}
            >
              Remaining:{" "}
              {(
                Number(valueInEther) - Number(releasedAmountInEther)
              ).toLocaleString("it-IT")}{" "}
              OVR
            </p>
            <p
              style={{
                fontSize: "16px",
                marginBottom: "3px",
                color: "#68696D",
                fontWeight: 400,
              }}
            >
              Remaining USD: ${Number(remainingUSD).toLocaleString("it-IT")}
            </p>

            <div
              style={{
                marginTop: "10px",
                padding: "5px",
                backgroundColor: "#DE2BE6",
                width: "fit-content",
                borderRadius: "4px",
              }}
            >
              <p style={{ color: "white", fontSize: "10px" }}>INFO</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 19 }}>
          <div
            style={{
              backgroundColor: "#1b1d21",
              borderRadius: "8px",
              zIndex: 20,
              padding: "15px",
              width: "250px",
              marginRight: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                zIndex: 20,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: "20px", marginBottom: "10px" }}>
                <strong>To withdraw:</strong>
              </p>
              <p
                style={{
                  fontSize: "16px",
                  marginBottom: "3px",
                  color: "#68696D",
                  fontWeight: 400,
                }}
              >
                pending: {Number(amountWithdraw).toFixed(2)}
              </p>
              <p
                style={{
                  fontSize: "16px",
                  marginBottom: "3px",
                  color: "#68696D",
                  fontWeight: 400,
                }}
              >
                value: ${totalWUSD}
              </p>
              <p
                style={{
                  fontSize: "16px",
                  marginBottom: "3px",
                  color: "#68696D",
                  fontWeight: 400,
                }}
              >
                value: €{totalWEUR}
              </p>
              <div
                style={{
                  marginTop: "10px",
                  padding: "5px",
                  backgroundColor: "#008cff",
                  width: "fit-content",
                  borderRadius: "4px",
                }}
              >
                <p style={{ color: "white", fontSize: "10px" }}>PENDING</p>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#1b1d21",
              borderRadius: "8px",
              zIndex: 20,
              padding: "15px",
              width: "250px",
              marginRight: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                zIndex: 20,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: "20px", marginBottom: "10px" }}>
                <strong>Last release:</strong>
              </p>
              <p
                style={{
                  fontSize: "16px",
                  marginBottom: "3px",
                  color: "#68696D",
                  fontWeight: 400,
                }}
              >
                Date: {formatDate(data.lastReleaseDate)}
              </p>
              <div
                style={{
                  marginTop: "10px",
                  padding: "5px",
                  backgroundColor: "#8742ff",
                  width: "fit-content",
                  borderRadius: "4px",
                }}
              >
                <p style={{ color: "white", fontSize: "10px" }}>ATTENTION</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
