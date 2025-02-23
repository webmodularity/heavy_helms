import { Alchemy, Network } from 'alchemy-sdk';
import { createPublicClient, http, parseAbiItem, keccak256 as viemKeccak256, toHex } from 'viem';
import { PlayerABI, SkinRegistryABI, ERC721ABI, PracticeGameABI, PlayerNameRegistryABI, MonsterABI, DefaultPlayerABI, GameEngineABI } from '../abi';
import { getFighterType, FighterType, getContractInfo } from './fighterTypes';
import { getAbiForType } from './abiUtils';

const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: process.env.NEXT_PUBLIC_ALCHEMY_NETWORK
};

const alchemy = new Alchemy(settings);

export async function loadCharacterData(playerId) {
    try {
        const networkName = getAlchemyNetwork(settings.network);
        
        const transport = http(`https://${networkName}.g.alchemy.com/v2/${settings.apiKey}`);
        const client = createPublicClient({
            transport
        });

        // Get fighter type and contract info
        const fighterType = getFighterType(playerId);
        const contractInfo = getContractInfo(fighterType);
        
        // Get contract address
        const contractAddress = await client.readContract({
            address: process.env.NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS,
            abi: PracticeGameABI,
            functionName: contractInfo.contractFunction
        });

        // Get fighter stats
        try {
            let playerStats = await client.readContract({
                address: contractAddress,
                abi: getAbiForType(contractInfo.abi),
                functionName: contractInfo.method,
                args: [BigInt(playerId)]
            });

            if (!playerStats) {
                throw new Error(`No fighter data found for ID ${playerId}`);
            }

            // Get name registry address and fighter name - only for Players
            let playerName = ['Unknown', 'Unknown'];
            if (fighterType === FighterType.Player || fighterType === FighterType.DefaultPlayer) {
                const nameRegistryAddress = await client.readContract({
                    address: contractAddress,
                    abi: PlayerABI,
                    functionName: 'nameRegistry'
                });

                playerName = await client.readContract({
                    address: nameRegistryAddress,
                    abi: PlayerNameRegistryABI,
                    functionName: 'getFullName',
                    args: [playerStats.firstNameIndex, playerStats.surnameIndex]
                });
            }

            // Get GameEngine address from PracticeGame contract
            const gameEngineAddress = await client.readContract({
                address: process.env.NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS,
                abi: PracticeGameABI,
                functionName: 'gameEngine'
            });

            // Create FighterStats structure for GameEngine calculation
            const fighterStats = {
                weapon: Number(playerStats.skin.weapon || 0),
                armor: Number(playerStats.skin.armor || 0),
                stance: Number(playerStats.skin.stance || 0),
                attributes: {
                    strength: Number(playerStats.attributes.strength),
                    constitution: Number(playerStats.attributes.constitution),
                    size: Number(playerStats.attributes.size),
                    agility: Number(playerStats.attributes.agility),
                    stamina: Number(playerStats.attributes.stamina),
                    luck: Number(playerStats.attributes.luck)
                }
            };

            // Calculate derived stats using GameEngine contract
            let calculatedStats = await client.readContract({
                address: gameEngineAddress,
                abi: GameEngineABI,
                functionName: 'calculateStats',
                args: [fighterStats]
            });

            const stats = {
                // Base attributes
                strength: Number(playerStats.attributes.strength),
                constitution: Number(playerStats.attributes.constitution),
                size: Number(playerStats.attributes.size),
                agility: Number(playerStats.attributes.agility),
                stamina: Number(playerStats.attributes.stamina),
                luck: Number(playerStats.attributes.luck),
                // Skin info
                skinIndex: Number(playerStats.skin.skinIndex),
                skinTokenId: Number(playerStats.skin.skinTokenId),
                // Optional stats with defaults
                firstNameIndex: Number(playerStats.firstNameIndex || 0),
                surnameIndex: Number(playerStats.surnameIndex || 0),
                wins: Number(playerStats.wins || 0),
                losses: Number(playerStats.losses || 0),
                kills: Number(playerStats.kills || 0),
                // Monster-specific stat
                tier: fighterType === FighterType.Monster ? Number(playerStats.tier) : 0,
                // Calculated stats
                maxHealth: Number(calculatedStats.maxHealth),
                maxEndurance: Number(calculatedStats.maxEndurance),
                damageModifier: Number(calculatedStats.damageModifier),
                hitChance: Number(calculatedStats.hitChance),
                blockChance: Number(calculatedStats.blockChance),
                dodgeChance: Number(calculatedStats.dodgeChance),
                critChance: Number(calculatedStats.critChance),
                initiative: Number(calculatedStats.initiative),
                counterChance: Number(calculatedStats.counterChance),
                critMultiplier: Number(calculatedStats.critMultiplier),
                parryChance: Number(calculatedStats.parryChance),
                baseSurvivalRate: Number(calculatedStats.baseSurvivalRate)
            };

            // Update skin registry call with new address
            const skinRegistryAddress = await client.readContract({
                address: contractAddress,
                abi: PlayerABI,
                functionName: 'skinRegistry'
            });
            // Get skin info
            const skinInfo = await client.readContract({
                address: skinRegistryAddress,
                abi: SkinRegistryABI,
                functionName: 'getSkin',
                args: [stats.skinIndex]
            });

            // Get NFT metadata
            const tokenURI = await client.readContract({
                address: skinInfo.contractAddress,
                abi: ERC721ABI,
                functionName: 'tokenURI',
                args: [BigInt(stats.skinTokenId)]
            });

            let metadata;
            try {
                if (tokenURI.startsWith('ipfs://')) {
                    const ipfsHash = tokenURI.replace('ipfs://', '');
                    const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
                    const response = await fetch(ipfsUrl);
                    const rawText = await response.text();
                    metadata = JSON.parse(rawText);
                    
                    let spritesheetUrl = metadata.image_spritesheet;
                    if (spritesheetUrl && spritesheetUrl.startsWith('ipfs://')) {
                        spritesheetUrl = spritesheetUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    }

                    return {
                        stats,
                        nftContractAddress: skinInfo.contractAddress,
                        spritesheetUrl,
                        jsonData: metadata,
                        name: {
                            firstName: playerName[0],
                            surname: playerName[1],
                            fullName: `${playerName[0]} ${playerName[1]}`
                        }
                    };
                } else {
                    const response = await fetch(tokenURI);
                    const rawText = await response.text();
                    metadata = JSON.parse(rawText);
                }

                // Convert IPFS spritesheet URL to HTTP URL if needed
                let spritesheetUrl = metadata.image_spritesheet;
                if (spritesheetUrl && spritesheetUrl.startsWith('ipfs://')) {
                    spritesheetUrl = spritesheetUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                }

                return {
                    stats,
                    nftContractAddress: skinInfo.contractAddress,
                    spritesheetUrl,
                    jsonData: metadata,
                    name: {
                        firstName: playerName[0],
                        surname: playerName[1],
                        fullName: playerName[0] + ' ' + playerName[1]
                    }
                };

            } catch (error) {
                throw error;
            }

        } catch (error) {
            console.error('Error calculating stats:', {
                error: error.message,
                cause: error.cause,
                data: error.data
            });
            throw new Error(`Failed to calculate player stats: ${error.message}`);
        }

    } catch (error) {
        console.error('Error loading character data:', {
            playerId,
            error: error.message,
            networkName: settings.network,
            stack: error.stack
        });
        throw new Error(`Failed to load character data for player ${playerId}: ${error.message}`);
    }
} 

// Format network name for URL (e.g., "shape-sepolia" -> "shape-sepolia")
function getAlchemyNetwork(networkName) {
    return networkName;
}