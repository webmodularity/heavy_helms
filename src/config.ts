import { http, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";

// Export the public viem client for direct blockchain interactions
export const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});
