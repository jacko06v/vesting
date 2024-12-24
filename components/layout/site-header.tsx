"use client"

import useScroll from "@/lib/hooks/use-scroll"
import { cn } from "@/lib/utils"
import { WalletConnectCustom } from "@/components/blockchain/wallet-connect-custom"

export function SiteHeader() {
  const scrolled = useScroll(0)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-gray-800/50 backdrop-blur-xl transition-all",
        scrolled && "bg-gray-900/50"
      )}
    >
      <div className="container flex h-12 items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Logo o altri elementi qui */}
        </div>
        <div className="flex items-center gap-3">
          <WalletConnectCustom />
        </div>
      </div>
    </header>
  )
}
