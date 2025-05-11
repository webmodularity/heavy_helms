import {
  getArmorDisplayName,
  getStanceDisplayName,
  getWeaponDisplayName,
} from "@/lib/equipment-utils";
import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { Flame, Shield, Swords } from "lucide-react";

interface EquipmentSectionProps {
  character: Player;
}

export function EquipmentSection({ character }: EquipmentSectionProps) {
  return (
    <motion.div
      className="mb-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="grid grid-cols-3 gap-2">
        <CompactEquipmentCard
          title="Weapon"
          value={getWeaponDisplayName(character.currentSkin.weapon)}
          icon={<Swords className="h-3 w-3" />}
        />

        <CompactEquipmentCard
          title="Armor"
          value={getArmorDisplayName(character.currentSkin.armor)}
          icon={<Shield className="h-3 w-3" />}
        />

        <CompactEquipmentCard
          title="Fighting Style"
          value={getStanceDisplayName(character.stance)}
          icon={<Flame className="h-3 w-3" />}
        />
      </div>
    </motion.div>
  );
}

// Equipment Card Component
interface EquipmentCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function CompactEquipmentCard({ title, value, icon }: EquipmentCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-2 relative overflow-hidden group hover:border-yellow-600/30 transition-all duration-300"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <h4 className="text-xs font-medium text-yellow-400 mb-1 flex items-center">
        <span className="mr-1 text-yellow-500">{icon}</span>
        {title}
      </h4>
      <p className="text-stone-200 text-xs truncate" title={value}>
        {value}
      </p>
    </motion.div>
  );
}
