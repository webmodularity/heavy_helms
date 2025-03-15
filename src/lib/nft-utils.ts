/**
 * Fetches NFT metadata from a URI
 * @param metadataURI The URI to fetch metadata from
 * @returns The metadata object or null if there was an error
 */
export async function fetchNFTMetadata(
  metadataURI: string,
  // biome-ignore lint/suspicious/noExplicitAny: TODO: Define proper metadata type later
): Promise<any | null> {
  try {
    // Fetch the metadata
    const response = await fetch(metadataURI);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    // Parse the JSON response
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return null;
  }
}
