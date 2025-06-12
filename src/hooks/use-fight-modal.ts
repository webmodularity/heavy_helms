import { useState, useCallback } from "react";
import type { Fighter } from "@/types/fighter-types";

interface FightData {
  player1?: Fighter;
  txId?: string;
  logIndex?: string;
  title?: string;
}

interface UseFightModalReturn {
  isOpen: boolean;
  fightData: FightData | null;
  openFightModal: (data: FightData) => void;
  closeFightModal: () => void;
}

export function useFightModal(): UseFightModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [fightData, setFightData] = useState<FightData | null>(null);

  const openFightModal = useCallback((data: FightData) => {
    console.log("Opening fight modal:", data);
    setFightData(data);
    setIsOpen(true);
  }, []);

  const closeFightModal = useCallback(() => {
    console.log("Closing fight modal");
    setIsOpen(false);
    // Keep fightData for a moment to allow for smooth closing animation
    setTimeout(() => {
      setFightData(null);
    }, 300);
  }, []);

  return {
    isOpen,
    fightData,
    openFightModal,
    closeFightModal,
  };
}

// Utility function to open fight modal from URL parameters
export function createFightDataFromUrl(
  searchParams: URLSearchParams,
): FightData | null {
  const txId = searchParams.get("txId");
  const logIndex = searchParams.get("logIndex");

  if (!txId || !logIndex) {
    return null;
  }

  return {
    txId,
    logIndex,
    title: "Gauntlet Battle",
  };
}
