import {
  DefaultPlayerABI,
  DefaultPlayerSkinNFTABI,
  DuelGameABI,
  ERC721ABI,
  GameEngineABI,
  MonsterABI,
  PlayerABI,
  PlayerNameRegistryABI,
  PracticeGameABI,
  SkinRegistryABI,
} from "../abi";

const abiMap = {
  PlayerABI: PlayerABI,
  PracticeGameABI: PracticeGameABI,
  GameEngineABI: GameEngineABI,
  DefaultPlayerABI: DefaultPlayerABI,
  MonsterABI: MonsterABI,
  DuelGameABI: DuelGameABI,
  SkinRegistryABI: SkinRegistryABI,
  PlayerNameRegistryABI: PlayerNameRegistryABI,
  ERC721ABI: ERC721ABI,
  DefaultPlayerSkinNFTABI: DefaultPlayerSkinNFTABI,
};

export type AbiType = keyof typeof abiMap;

export function getAbiForType(abiType: AbiType) {
  if (!abiMap[abiType]) {
    throw new Error(`ABI type "${abiType}" not found in ABI map`);
  }
  return abiMap[abiType];
}
