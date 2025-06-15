"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Swords, Flame } from "lucide-react";
import { useState } from "react";
import type { Player } from "@/types/player.types";
import { StanceType } from "@/types/equipment.types";
import { motion } from "framer-motion";

interface StanceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Player;
  currentStance: StanceType;
  onStanceChange: (newStance: StanceType) => void;
}

export function StanceSelectionModal({
  isOpen,
  onClose,
  character,
  currentStance,
  onStanceChange,
}: StanceSelectionModalProps) {
  const [selectedStance, setSelectedStance] = useState<StanceType>(currentStance);

  const stanceInfo = {
    [StanceType.Defensive]: {
      icon: <Shield className="h-6 w-6" />,
      label: "Defensive",
      description: "Prioritizes defense and survivability",
      color: "from-emerald-700 to-emerald-500",
      borderColor: "border-emerald-500",
    },
    [StanceType.Balanced]: {
      icon: <Swords className="h-6 w-6" />,
      label: "Balanced",
      description: "Even balance of offense and defense",
      color: "from-blue-700 to-blue-500",
      borderColor: "border-blue-500",
    },
    [StanceType.Offensive]: {
      icon: <Flame className="h-6 w-6" />,
      label: "Offensive",
      description: "Maximizes damage output",
      color: "from-orange-700 to-orange-500",
      borderColor: "border-orange-500",
    },
  };

  const handleConfirm = () => {
    onStanceChange(selectedStance);
  };

  const handleCancel = () => {
    setSelectedStance(currentStance);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-stone-900/95 border-yellow-500/30">
        <DialogHeader>
          <DialogTitle className="text-yellow-500 text-center">
            Select Combat Stance
          </DialogTitle>
          <p className="text-sm text-stone-400 text-center">
            Choose {character.name.fullName}'s fighting style
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {Object.entries(stanceInfo).map(([value, info]) => {
            const stanceValue = Number(value) as StanceType;
            const isSelected = selectedStance === stanceValue;
            const isCurrent = currentStance === stanceValue;
            
            return (
              <motion.button
                key={value}
                onClick={() => setSelectedStance(stanceValue)}
                className={`w-full p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  isSelected 
                    ? `${info.borderColor} bg-gradient-to-r ${info.color} bg-opacity-20` 
                    : "border-stone-700 hover:border-stone-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${isSelected ? 'text-white' : 'text-stone-400'}`}>
                    {info.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                        {info.label}
                      </h3>
                      {isCurrent && (
                        <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isSelected ? 'text-stone-200' : 'text-stone-500'}`}>
                      {info.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-yellow-500 text-black hover:bg-yellow-400"
            disabled={selectedStance === currentStance}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 