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
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-2xl font-semibold text-yellow-500 mb-6 flex items-center">
        <Shield className="mr-2 h-5 w-5" />
        Equipment
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EquipmentCard
          title="Weapon"
          value={getWeaponDisplayName(character.currentSkin.weapon)}
          icon={<Swords className="h-5 w-5" />}
        />

        <EquipmentCard
          title="Armor"
          value={getArmorDisplayName(character.currentSkin.armor)}
          icon={<Shield className="h-5 w-5" />}
        />

        <EquipmentCard
          title="Fighting Style"
          value={getStanceDisplayName(character.stance)}
          icon={<Flame className="h-5 w-5" />}
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

function EquipmentCard({ title, value, icon }: EquipmentCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden group hover:border-yellow-600/30 transition-all duration-300"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/5 to-yellow-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <h4 className="font-medium text-yellow-400 mb-2 flex items-center group-hover:text-yellow-300 transition-colors duration-300">
        <span className="mr-2 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300">
          {icon}
        </span>
        {title}
      </h4>
      <p className="text-stone-200 group-hover:text-white transition-colors duration-300 relative z-10">
        {value}
      </p>
    </motion.div>
  );
}
