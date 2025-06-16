"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

interface BattlePromptSectionProps {
  selectedCharacter: any;
  battleSectionRef: React.RefObject<HTMLElement>;
}

export function BattlePromptSection({
  selectedCharacter,
  battleSectionRef,
}: BattlePromptSectionProps) {
  return (
    <section ref={battleSectionRef} className="mb-6 scroll-mt-4 mt-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
          Choose Your Battle
        </h2>
        <div className="text-yellow-400/90 text-xs font-medium mb-3">
          GLORY AWAITS
        </div>
        
        {selectedCharacter && (
          <motion.div
            className="flex items-center justify-center gap-2 text-stone-400 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span>Use magical portals</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <ArrowDown className="h-4 w-4 rotate-45" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
} 