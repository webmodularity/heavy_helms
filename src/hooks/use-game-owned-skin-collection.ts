import { SUBGRAPH_URL } from "@/config";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import type { SkinType } from "@/types/skin.types";
import { GET_GAME_OWNED_SKIN_COLLECTION } from "@/lib/gql-queries";

interface SkinCollectionSkin {
    id: string;
    tokenId: number;
    metadataURI: string;
    weapon: number;
    armor: number;
  }

interface SkinCollection {
  registryId: string;
  contractAddress: string;
  skinType: number;
  requiredNFTAddress: string | null;
  skins: SkinCollectionSkin[];
}

interface SkinCollectionResponse {
  skinCollections: SkinCollection[];
}

export function useGameOwnedSkinCollection(skinType: SkinType) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["gameOwnedSkinCollection", skinType],
    queryFn: async () => {
      const result = await request<SkinCollectionResponse>(
        SUBGRAPH_URL,
        GET_GAME_OWNED_SKIN_COLLECTION,
        { skinType },
      );

      return result.skinCollections[0] || null;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - these rarely change
  });

  return {
    collection: data,
    isLoading,
    error,
  };
}
