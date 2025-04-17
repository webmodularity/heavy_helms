import { http, createPublicClient } from "viem";
import { baseSepolia, mainnet, shape } from "viem/chains";
import { createConfig } from "@privy-io/wagmi";
// Export the public viem client for direct blockchain interactions
export const viemClient = createPublicClient({
  chain:
    process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
      ? baseSepolia
      : shape,
  transport: http(
    `https://${process.env.NEXT_PUBLIC_ALCHEMY_NETWORK}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ),
  batch: {
    multicall: true,
  },
});

export const wagmiConfig = createConfig({
  chains: [baseSepolia, mainnet, shape],
  transports: {
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [shape.id]: http(
      `https://${process.env.NEXT_PUBLIC_ALCHEMY_NETWORK}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    ),
  },
});

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
