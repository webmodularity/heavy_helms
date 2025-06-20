"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, User, ArrowLeft } from "lucide-react";
import Image from "next/image";
import type { Player } from "@/types/player.types";
import type { Fighter } from "@/types/fighter-types";
import { BattleModal, BATTLE_THEMES } from "@/components/shared/battle-modal";
import { useCreateChallenge } from "@/hooks/use-create-challenge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedPlayerSelection } from "@/components/duel/enhanced-player-selection";

interface DuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: Player | null;
  onSuccess?: () => void;
}

type ModalView = "form" | "playerSelection";

export function DuelModal({
  isOpen,
  onClose,
  selectedCharacter,
  onSuccess,
}: DuelModalProps) {
  // Form state management
  const [defenderId, setDefenderId] = useState<string>("");
  const [wagerAmount, setWagerAmount] = useState<string>("0");
  const [selectedChallenger, setSelectedChallenger] = useState<Fighter | null>(null);
  const [currentView, setCurrentView] = useState<ModalView>("form");

  const { createChallenge, isCreatingChallenge, error } = useCreateChallenge();

  // Validation
  const isValidDefenderId = defenderId.trim() !== "" && !Number.isNaN(Number(defenderId));

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter || (!isValidDefenderId && !selectedChallenger)) return;

    await createChallenge({
      character: selectedCharacter,
      defenderId: selectedChallenger
        ? Number(selectedChallenger.id)
        : Number.parseInt(defenderId, 10),
      wagerAmount: "0",
    });

    if (!error && onSuccess) {
      onSuccess();
    }
  };

  const handleSelectChallenger = (player: Fighter) => {
    setSelectedChallenger(player);
    setDefenderId(player.id);
    setCurrentView("form"); // Go back to form view after selection
  };

  const handleClose = () => {
    // Reset form state when closing
    setDefenderId("");
    setWagerAmount("0");
    setSelectedChallenger(null);
    setCurrentView("form");
    onClose();
  };

  const handleClearChallenger = () => {
    setSelectedChallenger(null);
    setDefenderId("");
  };

  if (!selectedCharacter) return null;

  const theme = BATTLE_THEMES.duel;

  return (
    <BattleModal
      isOpen={isOpen}
      onClose={handleClose}
      title={currentView === "playerSelection" ? "Select Challenger" : "Create Challenge"}
      theme={theme}
    >
      {currentView === "playerSelection" ? (
        // Player Selection View
        <div className="space-y-4 h-[500px] flex flex-col">
          {/* Back button */}
          <motion.button
            type="button"
            onClick={() => setCurrentView("form")}
            className="flex items-center gap-2 text-sm text-stone-300 hover:text-stone-100 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </motion.button>

          {/* Player Selection Table */}
          <motion.div
            className="flex-1 min-h-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedPlayerSelection
              onSelectPlayer={handleSelectChallenger}
              currentPlayerId={selectedCharacter.id}
            />
          </motion.div>
        </div>
      ) : (
        // Form View
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Challenger Section */}
          <div className="space-y-2">
            <Label htmlFor="defenderId" className="text-stone-200 text-sm font-medium">
              Select Challenger
            </Label>

            {selectedChallenger ? (
              <motion.div
                className="relative flex items-center space-x-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: `${theme.primary}15`,
                  borderColor: `${theme.border}30`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full overflow-hidden bg-stone-800 relative flex-shrink-0">
                  <Image
                    src={selectedChallenger.currentSkin.imageURL}
                    alt={selectedChallenger.name.fullName || ""}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-stone-200 text-sm">
                    {selectedChallenger.name.fullName}
                  </h4>
                  <p className="text-xs text-stone-400">
                    ID: {selectedChallenger.id} • W: {selectedChallenger.record.wins} / L: {selectedChallenger.record.losses}
                  </p>
                  <p className="text-xs text-stone-500">
                    STR: {selectedChallenger.attributes.strength} • AGI: {selectedChallenger.attributes.agility} • STA: {selectedChallenger.attributes.stamina}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <motion.button
                    type="button"
                    onClick={() => setCurrentView("playerSelection")}
                    className="text-xs px-3 py-1 rounded-md border transition-colors"
                    style={{
                      color: theme.border,
                      borderColor: `${theme.border}40`,
                    }}
                    whileHover={{ 
                      backgroundColor: `${theme.primary}20`,
                      scale: 1.02 
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Change
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleClearChallenger}
                    className="text-xs px-3 py-1 rounded-md border border-red-400/40 text-red-400 hover:bg-red-400/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* Manual ID Entry */}
                <div className="relative">
                  <Input
                    id="defenderId"
                    type="number"
                    value={defenderId}
                    onChange={(e) => setDefenderId(e.target.value)}
                    className="pl-9 text-sm border-stone-600/40 bg-stone-900/50 focus:border-opacity-60"
                    style={{
                      borderColor: `${theme.border}40`,
                      backgroundColor: `${theme.secondary}10`,
                    }}
                    placeholder="Enter challenger ID (e.g. 1234)"
                  />
                  <User 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" 
                  />
                </div>

                {/* Or Browse Players Button */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-600/30" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 text-stone-400 bg-stone-900">or</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setCurrentView("playerSelection")}
                  className="w-full py-2 px-4 rounded-lg border transition-colors text-sm font-medium"
                  style={{
                    borderColor: `${theme.border}40`,
                    backgroundColor: `${theme.secondary}10`,
                    color: theme.border,
                  }}
                  whileHover={{ 
                    backgroundColor: `${theme.primary}20`,
                    scale: 1.02 
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse Players
                </motion.button>
              </div>
            )}

            {!isValidDefenderId && defenderId !== "" && !selectedChallenger && (
              <motion.p
                className="text-red-400 text-xs"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Please enter a valid ID or select a challenger
              </motion.p>
            )}
          </div>

          {/* Wager Amount */}
          {/* <div className="space-y-2">
            <Label htmlFor="wagerAmount" className="text-stone-200 text-sm font-medium">
              Wager Amount (ETH)
            </Label>
            <Input
              id="wagerAmount"
              type="number"
              min={0}
              step="0.001"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
              className="text-sm border-stone-600/40 bg-stone-900/50 focus:border-opacity-60"
              style={{
                borderColor: `${theme.border}40`,
                backgroundColor: `${theme.secondary}10`,
              }}
              placeholder="Enter wager amount"
            />
          </div> */}

          {/* Error Display */}
          {error && (
            <motion.div
              className="p-3 rounded-lg border border-red-500/20 bg-red-500/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-400 text-xs">
                {(error instanceof Error ? error.message : "An error occurred").slice(0, 100)}
                {(error instanceof Error ? error.message : "").length > 100 && "..."}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              type="submit"
              disabled={(!isValidDefenderId && !selectedChallenger) || isCreatingChallenge}
              className={`flex-1 py-2 px-4 rounded-lg border font-medium text-sm transition-all duration-200 ${
                (!isValidDefenderId && !selectedChallenger) || isCreatingChallenge
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                borderColor: theme.border,
                color: "white",
                boxShadow: theme.shadow,
              }}
              whileHover={
                (!isValidDefenderId && !selectedChallenger) || isCreatingChallenge
                  ? {}
                  : { scale: 1.02, boxShadow: `0 0 25px ${theme.border}60` }
              }
              whileTap={
                (!isValidDefenderId && !selectedChallenger) || isCreatingChallenge
                  ? {}
                  : { scale: 0.98 }
              }
            >
              {isCreatingChallenge ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Challenge"
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-stone-600/40 text-stone-300 hover:bg-stone-800/50 text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.form>
      )}
    </BattleModal>
  );
} 