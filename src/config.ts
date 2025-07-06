import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { createPublicClient } from "viem";

// Export the public viem client for Base Sepolia only
export const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ),
  batch: {
    multicall: true,
  },
});

// Wagmi config with Farcaster MiniApp connector
export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors: [
    miniAppConnector(), // This handles wallet connection in Farcaster
  ],
});

// Subgraph URL
export const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL as string;

if (!SUBGRAPH_URL) {
  console.warn("NEXT_PUBLIC_SUBGRAPH_URL is not set in environment variables.");
}

// Contract addresses
export const PLAYER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

export const SKIN_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_SKIN_REGISTRY_ADDRESS as `0x${string}`;

export const EQUIPMENT_REQUIREMENTS_ADDRESS = process.env
  .NEXT_PUBLIC_EQUIPMENT_REQUIREMENTS_ADDRESS as `0x${string}`;
