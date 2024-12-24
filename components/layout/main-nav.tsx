import React, { useState } from "react"
import Link from "next/link"
import {
  BarChart2,
  Calendar,
  Home,
  Menu,
  Settings,
  Wallet,
  X,
} from "lucide-react"

const VestingDashboardNav = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-2xl font-bold text-transparent">
            OVR Vesting
          </h1>
        </Link>
      </div>
    </nav>
  )
}

export default VestingDashboardNav
