import { createPublicClient, http, parseEventLogs } from 'viem';
import { CombatResultType, WinCondition, getEnumKeyByValue } from './combatDecoder';
import { mainnet } from 'viem/chains';
import { 
    PracticeGameABI, 
    GameEngineABI, 
    PlayerABI, 
    DefaultPlayerABI, 
    MonsterABI,
    DuelGameABI 
} from '../abi';
import { keccak256 as viemKeccak256, toHex } from 'viem';
import { Alchemy } from 'alchemy-sdk';
import { getFighterType, getContractInfo } from './fighterTypes';
import { getAbiForType } from './abiUtils';

// Helper function to decode combat bytes into actions
async function decodeCombatBytes(bytes, network) {
    const transport = http(`https://${network}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    const client = createPublicClient({
        transport
    });

    const gameContractAddress = process.env.NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS;
    
    const gameEngineAddress = await client.readContract({
        address: gameContractAddress,
        abi: PracticeGameABI,
        functionName: 'gameEngine'
    });

    // Decode combat log using game engine
    const decodedCombat = await client.readContract({
        address: gameEngineAddress,
        abi: GameEngineABI,
        functionName: 'decodeCombatLog',
        args: [bytes]
    });

    // Extract actions array - skip gameEngineVersion which is at index 1
    const actions = decodedCombat[3];
    
    // Map the actions with proper enum conversion
    const mappedActions = actions.map((action, index) => {
        // Convert numeric values to their enum string representations
        const p1ResultEnum = getEnumKeyByValue(CombatResultType, Number(action.p1Result));
        const p2ResultEnum = getEnumKeyByValue(CombatResultType, Number(action.p2Result));
        
        return {
            p1Result: p1ResultEnum,
            p1Damage: Number(action.p1Damage),
            p1StaminaLost: Number(action.p1StaminaLost),
            p2Result: p2ResultEnum,
            p2Damage: Number(action.p2Damage),
            p2StaminaLost: Number(action.p2StaminaLost)
        };
    });

    return {
        winner: Number(decodedCombat[0]),
        condition: getEnumKeyByValue(WinCondition, Number(decodedCombat[2])), // condition is at index 2 now
        actions: mappedActions
    };
}

export async function loadCombatBytes(player1Id, player2Id) {
    try {
        const networkName = process.env.NEXT_PUBLIC_ALCHEMY_NETWORK.toLowerCase();
        const transport = http(`https://${networkName}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
        const client = createPublicClient({
            chain: mainnet,
            transport
        });

        const gameContractAddress = process.env.NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS;

        // Get fighter types and contract info
        const fighter1Type = getFighterType(player1Id);
        const fighter2Type = getFighterType(player2Id);
        const contract1Info = getContractInfo(fighter1Type);
        const contract2Info = getContractInfo(fighter2Type);

        // Get contract addresses for both fighters
        const [contract1Address, contract2Address] = await Promise.all([
            client.readContract({
                address: gameContractAddress,
                abi: PracticeGameABI,
                functionName: contract1Info.contractFunction
            }),
            client.readContract({
                address: gameContractAddress,
                abi: PracticeGameABI,
                functionName: contract2Info.contractFunction
            })
        ]);

        // Get fighter data for both fighters
        const [player1Data, player2Data] = await Promise.all([
            client.readContract({
                address: contract1Address,
                abi: getAbiForType(contract1Info.abi),
                functionName: contract1Info.method,
                args: [BigInt(player1Id)]
            }),
            client.readContract({
                address: contract2Address,
                abi: getAbiForType(contract2Info.abi),
                functionName: contract2Info.method,
                args: [BigInt(player2Id)]
            })
        ]);

        const player1Loadout = {
            playerId: BigInt(player1Id),
            skin: {
                skinIndex: BigInt(player1Data.skin.skinIndex),
                skinTokenId: BigInt(player1Data.skin.skinTokenId)
            }
        };

        const player2Loadout = {
            playerId: BigInt(player2Id),
            skin: {
                skinIndex: BigInt(player2Data.skin.skinIndex),
                skinTokenId: BigInt(player2Data.skin.skinTokenId)
            }
        };

        // Get combat bytes
        const combatBytes = await client.readContract({
            address: gameContractAddress,
            abi: PracticeGameABI,
            functionName: 'play',
            args: [player1Loadout, player2Loadout]
        });

        // Get game engine address
        const gameEngineAddress = await client.readContract({
            address: gameContractAddress,
            abi: PracticeGameABI,
            functionName: 'gameEngine'
        });

        // Decode using GameEngine - ensure combatBytes is a hex string
        const decodedCombat = await client.readContract({
            address: gameEngineAddress,
            abi: GameEngineABI,
            functionName: 'decodeCombatLog',
            args: [combatBytes]
        });

        // Extract actions array - skip gameEngineVersion which is at index 1
        const actions = decodedCombat[3];
        
        // Map the actions with proper enum conversion
        const mappedActions = actions.map((action, index) => {
            // Convert numeric values to their enum string representations
            const p1ResultEnum = getEnumKeyByValue(CombatResultType, Number(action.p1Result));
            const p2ResultEnum = getEnumKeyByValue(CombatResultType, Number(action.p2Result));
            
            return {
                p1Result: p1ResultEnum,
                p1Damage: Number(action.p1Damage),
                p1StaminaLost: Number(action.p1StaminaLost),
                p2Result: p2ResultEnum,
                p2Damage: Number(action.p2Damage),
                p2StaminaLost: Number(action.p2StaminaLost)
            };
        });

        const result = {
            winner: decodedCombat[0] ? player1Id : player2Id,
            condition: getEnumKeyByValue(WinCondition, Number(decodedCombat[2])), // condition is at index 2 now
            actions: mappedActions,
            gameEngineVersion: Number(decodedCombat[1]) // Add game engine version from index 1
        };
        
        // Verify the result has the expected structure
        if (!result.actions || result.actions.length === 0) {
            throw new Error('No actions in processed result');
        }

        return result;

    } catch (error) {
        console.error('Error loading combat bytes:', error);
        throw error;
    }
}

export async function loadDuelDataFromTx(txId, network) {
    try {
        const transport = http(`https://${network}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
        const client = createPublicClient({
            transport
        });

        // Get transaction receipt
        const receipt = await client.getTransactionReceipt({hash: txId});

        // Parse the combat result event logs using DuelGameABI
        const parsedLogs = parseEventLogs({
            abi: DuelGameABI,
            eventName: 'CombatResult',
            logs: receipt.logs
        });

        if (!parsedLogs || parsedLogs.length === 0) {
            throw new Error('Combat result log not found');
        }

        const combatLog = parsedLogs[0];

        const player1Data = combatLog.args.player1Data;
        const player2Data = combatLog.args.player2Data;
        const winningPlayerId = combatLog.args.winningPlayerId;
        const packedResults = combatLog.args.packedResults;

        // Get player contract to decode player data
        const gameContractAddress = process.env.NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS;
        const playerContractAddress = await client.readContract({
            address: gameContractAddress,
            abi: DuelGameABI,
            functionName: 'playerContract'
        });

        // Decode player data from indexed parameters
        const [player1Id, player1Stats] = await client.readContract({
            address: playerContractAddress,
            abi: PlayerABI,
            functionName: 'decodePlayerData',
            args: [player1Data]
        });
        const [player2Id, player2Stats] = await client.readContract({
            address: playerContractAddress,
            abi: PlayerABI,
            functionName: 'decodePlayerData',
            args: [player2Data]
        });

        // Get game engine address
        const gameEngineAddress = await client.readContract({
            address: gameContractAddress,
            abi: DuelGameABI,
            functionName: 'gameEngine'
        });

        // Decode combat bytes
        const decodedCombat = await client.readContract({
            address: gameEngineAddress,
            abi: GameEngineABI,
            functionName: 'decodeCombatLog',
            args: [packedResults]
        });

        // Extract actions array - skip gameEngineVersion which is at index 1
        const actions = decodedCombat[3];
        
        // Map the actions with proper enum conversion
        const mappedActions = actions.map((action, index) => {
            // Convert numeric values to their enum string representations
            const p1ResultEnum = getEnumKeyByValue(CombatResultType, Number(action.p1Result));
            const p2ResultEnum = getEnumKeyByValue(CombatResultType, Number(action.p2Result));
            
            return {
                p1Result: p1ResultEnum,
                p1Damage: Number(action.p1Damage),
                p1StaminaLost: Number(action.p1StaminaLost),
                p2Result: p2ResultEnum,
                p2Damage: Number(action.p2Damage),
                p2StaminaLost: Number(action.p2StaminaLost)
            };
        });

        const result = {
            winner: winningPlayerId,
            condition: getEnumKeyByValue(WinCondition, Number(decodedCombat[2])), // condition is at index 2
            actions: mappedActions,
            player1Id: Number(player1Id),
            player2Id: Number(player2Id),
            player1Stats,
            player2Stats,
            winningPlayerId,
            blockNumber: receipt.blockNumber.toString(), // Add block number from receipt
            gameEngineVersion: Number(decodedCombat[1]) // Add game engine version from index 1
        };

        // Verify the result has the expected structure
        if (!result.actions || result.actions.length === 0) {
            throw new Error('No actions in processed result');
        }

        return result;

    } catch (error) {
        console.error('Error loading duel data:', error);
        throw error;
    }
}