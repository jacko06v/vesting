"use client"

import { ReactNode } from "react"
import { Wallet } from "lucide-react"
import { useAccount, useConnect } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NetworkStatus } from "@/components/blockchain/network-status"
import MainNav from "@/components/layout/main-nav"
import { SiteHeader } from "@/components/layout/site-header"

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  return (
    <div className="flex min-h-screen flex-col">
      {/* Background with animated gradient */}
      <div className="fixed inset-0 -z-10 bg-[#0B0F19]">
        <div className="bg-gradient-radial absolute inset-0 animate-pulse from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Floating orbs */}
      <div className="-z-5 fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
          <div className="container flex h-16 items-center justify-between">
            <MainNav />
            <div className="flex items-center gap-4">
              <SiteHeader />
              {/* <NetworkStatus /> */}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          <div className="container py-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 bg-gray-900/50 py-6 backdrop-blur-xl">
          <div className="container flex items-center justify-between">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Your Project Name
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                Privacy
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
