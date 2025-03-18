import { useQuery } from '@tanstack/react-query';

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
}

interface SkinMetadataResult {
  imageUrl: string | null;
  metadata: NFTMetadata | null;
}

/**
 * Custom hook to fetch and parse NFT metadata from a URI
 */
export function useSkinMetadata(metadataURI: string | null | undefined) {
  return useQuery<SkinMetadataResult>({
    queryKey: ["skinMetadata", metadataURI],
    queryFn: async (): Promise<SkinMetadataResult> => {
      if (!metadataURI) {
        return { imageUrl: null, metadata: null };
      }

      try {
        // Fetch the metadata from the URI
        const response = await fetch(metadataURI);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        
        const metadata: NFTMetadata = await response.json();
        
        // Extract the image URL from the metadata
        let imageUrl = null;
        if (metadata.image) {
          // Handle IPFS URLs
          if (metadata.image.startsWith("ipfs://")) {
            imageUrl = metadata.image.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );
          } else {
            imageUrl = metadata.image;
          }
        }
        
        return { imageUrl, metadata };
      } catch (error) {
        console.error("Error fetching skin metadata:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!metadataURI,
  });
} 