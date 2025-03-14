import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import type { Player, RawPlayerData } from '@/types/player.types';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { SUBGRAPH_URL } from '@/config';
import { GET_OWNED_PLAYERS_QUERY } from '@/lib/gql-queries';
import { WeaponType, ArmorType, StanceType } from '@/types/equipment.types';
import { fetchNFTMetadata, extractImageUrl } from '@/lib/nft-utils';
import { ipfsToHttps } from '@/lib/utils';

export function useSubgraphPlayers() {
  // Get the connected wallet address
  const { wallets } = useWallets();
  const address = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  )?.address?.toLowerCase();

  // State for processed players with image URLs
  const [players, setPlayers] = useState<Player[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Query the subgraph
  const { data, isLoading, error, refetch } = useQuery<{ owners: { activePlayers: RawPlayerData[] }[] }>({
    queryKey: ["owned-players"],  
    queryFn: async () => request(
      SUBGRAPH_URL,
      GET_OWNED_PLAYERS_QUERY,
      { owner: address },
    )
  });

  // Process the data and fetch metadata for each player
  useEffect(() => {
    async function processPlayerData() {
      if (!data?.owners || data.owners.length === 0) {
        setPlayers([]);
        return;
      }

      setIsProcessing(true);
      
      try {
        const playersWithMetadata: Player[] = await Promise.all(
          data.owners[0].activePlayers.map(async (rawPlayer) => {
            // Convert metadataURI to HTTPS URL
            const metadataHttpsUrl = ipfsToHttps(rawPlayer.currentSkin.metadataURI);
            
            // Fetch the NFT metadata
            let imageUrl: string | null = null;
            try {
              const metadata = await fetchNFTMetadata(metadataHttpsUrl);
              imageUrl = extractImageUrl(metadata);
            } catch (error) {
              console.error('Error fetching metadata:', error);
            }
            
            // Fallback image if metadata fetch fails
            if (!imageUrl) {
              imageUrl = `/assets/characters/warrior_${(Number.parseInt(rawPlayer.id) % 5) + 1}.png`;
            }
            
            return {
              id: rawPlayer.id,
              name: {
                firstName: rawPlayer.firstName,
                surname: rawPlayer.surname,
                fullName: `${rawPlayer.firstName} ${rawPlayer.surname}`
              },
              attributes: {
                strength: rawPlayer.strength,
                constitution: rawPlayer.constitution,
                size: rawPlayer.size,
                agility: rawPlayer.agility,
                stamina: rawPlayer.stamina,
                luck: rawPlayer.luck
              },
              currentSkin: {
                collection: {
                  id: rawPlayer.currentSkin.collection.id,
                  contractAddress: rawPlayer.currentSkin.collection.contractAddress,
                  isVerified: rawPlayer.currentSkin.collection.isVerified,
                  skinType: rawPlayer.currentSkin.collection.skinType,
                  requiredNFTAddress: rawPlayer.currentSkin.collection.requiredNFTAddress || undefined
                },
                tokenId: rawPlayer.currentSkin.tokenId,
                metadataURL: metadataHttpsUrl,
                imageURL: imageUrl,
                weapon: (rawPlayer.currentSkin?.weapon || 0) as WeaponType,
                armor: (rawPlayer.currentSkin?.armor || 0) as ArmorType,
                stance: (rawPlayer.currentSkin?.stance || 1) as StanceType
              },
              record: {
                wins: rawPlayer.wins,
                losses: rawPlayer.losses,
                kills: rawPlayer.kills
              }
            };
          })
        );
        
        // Filter out any null values (in case some promises rejected)
        setPlayers(playersWithMetadata.filter(Boolean));
      } catch (err) {
        console.error('Error processing player data:', err);
      } finally {
        setIsProcessing(false);
      }
    }
    
    if (data && !isLoading) {
      processPlayerData();
    }
  }, [data, isLoading]);

  return {
    players,
    isLoading: isLoading || isProcessing,
    error,
    refetch
  };
}
