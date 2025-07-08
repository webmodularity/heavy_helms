import type { Fighter } from "@/types/fighter-types";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
  getStanceDisplayName,
} from "@/lib/equipment-utils";
import type {
  WeaponType,
  ArmorType,
  StanceType,
} from "@/types/equipment.types";

interface FighterInfoDisplayProps {
  player1?: Fighter;
  player2?: Fighter;
}

export function FighterInfoDisplay({
  player1,
  player2,
}: FighterInfoDisplayProps) {
  if (!player1 && !player2) return null;

  return (
    <div className="bg-stone-800 border-t-2 border-yellow-600/30 p-4 relative z-10 min-h-[120px]">
      {/* Debug info */}
      {!player1 && !player2 && (
        <div className="text-center text-red-400">No player data available</div>
      )}

      <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
        {/* Player 1 Info */}
        {player1 && (
          <div className="text-left">
            <h3 className="text-base font-bold text-yellow-400 mb-2 truncate">
              {player1.name.fullName}
            </h3>
            <div className="space-y-1 text-sm text-stone-200">
              <div className="flex justify-between">
                <span>Weapon:</span>
                <span className="text-yellow-300">
                  {getWeaponDisplayName(
                    player1.currentSkin.weapon as WeaponType,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Armor:</span>
                <span className="text-yellow-300">
                  {getArmorDisplayName(player1.currentSkin.armor as ArmorType)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Stance:</span>
                <span className="text-yellow-300">
                  {getStanceDisplayName(player1.stance as StanceType)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Record:</span>
                <span className="text-green-400">
                  {player1.record.wins || 0}-{player1.record.losses || 0}-
                  {player1.record.kills || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Player 2 Info */}
        {player2 && (
          <div className="text-right">
            <h3 className="text-base font-bold text-yellow-400 mb-2 truncate">
              {player2.name.fullName}
            </h3>
            <div className="space-y-1 text-sm text-stone-200">
              <div className="flex justify-between">
                <span className="text-yellow-300">
                  {getWeaponDisplayName(
                    player2.currentSkin.weapon as WeaponType,
                  )}
                </span>
                <span>:Weapon</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-300">
                  {getArmorDisplayName(player2.currentSkin.armor as ArmorType)}
                </span>
                <span>:Armor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-300">
                  {getStanceDisplayName(player2.stance as StanceType)}
                </span>
                <span>:Stance</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">
                  {player2.record.wins || 0}-{player2.record.losses || 0}-
                  {player2.record.kills || 0}
                </span>
                <span>:Record</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
