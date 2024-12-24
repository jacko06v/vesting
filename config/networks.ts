import { env } from "@/env.mjs"
import { Chain, ChainProviderFn, configureChains } from "wagmi"
import {
  goerli as goerliNoIcon,
  mainnet,
  polygon,
  polygonMumbai,
  sepolia as sepoliaNoIcon,
} from "wagmi/chains"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { infuraProvider } from "wagmi/providers/infura"
import { publicProvider } from "wagmi/providers/public"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"

const goerli = {
  ...goerliNoIcon,
  iconUrl: "/icons/NetworkEthereumTest.svg",
}

const sepolia = {
  ...sepoliaNoIcon,
  iconUrl: "/icons/NetworkEthereumTest.svg",
}

export const ETH_CHAINS_TEST = [goerli, sepolia, polygonMumbai]

export const ETH_CHAINS_PROD = [mainnet, polygon]

export const ETH_CHAINS_DEV =
  env.NEXT_PUBLIC_PROD_NETWORKS_DEV === "true"
    ? [...ETH_CHAINS_PROD, ...ETH_CHAINS_TEST]
    : [...ETH_CHAINS_TEST]

export const CHAINS: Chain[] =
  process.env.NODE_ENV === "production" ? ETH_CHAINS_PROD : ETH_CHAINS_DEV

const PROVIDERS: ChainProviderFn<Chain>[] = [
  // LlamaRPC come provider principale
  jsonRpcProvider({
    rpc: (chain) => {
      if (chain.id === mainnet.id) {
        return { 
          http: 'https://eth.llamarpc.com',
          webSocket: 'wss://eth.llamarpc.com'
        }
      }
      // Per gli altri network usa null e passerà al provider successivo
      return null
    },
  })
]

if (env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
  if (!env.NEXT_PUBLIC_ALCHEMY_API_KEY)
    throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not defined")
  PROVIDERS.push(
    alchemyProvider({
      apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    })
  )
}

if (env.NEXT_PUBLIC_INFURA_API_KEY) {
  if (!env.NEXT_PUBLIC_INFURA_API_KEY)
    throw new Error("NEXT_PUBLIC_INFURA_API_KEY is not defined")
  PROVIDERS.push(
    infuraProvider({
      apiKey: env.NEXT_PUBLIC_INFURA_API_KEY,
    })
  )
}

// Fallback to public provider
// Only include public provider if no other providers are available.
if (PROVIDERS.length === 0 || env.NEXT_PUBLIC_USE_PUBLIC_PROVIDER === "true") {
  PROVIDERS.push(publicProvider())
}

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  CHAINS,
  PROVIDERS
)