import type { Player } from "@/types/player.types";
import type { ReactNode } from "react";
import { useCharacterSubtitle } from "@/hooks/use-character-subtitle";
import { motion } from "framer-motion";
import { User, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  character: Player;
  subtitleElement?: ReactNode;
  withScanlines?: boolean;
  withCrtEffect?: boolean;
}

export function HeroSection({ 
  character, 
  subtitleElement, 
  withScanlines = false,
  withCrtEffect = false 
}: HeroSectionProps) {
  // Get the correctly formatted subtitle
  const { subtitle } = useCharacterSubtitle(
    character.owner?.address,
    character.id,
  );

  return (
    <motion.div
      className={cn(
        "text-center space-y-1.5 py-3 px-4",
        "bg-card/80 backdrop-blur-sm rounded-retro",
        "border border-primary/30 retro-box-glow",
        withCrtEffect && "crt-container",
        withScanlines && "scanlines"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
    >
      {/* Character Name with Immortal Crown */}
      <div className="flex items-center justify-center gap-1.5">
        {character.isImmortal && (
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Crown className="h-3 w-3 text-warning retro-text-glow" />
          </motion.div>
        )}
        
        <motion.h1 
          className={cn(
            "font-pixel text-pixel-xl text-primary font-bold",
            "pixel-perfect retro-text-glow tracking-wider",
            character.isImmortal && "text-warning"
          )}
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.1em" }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {character.name.fullName || "UNKNOWN WARRIOR"}
        </motion.h1>
        
        {character.isImmortal && (
          <motion.div
            initial={{ rotate: 20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Crown className="h-3 w-3 text-warning retro-text-glow" />
          </motion.div>
        )}
      </div>
      
      {/* Character Subtitle */}
      <motion.div
        className="font-pixel text-pixel-sm text-primary/80 pixel-perfect flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {subtitle}
      </motion.div>

      {/* Immortal Status Badge */}
      {character.isImmortal && (
        <motion.div
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1",
            "font-pixel text-pixel-xs text-warning font-bold uppercase",
            "bg-warning/10 border border-warning/50",
            "rounded-pixel-sm retro-box-glow tracking-widest",
            "pixel-perfect backdrop-blur-xs"
          )}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: 0.4, 
            type: "spring",
            stiffness: 400,
            damping: 20
          }}
        >
          <Zap className="h-2 w-2 pixel-perfect" />
          IMMORTAL STATUS
          <Zap className="h-2 w-2 pixel-perfect" />
        </motion.div>
      )}

      {/* Additional subtitle element if provided */}
      {subtitleElement && (
        <motion.div
          className="font-pixel text-pixel-xs text-muted-foreground pixel-perfect"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {subtitleElement}
        </motion.div>
      )}
    </motion.div>
  );
}
