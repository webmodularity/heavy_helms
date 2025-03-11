export enum FighterType {
  Player = "Player",
  DefaultPlayer = "DefaultPlayer",
  Monster = "Monster",
}

export function getFighterType(playerId: string) {
  const playerIdNum = Number(playerId);

  if (playerIdNum >= 10001) {
    return FighterType.Player;
  }

  if (playerIdNum >= 2001 && playerIdNum <= 10000) {
    return FighterType.Monster;
  }

  if (playerIdNum >= 1 && playerIdNum <= 2000) {
    return FighterType.DefaultPlayer;
  }
  throw new Error(`Invalid player ID range: ${playerId}`);
}

export function getContractInfo(fighterType: FighterType) {
  switch (fighterType) {
    case FighterType.Player:
      return {
        contractFunction: "playerContract",
        abi: "PlayerABI",
        method: "getPlayer",
      };
    case FighterType.Monster:
      return {
        contractFunction: "monsterContract",
        abi: "MonsterABI",
        method: "getMonster",
      };
    case FighterType.DefaultPlayer:
      return {
        contractFunction: "defaultPlayerContract",
        abi: "DefaultPlayerABI",
        method: "getDefaultPlayer",
      };
    default:
      throw new Error(`Invalid fighter type: ${fighterType}`);
  }
}
