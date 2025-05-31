"use client";

import { motion } from "framer-motion";
import { Plus, Sparkles, Zap, User, UserCheck } from "lucide-react";
import { useState } from "react";
import { RetroCard, RetroCardContent, RetroCardHeader, RetroCardTitle } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroSpinner } from "@/components/ui/retro-spinner";
import { cn } from "@/lib/utils";

type NamePreference = 'male' | 'female';

interface RetroNewCharacterCardProps {
  delay: number;
  onClick: (namePreference: NamePreference) => void;
  isCreating: boolean;
  txHash: string | null;
}

export function RetroNewCharacterCard({
  delay,
  onClick,
  isCreating,
  txHash,
}: RetroNewCharacterCardProps) {
  const [selectedNamePreference, setSelectedNamePreference] = useState<NamePreference>('male');

  const handleCardClick = () => {
    if (!isCreating) {
      onClick(selectedNamePreference);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="h-full"
    >
      <RetroCard
        variant="medieval"
        className={cn(
          "h-full cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden",
          "border-dashed border-2",
          isCreating ? "pointer-events-none opacity-70" : "hover:shadow-retro hover:border-medieval-gold"
        )}
        withScanlines={false}
        onClick={handleCardClick}
      >
        {isCreating ? (
          <RetroCardContent className="h-full flex flex-col items-center justify-center space-y-4 text-center p-6">
            {/* Creation Loading State */}
            <div className="relative">
              <RetroSpinner variant="medieval" size="xl" withGlow />
              <motion.div
                className="absolute inset-0 border-2 border-medieval-gold rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="space-y-2">
              <RetroCardTitle variant="medieval" className="text-center">
                {txHash ? "FORGING WARRIOR..." : "AWAITING CONFIRMATION..."}
              </RetroCardTitle>
              
              <div className="font-pixel text-pixel-sm text-medieval-gold/80">
                {txHash ? "Crafting in the ethereal forge" : "Confirm transaction in wallet"}
              </div>
              
              {txHash && (
                <RetroButton
                  variant="medieval"
                  size="sm"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3"
                >
                  <a
                    href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    VIEW TRANSACTION
                  </a>
                </RetroButton>
              )}
            </div>
          </RetroCardContent>
        ) : (
          <>
            <RetroCardHeader variant="medieval">
              <div className="flex justify-center mb-2">
                <motion.div
                  className="p-3 rounded-retro bg-medieval-gold/20 border-2 border-medieval-gold"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 0 20px var(--color-medieval-gold)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-8 w-8 text-medieval-gold" strokeWidth={2} />
                </motion.div>
              </div>
              <RetroCardTitle variant="medieval" className="text-center">
                FORGE NEW WARRIOR
              </RetroCardTitle>
            </RetroCardHeader>

            <RetroCardContent className="space-y-4">
              <div className="text-center font-pixel text-pixel-sm text-medieval-gold/80">
                Summon a new champion from the ethereal realm to join your ranks.
              </div>

              {/* Name Preference Selector */}
              <div 
                className="space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center font-pixel text-pixel-xs text-medieval-gold/60">
                  WARRIOR ESSENCE
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <RetroButton
                    variant={selectedNamePreference === 'male' ? "medieval" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNamePreference('male')}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    glow={selectedNamePreference === 'male' ? "subtle" : "none"}
                  >
                    <User className="h-4 w-4" />
                    <span className="font-pixel text-pixel-xs">MALE</span>
                  </RetroButton>
                  
                  <RetroButton
                    variant={selectedNamePreference === 'female' ? "medieval" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNamePreference('female')}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    glow={selectedNamePreference === 'female' ? "subtle" : "none"}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span className="font-pixel text-pixel-xs">FEMALE</span>
                  </RetroButton>
                </div>
              </div>

              {/* Cost Information */}
              <div className="border-t border-medieval-bronze/30 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-pixel-xs text-medieval-gold/60">
                    FORGING COST:
                  </span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-medieval-gold" />
                    <span className="font-pixel text-pixel-sm text-medieval-gold font-bold">
                      0.002 ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Hint */}
              <div className="text-center">
                <motion.div
                  className="inline-flex items-center gap-2 font-pixel text-pixel-xs text-medieval-gold/40"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="h-3 w-3" />
                  TAP TO BEGIN SUMMONING
                  <Zap className="h-3 w-3" />
                </motion.div>
              </div>
            </RetroCardContent>
          </>
        )}
      </RetroCard>
    </motion.div>
  );
} 