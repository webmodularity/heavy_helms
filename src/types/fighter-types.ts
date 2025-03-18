export enum FighterType {
  Player = "Player",
  DefaultPlayer = "DefaultPlayer",
  Monster = "Monster",
}

export interface ContractInfo {
  contractFunction:
    | "playerContract"
    | "monsterContract"
    | "defaultPlayerContract";
  abi: "PlayerABI" | "MonsterABI" | "DefaultPlayerABI";
  method: "getPlayer" | "getMonster" | "getDefaultPlayer";
}
