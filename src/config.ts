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
  "https://subgraph.satsuma-prod.com/5d543e96d159/viabull-labs/heavy-helms-subgraph/api";
