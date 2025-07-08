import { Swords, Shield } from "lucide-react";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
} from "@/lib/equipment-utils";

interface SkinEquipmentInfoProps {
  skinData: {
    weapon: number;
    armor: number;
  };
}

export function SkinEquipmentInfo({ skinData }: SkinEquipmentInfoProps) {
  return (
    <div className="w-full text-left p-3 border border-yellow-600/20 rounded-lg bg-stone-900/40 shadow-md flex flex-col items-start h-auto">
      <h4 className="text-sm font-semibold text-yellow-500 mb-2">Equipment</h4>
      <div className="w-full h-px bg-yellow-600/20 mb-2" />
      <div className="space-y-1 w-full">
        <div className="flex items-center text-xs">
          <Swords className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
          <span className="text-stone-300 mr-1">Weapon:</span>
          <span className="text-stone-100 font-medium truncate">
            {getWeaponDisplayName(skinData.weapon)}
          </span>
        </div>
        <div className="flex items-center text-xs">
          <Shield className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
          <span className="text-stone-300 mr-1">Armor:</span>
          <span className="text-stone-100 font-medium truncate">
            {getArmorDisplayName(skinData.armor)}
          </span>
        </div>
      </div>
    </div>
  );
}
