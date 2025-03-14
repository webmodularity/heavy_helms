import { ipfsToHttps } from './utils';

/**
 * Fetches NFT metadata from a URI
 * @param metadataURI The URI to fetch metadata from
 * @returns The metadata object or null if there was an error
 */
export async function fetchNFTMetadata(metadataURI: string): Promise<any | null> {
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
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

/**
 * Extracts the image URL from NFT metadata
 * @param metadata The NFT metadata object
 * @returns The image URL or null if not found
 */
export function extractImageUrl(metadata: any): string | null {
  if (!metadata) return null;
  
  // Check for image property (standard)
  if (metadata.image) {
    return ipfsToHttps(metadata.image);
  }
  
  // Check for image_url property (some NFTs use this)
  if (metadata.image_url) {
    return ipfsToHttps(metadata.image_url);
  }
  
  // Check for properties.image (some NFTs structure it this way)
  if (metadata.properties && metadata.properties.image) {
    return ipfsToHttps(metadata.properties.image.description || metadata.properties.image);
  }
  
  return null;
}