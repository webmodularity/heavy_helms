"use client";

import { useGlobalFightModal } from "@/hooks/use-global-fight-modal";
import { FightModal } from "./fight-modal";

export function GlobalFightModal() {
  const { isOpen, fightData, closeFightModal } = useGlobalFightModal();

  return (
    <FightModal
      isOpen={isOpen}
      onClose={closeFightModal}
      player1={fightData?.player1}
      txId={fightData?.txId}
      logIndex={fightData?.logIndex}
      title={fightData?.title}
      backgroundImage={fightData?.backgroundImage}
      isLoading={fightData?.isLoading}
      loadingText={fightData?.loadingText}
      challengeId={fightData?.challengeId}
    />
  );
}
