"use client";

import { useState } from "react";
import { YellowButton } from "@/components/ui/yellow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, Search, User } from "lucide-react";
import type { Player } from "@/types/player.types";
import { useCreateChallenge } from "@/hooks/use-create-challenge";
import { SelectChallengerModal } from "@/components/dialogs/select-challenger-modal";
import Image from "next/image";
import type { Fighter } from "@/types/fighter-types";

interface CreateChallengeFormProps {
  character: Player;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MIN_WAGER_AMOUNT = 0.001;
const MAX_WAGER_AMOUNT = 100;

export function CreateChallengeForm({
  character,
  onSuccess,
  onCancel,
}: CreateChallengeFormProps) {
  const [defenderId, setDefenderId] = useState<string>("");
  const [wagerAmount, setWagerAmount] = useState<string>("0");
  const [selectedChallenger, setSelectedChallenger] = useState<Fighter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { createChallenge, isCreatingChallenge, error } = useCreateChallenge();

  // Validate inputs
  const isValidDefenderId = defenderId.trim() !== "" && !Number.isNaN(Number(defenderId));
  const isValidWager =
    wagerAmount.trim() !== "" &&
    !Number.isNaN(Number.parseFloat(wagerAmount)) &&
    (Number.parseFloat(wagerAmount) === 0 ||
      (Number.parseFloat(wagerAmount) >= MIN_WAGER_AMOUNT &&
        Number.parseFloat(wagerAmount) <= MAX_WAGER_AMOUNT));

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((isValidDefenderId || selectedChallenger) && isValidWager) {
      await createChallenge({
        character,
        defenderId: selectedChallenger
          ? Number(selectedChallenger.id)
          : Number.parseInt(defenderId, 10),
        wagerAmount,
      });

      // If successfully created, call onSuccess
      if (!error && onSuccess) {
        onSuccess();
      }
    }
  };

  // Handle selecting a challenger from the modal
  const handleSelectChallenger = (player: Fighter) => {
    setSelectedChallenger(player);
    setDefenderId(player.id);
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-3 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-sm font-bold text-yellow-400 mb-2">
          Create Challenge
        </h2>

        {/* Defender Selection */}
        <div className="space-y-1">
          <Label htmlFor="defenderId" className="text-stone-300 text-xs">
            Challenger
          </Label>

          {selectedChallenger ? (
            <div className="flex items-center space-x-2 p-1 border border-yellow-600/20 rounded-md bg-stone-900/50">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-stone-800 relative">
                <Image
                  src={selectedChallenger.currentSkin.imageURL}
                  alt={selectedChallenger.name.fullName || ""}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-stone-200 text-xs">
                  {selectedChallenger.name.fullName}
                </h4>
                <p className="text-[10px] text-stone-400">
                  ID: {selectedChallenger.id} • W: {selectedChallenger.record.wins} / L: {selectedChallenger.record.losses}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] text-yellow-500 border border-yellow-600/20 px-2 py-0.5 rounded hover:bg-yellow-500/10"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-1">
              <div className="relative col-span-4">
                <Input
                  id="defenderId"
                  type="number"
                  value={defenderId}
                  onChange={(e) => setDefenderId(e.target.value)}
                  className="bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200 pl-8 h-8 text-xs"
                  placeholder="Enter defender ID"
                />
                <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-stone-400" />
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="col-span-1 h-8 bg-stone-900/50 border border-yellow-600/20 rounded flex items-center justify-center text-yellow-500 hover:bg-yellow-500/10"
              >
                <Search className="h-3 w-3" />
              </button>
            </div>
          )}

          {!isValidDefenderId && defenderId !== "" && !selectedChallenger && (
            <p className="text-red-400 text-[10px]">
              Please enter a valid ID or select a challenger
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="wagerAmount" className="text-stone-300 text-xs">
            Wager Amount (ETH)
          </Label>
          <Input
            id="wagerAmount"
            type="number"
            min={0}
            max={MAX_WAGER_AMOUNT}
            step="0.001"
            value={wagerAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setWagerAmount("");
                return;
              }

              const numericValue = Number.parseFloat(value);
              if (
                !Number.isNaN(numericValue) &&
                (numericValue === 0 ||
                  (numericValue >= MIN_WAGER_AMOUNT &&
                    numericValue <= MAX_WAGER_AMOUNT))
              ) {
                setWagerAmount(value);
              }
            }}
            onBlur={() => {
              if (
                wagerAmount === "" ||
                Number.isNaN(Number.parseFloat(wagerAmount))
              ) {
                setWagerAmount(MIN_WAGER_AMOUNT.toString());
              }
            }}
            className="bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200 h-8 text-xs"
            placeholder="Enter wager amount"
          />
          {!isValidWager && wagerAmount !== "" && (
            <p className="text-red-400 text-[10px]">
              Please enter a valid wager amount
            </p>
          )}
        </div>

        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-[10px]">
            {(error instanceof Error
              ? error.message
              : "An error occurred"
            ).slice(0, 60)}
            ...
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={
              (!isValidDefenderId && !selectedChallenger) ||
              !isValidWager ||
              isCreatingChallenge
            }
            className={`w-full py-1 px-2 bg-gradient-to-b from-amber-700/40 to-stone-900/80 rounded border border-yellow-600/30 text-yellow-400/90 text-xs font-medium ${
              (!isValidDefenderId && !selectedChallenger) ||
              !isValidWager ||
              isCreatingChallenge
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isCreatingChallenge ? (
              <>
                <Loader2 className="inline-block mr-1 h-3 w-3 animate-spin" /> Creating...
              </>
            ) : (
              "Create Challenge"
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-1 px-2 border border-yellow-600/20 rounded text-yellow-500 hover:bg-yellow-500/10 text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.form>

      {/* Challenger Selection Modal */}
      <SelectChallengerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPlayer={handleSelectChallenger}
        currentPlayerId={character.id}
      />
    </>
  );
}
