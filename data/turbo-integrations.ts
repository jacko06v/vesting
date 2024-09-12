export const integrationCategories = [
  "general",
  "protocols",
  "services",
] as const

interface TurboIntegration {
  name: string
  href: string
  url: string
  description: string
  imgLight: string
  imgDark: string
  category: (typeof integrationCategories)[number]
}

export const turboIntegrations = {
  siwe: {
    name: "SIWE",
    href: "/integration/sign-in-with-ethereum",
    url: "https://login.xyz/",
    description:
      "Sign-In with Ethereum is Web3 authentication using an Ethereum account.",
    category: "general",
    imgLight: "/integrations/siwe.svg",
    imgDark: "/integrations/siwe.svg",
  },
  etherscan: {
    name: "Etherscan",
    href: "/integration/etherscan",
    url: "https://etherscan.io",
    description:
      "Etherscan is the leading block explorer and search, API & analytics platform for Ethereum.",
    category: "general",
    imgLight: "/integrations/etherscan-light.svg",
    imgDark: "/integrations/etherscan-dark.svg",
  },
  livepeer: {
    name: "Livepeer",
    href: "/integration/livepeer",
    url: "https://docs.livepeer.org/",
    description: "Livepeer is the world's open video infrastructure.",
    category: "protocols",
    imgLight: "/integrations/livepeer.svg",
    imgDark: "/integrations/livepeer.svg",
  },
  moralis: {
    name: "Moralis",
    href: "/integration/moralis",
    url: "https://docs.moralis.io/",
    description:
      "Moralis provides a complete end-to-end blockchain application development platform.",
    category: "services",
    imgLight: "/integrations/moralis.png",
    imgDark: "/integrations/moralis.png",
  },
  gitcoinPassport: {
    name: "Gitcoin Passport",
    href: "/integration/gitcoin-passport",
    url: "https://docs.passport.gitcoin.co/overview/introducing-gitcoin-passport",
    description:
      "Gitcoin Passport is an identity verification application. It enables you to collect verifiable credentials that prove your identity and trustworthiness without exposing personally identifying information.",
    category: "services",
    imgLight: "/integrations/gitcoin-passport.svg",
    imgDark: "/integrations/gitcoin-passport.svg",
  },
} as const
