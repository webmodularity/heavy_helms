export const MonsterABI = [{"type":"constructor","inputs":[{"name":"skinRegistryAddress","type":"address","internalType":"address"},{"name":"nameRegistryAddress","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},{"type":"function","name":"convertToFighterStats","inputs":[{"name":"loadout","type":"tuple","internalType":"struct Fighter.PlayerLoadout","components":[{"name":"playerId","type":"uint32","internalType":"uint32"},{"name":"skin","type":"tuple","internalType":"struct Fighter.SkinInfo","components":[{"name":"skinIndex","type":"uint32","internalType":"uint32"},{"name":"skinTokenId","type":"uint16","internalType":"uint16"}]}]}],"outputs":[{"name":"","type":"tuple","internalType":"struct IGameEngine.FighterStats","components":[{"name":"weapon","type":"uint8","internalType":"uint8"},{"name":"armor","type":"uint8","internalType":"uint8"},{"name":"stance","type":"uint8","internalType":"uint8"},{"name":"attributes","type":"tuple","internalType":"struct Fighter.Attributes","components":[{"name":"strength","type":"uint8","internalType":"uint8"},{"name":"constitution","type":"uint8","internalType":"uint8"},{"name":"size","type":"uint8","internalType":"uint8"},{"name":"agility","type":"uint8","internalType":"uint8"},{"name":"stamina","type":"uint8","internalType":"uint8"},{"name":"luck","type":"uint8","internalType":"uint8"}]}]}],"stateMutability":"view"},{"type":"function","name":"createMonster","inputs":[{"name":"stats","type":"tuple","internalType":"struct IMonster.MonsterStats","components":[{"name":"attributes","type":"tuple","internalType":"struct Fighter.Attributes","components":[{"name":"strength","type":"uint8","internalType":"uint8"},{"name":"constitution","type":"uint8","internalType":"uint8"},{"name":"size","type":"uint8","internalType":"uint8"},{"name":"agility","type":"uint8","internalType":"uint8"},{"name":"stamina","type":"uint8","internalType":"uint8"},{"name":"luck","type":"uint8","internalType":"uint8"}]},{"name":"skin","type":"tuple","internalType":"struct Fighter.SkinInfo","components":[{"name":"skinIndex","type":"uint32","internalType":"uint32"},{"name":"skinTokenId","type":"uint16","internalType":"uint16"}]},{"name":"tier","type":"uint8","internalType":"uint8"},{"name":"wins","type":"uint16","internalType":"uint16"},{"name":"losses","type":"uint16","internalType":"uint16"},{"name":"kills","type":"uint16","internalType":"uint16"}]}],"outputs":[{"name":"","type":"uint32","internalType":"uint32"}],"stateMutability":"nonpayable"},{"type":"function","name":"getCurrentSkin","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"tuple","internalType":"struct Fighter.SkinInfo","components":[{"name":"skinIndex","type":"uint32","internalType":"uint32"},{"name":"skinTokenId","type":"uint16","internalType":"uint16"}]}],"stateMutability":"view"},{"type":"function","name":"getFighterStats","inputs":[{"name":"playerId","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"tuple","internalType":"struct IGameEngine.FighterStats","components":[{"name":"weapon","type":"uint8","internalType":"uint8"},{"name":"armor","type":"uint8","internalType":"uint8"},{"name":"stance","type":"uint8","internalType":"uint8"},{"name":"attributes","type":"tuple","internalType":"struct Fighter.Attributes","components":[{"name":"strength","type":"uint8","internalType":"uint8"},{"name":"constitution","type":"uint8","internalType":"uint8"},{"name":"size","type":"uint8","internalType":"uint8"},{"name":"agility","type":"uint8","internalType":"uint8"},{"name":"stamina","type":"uint8","internalType":"uint8"},{"name":"luck","type":"uint8","internalType":"uint8"}]}]}],"stateMutability":"view"},{"type":"function","name":"getMonster","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"tuple","internalType":"struct IMonster.MonsterStats","components":[{"name":"attributes","type":"tuple","internalType":"struct Fighter.Attributes","components":[{"name":"strength","type":"uint8","internalType":"uint8"},{"name":"constitution","type":"uint8","internalType":"uint8"},{"name":"size","type":"uint8","internalType":"uint8"},{"name":"agility","type":"uint8","internalType":"uint8"},{"name":"stamina","type":"uint8","internalType":"uint8"},{"name":"luck","type":"uint8","internalType":"uint8"}]},{"name":"skin","type":"tuple","internalType":"struct Fighter.SkinInfo","components":[{"name":"skinIndex","type":"uint32","internalType":"uint32"},{"name":"skinTokenId","type":"uint16","internalType":"uint16"}]},{"name":"tier","type":"uint8","internalType":"uint8"},{"name":"wins","type":"uint16","internalType":"uint16"},{"name":"losses","type":"uint16","internalType":"uint16"},{"name":"kills","type":"uint16","internalType":"uint16"}]}],"stateMutability":"view"},{"type":"function","name":"incrementKills","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"incrementLosses","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"incrementWins","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"isMonsterImmortal","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"isMonsterRetired","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"isValidId","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"pure"},{"type":"function","name":"nameRegistry","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IMonsterNameRegistry"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"setGameContractPermissions","inputs":[{"name":"gameContract","type":"address","internalType":"address"},{"name":"permissions","type":"tuple","internalType":"struct Monster.GamePermissions","components":[{"name":"record","type":"bool","internalType":"bool"},{"name":"retire","type":"bool","internalType":"bool"},{"name":"immortal","type":"bool","internalType":"bool"}]}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setMonsterImmortal","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"},{"name":"immortal","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setMonsterRetired","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"},{"name":"retired","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"skinRegistry","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IPlayerSkinRegistry"}],"stateMutability":"view"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"updateMonsterStats","inputs":[{"name":"monsterId","type":"uint32","internalType":"uint32"},{"name":"newStats","type":"tuple","internalType":"struct IMonster.MonsterStats","components":[{"name":"attributes","type":"tuple","internalType":"struct Fighter.Attributes","components":[{"name":"strength","type":"uint8","internalType":"uint8"},{"name":"constitution","type":"uint8","internalType":"uint8"},{"name":"size","type":"uint8","internalType":"uint8"},{"name":"agility","type":"uint8","internalType":"uint8"},{"name":"stamina","type":"uint8","internalType":"uint8"},{"name":"luck","type":"uint8","internalType":"uint8"}]},{"name":"skin","type":"tuple","internalType":"struct Fighter.SkinInfo","components":[{"name":"skinIndex","type":"uint32","internalType":"uint32"},{"name":"skinTokenId","type":"uint16","internalType":"uint16"}]},{"name":"tier","type":"uint8","internalType":"uint8"},{"name":"wins","type":"uint16","internalType":"uint16"},{"name":"losses","type":"uint16","internalType":"uint16"},{"name":"kills","type":"uint16","internalType":"uint16"}]}],"outputs":[],"stateMutability":"nonpayable"},{"type":"event","name":"MonsterCreated","inputs":[{"name":"monsterId","type":"uint32","indexed":true,"internalType":"uint32"}],"anonymous":false},{"type":"event","name":"MonsterImmortalStatusUpdated","inputs":[{"name":"monsterId","type":"uint32","indexed":true,"internalType":"uint32"},{"name":"immortal","type":"bool","indexed":false,"internalType":"bool"}],"anonymous":false},{"type":"event","name":"MonsterKillsUpdated","inputs":[{"name":"monsterId","type":"uint32","indexed":true,"internalType":"uint32"},{"name":"kills","type":"uint16","indexed":false,"internalType":"uint16"}],"anonymous":false},{"type":"event","name":"MonsterRetired","inputs":[{"name":"monsterId","type":"uint32","indexed":true,"internalType":"uint32"}],"anonymous":false},{"type":"event","name":"MonsterStatsUpdated","inputs":[{"name":"monsterId","type":"uint32","indexed":true,"internalType":"uint32"},{"name":"stats","type":"tuple","indexed":false,"internalType":"struct IMonster.MonsterStats","components":[{"name":"attributes","type":"tuple","internalType":"struct Fighter.Attributes","components":[{"name":"strength","type":"uint8","internalType":"uint8"},{"name":"constitution","type":"uint8","internalType":"uint8"},{"name":"size","type":"uint8","internalType":"uint8"},{"name":"agility","type":"uint8","internalType":"uint8"},{"name":"stamina","type":"uint8","internalType":"uint8"},{"name":"luck","type":"uint8","internalType":"uint8"}]},{"name":"skin","type":"tuple","internalType":"struct Fighter.SkinInfo","components":[{"name":"skinIndex","type":"uint32","internalType":"uint32"},{"name":"skinTokenId","type":"uint16","internalType":"uint16"}]},{"name":"tier","type":"uint8","internalType":"uint8"},{"name":"wins","type":"uint16","internalType":"uint16"},{"name":"losses","type":"uint16","internalType":"uint16"},{"name":"kills","type":"uint16","internalType":"uint16"}]}],"anonymous":false},{"type":"event","name":"MonsterTierUpdated","inputs":[{"name":"tokenId","type":"uint16","indexed":true,"internalType":"uint16"},{"name":"newTier","type":"uint8","indexed":false,"internalType":"uint8"}],"anonymous":false},{"type":"event","name":"MonsterWinLossUpdated","inputs":[{"name":"monsterId","type":"uint32","indexed":true,"internalType":"uint32"},{"name":"wins","type":"uint16","indexed":false,"internalType":"uint16"},{"name":"losses","type":"uint16","indexed":false,"internalType":"uint16"}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"name":"user","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"error","name":"BadZeroAddress","inputs":[]},{"type":"error","name":"InvalidMonsterRange","inputs":[]},{"type":"error","name":"MonsterDoesNotExist","inputs":[]},{"type":"error","name":"UnauthorizedCaller","inputs":[]}]