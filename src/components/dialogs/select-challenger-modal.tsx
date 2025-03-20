"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayerSelectionTable } from "@/components/duel/player-selection-table";
import type { Player } from "@/types/player.types";
import { useEffect } from "react";

interface SelectChallengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayer: (player: Player) => void;
  currentPlayerId?: string;
}

export function SelectChallengerModal({
  isOpen,
  onClose,
  onSelectPlayer,
  currentPlayerId,
}: SelectChallengerModalProps) {
  // Handle player selection
  const handleSelectPlayer = (player: Player) => {
    onSelectPlayer(player);
    onClose();
  };

  // Close the modal when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-gradient-to-b from-stone-900 to-stone-950 border-yellow-600/20 max-h-[90vh] my-4 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-500">
            Select a Challenger
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            Browse and select a warrior to challenge to a duel.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto pr-1">
          <PlayerSelectionTable
            onSelectPlayer={handleSelectPlayer}
            currentPlayerId={currentPlayerId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
