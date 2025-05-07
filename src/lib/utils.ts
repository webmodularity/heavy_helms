import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Helper function to convert IPFS URLs to HTTPS gateway URLs
export function ipfsToHttps(url: string): string {
  if (!url) return "";

  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  if (url.startsWith("Qm") || url.startsWith("bafy")) {
    return `https://ipfs.io/ipfs/${url}`;
  }

  return url;
}

/**
 * Basic timeout delay function
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Decodes a uint32 player ID from the first 4 bytes of a hex string.
 * The hex string represents bytes32 data.
 * @param packedDataHex Hex string (e.g., "0x...") representing packed player data.
 * @returns The decoded player ID as a number, or null if input is invalid.
 */
export function decodePlayerIdFromPackedData(
  packedDataHex: string,
): number | null {
  if (
    !packedDataHex ||
    !packedDataHex.startsWith("0x") ||
    packedDataHex.length < 10
  ) {
    // Basic validation: needs to be a hex string and at least 4 bytes (8 hex chars + '0x')
    console.error(
      "Invalid packedDataHex for decoding playerId:",
      packedDataHex,
    );
    return null;
  }

  // Extract the first 4 bytes (8 hex characters after '0x')
  const playerIdHex = packedDataHex.substring(2, 10);

  if (playerIdHex.length !== 8) {
    console.error(
      "Could not extract 4 bytes for playerId from:",
      packedDataHex,
    );
    return null;
  }

  try {
    const playerId = Number.parseInt(playerIdHex, 16);
    return playerId;
  } catch (error) {
    console.error("Error parsing playerIdHex:", playerIdHex, error);
    return null;
  }
}
