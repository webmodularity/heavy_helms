import { 
    PracticeGameABI, 
    GameEngineABI, 
    PlayerABI, 
    DefaultPlayerABI, 
    MonsterABI,
    DuelGameABI,
    SkinRegistryABI,
    PlayerNameRegistryABI,
    ERC721ABI,
    DefaultPlayerSkinNFTABI
} from '../abi';

const abiMap = {
    'PlayerABI': PlayerABI,
    'PracticeGameABI': PracticeGameABI,
    'GameEngineABI': GameEngineABI,
    'DefaultPlayerABI': DefaultPlayerABI,
    'MonsterABI': MonsterABI,
    'DuelGameABI': DuelGameABI,
    'SkinRegistryABI': SkinRegistryABI,
    'PlayerNameRegistryABI': PlayerNameRegistryABI,
    'ERC721ABI': ERC721ABI,
    'DefaultPlayerSkinNFTABI': DefaultPlayerSkinNFTABI
};

export function getAbiForType(abiType) {
    if (!abiMap[abiType]) {
        throw new Error(`ABI type "${abiType}" not found in ABI map`);
    }
    return abiMap[abiType];
} 