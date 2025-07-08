"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect } from "react";
import { ModalGameWrapper } from "../game/modal-game-wrapper";
import type { Fighter } from "@/types/fighter-types";
import { FightLoadingScreen } from "../loading/fight-loading-screen";

interface FightModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1?: Fighter;
  txId?: string;
  logIndex?: string;
  title?: string;
  isLoading?: boolean;
  loadingText?: string;
  challengeId?: bigint;
}

export function FightModal({
  isOpen,
  onClose,
  player1,
  txId,
  logIndex,
  title = "Battle Arena",
  isLoading,
  loadingText,
  challengeId,
}: FightModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Title className="absolute left-[-10000px] top-auto w-[1px] h-[1px] overflow-hidden">
            {title}
          </Dialog.Title>
          <Dialog.Description className="absolute left-[-10000px] top-auto w-[1px] h-[1px] overflow-hidden">
            Interactive battle game modal. Use controls to navigate the game.
          </Dialog.Description>

          {/* Modal Container */}
          <div className="w-full h-full max-w-none bg-stone-950 border border-stone-700 shadow-2xl overflow-hidden">
            {isLoading ? (
              <FightLoadingScreen text={loadingText} />
            ) : (
              <ModalGameWrapper
                player1={player1}
                txId={txId}
                logIndex={logIndex}
                onClose={onClose}
                title={title}
                modalId={`fight-modal-${txId || "default"}`}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
