import { HTMLAttributes } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { AlertCircle, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"

interface WalletConnectCustomProps extends HTMLAttributes<HTMLDivElement> {
  classNameConnect?: string
  classNameConnected?: string
  classNameWrongNetwork?: string
  labelConnect?: string
  labelWrongNetwork?: string
}

export const WalletConnectCustom = ({
  className,
  labelConnect = "Connect Wallet",
  labelWrongNetwork = "Wrong Network",
  ...props
}: WalletConnectCustomProps) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const connected =
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")
        const ready = mounted && authenticationStatus !== "loading"

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-xs hover:from-purple-700 hover:to-pink-700"
                  >
                    <Wallet className="mr-1.5 h-3.5 w-3.5" />
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 text-xs hover:bg-red-700"
                  >
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                    Wrong Network
                  </Button>
                )
              }

              return (
                <div className="flex items-center gap-1.5">
                  {/* Network button */}
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 border-gray-800 bg-gray-900/50 p-0 hover:bg-gray-900"
                  >
                    {chain.hasIcon && (
                      <div
                        className="h-4 w-4 overflow-hidden rounded-full"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="h-4 w-4"
                          />
                        )}
                      </div>
                    )}
                  </Button>

                  {/* Address and balance button */}
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    size="sm"
                    className="h-8 border-gray-800 bg-gray-900/50 px-3 hover:bg-gray-900"
                  >
                    <div className="flex items-center whitespace-nowrap">
                      <span className="mr-2 text-xs text-gray-400">
                        {account.displayBalance}
                      </span>
                      <span className="truncate text-xs font-medium">
                        {account.displayName}
                      </span>
                    </div>
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default WalletConnectCustom
