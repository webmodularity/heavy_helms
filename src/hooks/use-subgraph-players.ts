import { gql, useQuery } from '@apollo/client';
import { useWallets } from '@privy-io/react-auth'; // Adjust based on your wallet provider
import { useEffect, useState } from 'react';
import type { Character, Stance, Weapon, Armor, SubgraphPlayer } from '@/types/player.types';

const GET_OWNED_PLAYERS = gql`
  query GetOwnedPlayers($owner: String!) {
    owners(where: {address: $owner}) {
      address
      totalPlayers
      activePlayers(where: {isRetired: false}) {
        id
        firstName
        surname
        strength
        constitution
        size
        agility
        stamina
        luck
        wins
        losses
        kills
        currentSkin {
          metadataURI
          weapon
          armor
          stance
        }
      }
    }
  }
`;

// Helper function to convert IPFS URLs to HTTPS gateway URLs
function ipfsToHttps(url: string): string {
  if (!url) return '';
  
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  if (url.startsWith('Qm') || url.startsWith('bafy')) {
    return `https://ipfs.io/ipfs/${url}`;
  }
  
  return url;
}

// Helper function to fetch and parse metadata JSON
async function fetchMetadata(metadataURI: string): Promise<{ image: string, [key: string]: any }> {
  try {
    const url = ipfsToHttps(metadataURI);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { image: '' };
  }
}

function mapWeaponToString(weaponId: number): Weapon {
  const weapons: Record<number, Weapon> = {
    0: "Sword + Shield",
    1: "Mace + Shield",
    2: "Rapier + Shield",
    3: "Greatsword",
    4: "Battleaxe",
    5: "Quarterstaff",
    6: "Spear"
  };
  return weapons[weaponId] || "Sword + Shield";
}

function mapArmorToString(armorId: number): Armor {
  const armors: Record<number, Armor> = {
    0: "Cloth",
    1: "Leather",
    2: "Chain",
    3: "Plate"
  };
  return armors[armorId] || "Cloth";
}

function mapStanceToString(stanceId: number): Stance {
  const stances: Record<number, Stance> = {
    0: "defensive",
    1: "balanced",
    2: "offensive"
  };
  return stances[stanceId] || "balanced";
}

export function useSubgraphPlayers() {
  // Get the connected wallet address
  const { wallets } = useWallets();
  const address = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  )?.address?.toLowerCase();

  // State for processed players with image URLs
  const [players, setPlayers] = useState<Character[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Query the subgraph
  const { data, loading, error, refetch } = useQuery<{ owners: { activePlayers: SubgraphPlayer[] }[] }>(GET_OWNED_PLAYERS, {
    variables: { owner: address },
    skip: !address,
    fetchPolicy: 'cache-and-network',
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
        // Map subgraph data and fetch metadata for each player
        const playersWithMetadata: Character[] = await Promise.all(
          data.owners[0].activePlayers.map(async (player) => {
            // Default image in case metadata fetch fails
            let imageUrl = 'https://ipfs.io/ipfs/QmaALMyYXwHuwu2EvDrLjkqFK9YigUb6RD9FX7MqVGoDkW';
            
            // Fetch and process metadata if available
            if (player.currentSkin?.metadataURI) {
              const metadata = await fetchMetadata(player.currentSkin.metadataURI);
              if (metadata.image) {
                imageUrl = ipfsToHttps(metadata.image);
              }
            }
            console.log({...player})
            console.log("player", player.currentSkin);
            return {
              playerId: player.id,
              name: `${player.firstName} ${player.surname}`,
              nameData: {
                firstName: player.firstName,
                surname: player.surname,
                fullName: `${player.firstName} ${player.surname}`
              },
              imageUrl,
              stance: mapStanceToString(player.currentSkin?.stance || 1),
              weapon: mapWeaponToString(player.currentSkin?.weapon || 0),
              armor: mapArmorToString(player.currentSkin?.armor || 0),
              strength: player.strength,
              constitution: player.constitution,
              size: player.size,
              agility: player.agility,
              stamina: player.stamina,
              luck: player.luck,
              wins: player.wins,
              losses: player.losses,
              kills: player.kills
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
    
    if (data && !loading) {
      processPlayerData();
    }
  }, [data, loading]);

  return {
    players,
    isLoading: loading || isProcessing,
    error,
    refetch
  };
}
