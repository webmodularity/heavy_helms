import { http, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";

// Export the public viem client for direct blockchain interactions
export const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export const SUBGRAPH_URL = 'https://subgraph.satsuma-prod.com/5d543e96d159/viabull-labs/heavy-helms-subgraph/api';
