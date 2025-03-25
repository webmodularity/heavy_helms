import { http, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";

// Export the public viem client for direct blockchain interactions
export const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    `https://${process.env.NEXT_PUBLIC_ALCHEMY_NETWORK}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ),
  batch: {
    multicall: true,
  },
});

export const SUBGRAPH_URL =
  "https://subgraph.satsuma-prod.com/5d543e96d159/viabull-labs/heavy-helms-subgraph/version/v0.4.1/api";

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
