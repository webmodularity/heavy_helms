import { http, createPublicClient, createClient } from "viem";
import { createConfig } from "wagmi";
import { baseSepolia, shape } from "wagmi/chains";
import {
  shape as viemShape,
  baseSepolia as viemBaseSepolia,
} from "viem/chains";
// import { createConfig } from "@privy-io/wagmi";
// import { privyWagmiConnector } from "@privy-io/wagmi-connector";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import type { Database } from "./types/supabase.types";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
// Export the public viem client for direct blockchain interactions
export const viemClient = createPublicClient({
  chain:
    process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
      ? viemBaseSepolia
      : viemShape,
  transport: http(
    `https://${process.env.NEXT_PUBLIC_ALCHEMY_NETWORK}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ),
  batch: {
    multicall: true,
  },
});

export const wagmiConfig = createConfig({
  chains:
    process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
      ? [baseSepolia]
      : [shape],
  connectors: [miniAppConnector()],
  // ssr: true,
  transports: {
    [baseSepolia.id]: http(),
    // [mainnet.id]: http(),
    [shape.id]: http(
      `https://${process.env.NEXT_PUBLIC_ALCHEMY_NETWORK}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    ),
  },
});
export const supabaseClient = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

// Use environment variable for Subgraph URL
export const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL as string;

// Add a check for the new environment variable
if (!SUBGRAPH_URL) {
  console.warn("NEXT_PUBLIC_SUBGRAPH_URL is not set in environment variables.");
  // Optionally, you could set a default or throw an error if it's critical
  // throw new Error("Critical environment variable NEXT_PUBLIC_SUBGRAPH_URL is missing.");
}

// Contract addresses
export const PLAYER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;
export const SKIN_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_SKIN_REGISTRY_ADDRESS as `0x${string}`;
export const EQUIPMENT_REQUIREMENTS_ADDRESS = process.env
  .NEXT_PUBLIC_EQUIPMENT_REQUIREMENTS_ADDRESS as `0x${string}`;

// Fallback addresses for local development (these should be replaced with actual contract addresses)
if (!PLAYER_CONTRACT_ADDRESS) {
  console.warn(
    "NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS not set, using fallback address",
  );
}

if (!SKIN_REGISTRY_ADDRESS) {
  console.warn(
    "NEXT_PUBLIC_SKIN_REGISTRY_ADDRESS not set, using fallback address",
  );
}

if (!EQUIPMENT_REQUIREMENTS_ADDRESS) {
  console.warn(
    "NEXT_PUBLIC_EQUIPMENT_REQUIREMENTS_ADDRESS not set, using fallback address",
  );
}

export const DEFAULT_CHARACTER_IMAGE =
  "https://ipfs.io/ipfs/bafkreifk4hrfa4vq3kti45yyblwuuzfjbi7gjena7ns5hlq6cxtgeda2ku";
