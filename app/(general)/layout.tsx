import { ReactNode } from "react"

import { NetworkStatus } from "@/components/blockchain/network-status"
import { Footer } from "@/components/layout/footer"
import { SiteHeader } from "@/components/layout/site-header"



interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <div
        className="relative flex min-h-screen flex-col"
        style={{
          background: "linear-gradient(to bottom, #15082b 0.1%, #131313 8%)",
        }}
      >
        <div
          style={{
            width: "15rem",
            height: "15rem",
            borderRadius: "80px",

            left: "50%",
          }}
          className="absolute z-10 bg-gradient-to-br from-blue-900 via-purple-800 to-pink-900 opacity-80 blur-3xl"
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </div>
      <NetworkStatus />
    </>
  )
}
