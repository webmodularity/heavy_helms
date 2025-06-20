"use client";

import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";

export interface BattleTheme {
  primary: string;
  secondary: string;
  gradient: string;
  shadow: string;
  border: string;
  particles: string[];
}

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme: BattleTheme;
}

export function BattleModal({
  isOpen,
  onClose,
  title,
  children,
  theme,
}: BattleModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-md max-h-[85vh] overflow-auto">
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {title} battle modal
          </Dialog.Description>

          <motion.div
            className="bg-gradient-to-b from-stone-900/95 to-stone-950/95 
                       border-2 rounded-lg shadow-2xl backdrop-blur-sm p-6"
            style={{ borderColor: theme.border + "60" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mb-4">
              <h2
                className="text-lg font-bold text-center"
                style={{ color: theme.border }}
              >
                {title}
              </h2>
            </div>
            {children}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Export the theme constants for reuse
export const BATTLE_THEMES = {
  practice: {
    primary: "rgba(34, 197, 94, 0.4)",
    secondary: "rgba(22, 163, 74, 0.3)",
    gradient:
      "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.3) 30%, rgba(21, 128, 61, 0.2) 60%, transparent 80%)",
    shadow: "0 0 20px rgba(34, 197, 94, 0.3)",
    border: "rgb(34, 197, 94)",
    particles: ["#22C55E", "#16A34A"],
  },
  gauntlet: {
    primary: "rgba(147, 51, 234, 0.4)",
    secondary: "rgba(124, 58, 237, 0.3)",
    gradient:
      "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(124, 58, 237, 0.3) 30%, rgba(109, 40, 217, 0.2) 60%, transparent 80%)",
    shadow: "0 0 20px rgba(147, 51, 234, 0.3)",
    border: "rgb(147, 51, 234)",
    particles: ["#9333EA", "#7C3AED"],
  },
  duel: {
    primary: "rgba(239, 68, 68, 0.4)",
    secondary: "rgba(220, 38, 38, 0.3)",
    gradient:
      "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.3) 30%, rgba(185, 28, 28, 0.2) 60%, transparent 80%)",
    shadow: "0 0 20px rgba(239, 68, 68, 0.3)",
    border: "rgb(239, 68, 68)",
    particles: ["#EF4444", "#DC2626"],
  },
} as const; 