import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Player } from "@/types/player.types";
import { Trophy, Loader2, ChevronRight, Info } from "lucide-react";
import { formatEther } from "viem";
import { ParticipantCard } from "./participant-card";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_FIGHTERS_BY_IDS, GET_COMBAT_RESULTS } from "@/lib/gql-queries";
import type { RawFighterData } from "@/types/fighter-types";
import { decodePlayerIdFromPackedData } from "@/lib/utils";
import { SUBGRAPH_URL } from "@/config";
import Link from "next/link";
import type { Fighter } from "@/types/fighter-types";
import { useGlobalFightModal } from "@/hooks/use-global-fight-modal";
import { convertRawFighterToFighter } from "@/lib/player-api";
import { getFantasyGauntletName } from "@/lib/gauntlet-naming";
import type { GauntletChronicle } from "@/hooks/use-recent-gauntlets";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@/components/ui/tooltip";

interface FightersQueryResponse {
  fighters: RawFighterData[];
}

interface CombatResultEntity {
  id: string;
  transactionHash: string;
  logIndex: number;
  player1Data: string;
  player2Data: string;
  winningPlayerId: string;
  blockNumber: string;
  blockTimestamp: string;
}

interface CombatResultsQueryResponse {
  combatResults: CombatResultEntity[];
}

const formatDate = (timestamp: string) => {
  if (!timestamp || timestamp === "0") return "N/A";
  const date = new Date(Number.parseInt(timestamp, 10) * 1000);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

interface GauntletAccordionItemProps {
  gauntlet: GauntletChronicle;
  selectedCharacter: Player | null;
  itemValue: string;
  isExpanded: boolean;
  activeFightKey?: string;
  onFightClick?: (fightKey: string) => void;
}

export function GauntletAccordionItem({
  gauntlet,
  selectedCharacter,
  itemValue,
  isExpanded,
  activeFightKey,
  onFightClick,
}: GauntletAccordionItemProps) {
  const { openFightModal } = useGlobalFightModal();
  const { data: participants, isLoading: isLoadingParticipants } = useQuery<
    Fighter[]
  >({
    queryKey: ["gauntletParticipantsDetails", gauntlet.id],
    queryFn: async () => {
      if (
        !gauntlet.finalParticipantIds ||
        gauntlet.finalParticipantIds.length === 0
      ) {
        return [];
      }
      const response = await request<FightersQueryResponse>(
        SUBGRAPH_URL,
        GET_FIGHTERS_BY_IDS,
        {
          fighterIds: gauntlet.finalParticipantIds,
        },
      );
      if (!response.fighters) return [];
      return Promise.all(response.fighters.map(convertRawFighterToFighter));
    },
    enabled:
      isExpanded &&
      !!gauntlet.finalParticipantIds &&
      gauntlet.finalParticipantIds.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { data: combatResults, isLoading: isLoadingCombatResults } = useQuery<
    CombatResultEntity[]
  >({
    queryKey: ["gauntletCombatResults", gauntlet.id, gauntlet.completedTx],
    queryFn: async () => {
      if (!gauntlet.completedTx) {
        return [];
      }
      try {
        const response = await request<CombatResultsQueryResponse>(
          SUBGRAPH_URL,
          GET_COMBAT_RESULTS,
          {
            txHash: gauntlet.completedTx,
          },
        );
        if (!response || !response.combatResults) {
          return [];
        }
        return response.combatResults;
      } catch (error) {
        console.error("Failed to fetch combat results:", error);
        return [];
      }
    },
    enabled: gauntlet.isCompleted && !!gauntlet.completedTx && isExpanded,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const displayGauntletName = getFantasyGauntletName(
    gauntlet.gauntletNumericId,
  );

  const renderRoundsAndFights = () => {
    if (!gauntlet.isCompleted) {
      return (
        <p className="text-xs text-stone-400">
          Fight details will appear once the gauntlet is completed.
        </p>
      );
    }

    if (!isExpanded || isLoadingParticipants || isLoadingCombatResults) {
      if (isExpanded && isLoadingCombatResults) {
        return (
          <div className="flex items-center justify-center text-xs text-stone-400 py-2">
            <Loader2 className="h-4 w-4 mr-2 animate-spin text-yellow-500" />
            Loading fight details...
          </div>
        );
      }
    }

    if (
      !participants ||
      participants.length === 0 ||
      !combatResults ||
      combatResults.length === 0
    ) {
      if (isExpanded) {
        return (
          <p className="text-xs text-stone-400">
            Fight details are not yet available or no fights recorded.
          </p>
        );
      }
      return null;
    }

    const numRounds = Math.log2(gauntlet.size);
    let fightCounter = 0;
    const roundsJsx = [];

    if (
      combatResults &&
      combatResults.length > 0 &&
      participants &&
      participants.length > 0
    ) {
      for (let i = 0; i < numRounds; i++) {
        const roundNum = i + 1;
        const fightsInThisRound = gauntlet.size / 2 ** roundNum;
        const roundFightsJsx = [];

        for (let j = 0; j < fightsInThisRound; j++) {
          if (fightCounter >= combatResults.length) {
            break;
          }
          const fight = combatResults[fightCounter];

          const p1IdNum = decodePlayerIdFromPackedData(fight.player1Data);
          const p2IdNum = decodePlayerIdFromPackedData(fight.player2Data);

          const winnerIdFromCombat = fight.winningPlayerId;

          const p1IdStr = p1IdNum?.toString();
          const p2IdStr = p2IdNum?.toString();

          const player1 = p1IdStr
            ? participants.find((p) => p.fighterId?.toString() === p1IdStr)
            : undefined;
          const player2 = p2IdStr
            ? participants.find((p) => p.fighterId?.toString() === p2IdStr)
            : undefined;
          const winner = winnerIdFromCombat
            ? participants.find(
                (p) => p.fighterId?.toString() === winnerIdFromCombat,
              )
            : undefined;

          let fightDescription: React.ReactNode;
          if (player1 && player2 && winner) {
            const loser =
              winner.fighterId?.toString() === player1.fighterId?.toString()
                ? player2
                : player1;

            let bestAttemptWinnerName: string | undefined;
            if (winner.name?.fullName && winner.name.fullName.trim() !== "") {
              bestAttemptWinnerName = winner.name.fullName.trim();
            } else if (winner.fullName && winner.fullName.trim() !== "") {
              bestAttemptWinnerName = winner.fullName.trim();
            }
            const winnerName: string =
              bestAttemptWinnerName ||
              `Fighter ${winner.fighterId?.toString() || winner.id}`;

            let bestAttemptLoserName: string | undefined;
            if (loser.name?.fullName && loser.name.fullName.trim() !== "") {
              bestAttemptLoserName = loser.name.fullName.trim();
            } else if (loser.fullName && loser.fullName.trim() !== "") {
              bestAttemptLoserName = loser.fullName.trim();
            }
            const loserName: string =
              bestAttemptLoserName ||
              `Fighter ${loser.fighterId?.toString() || loser.id}`;

            const championHighlightClass = "font-semibold text-yellow-400";
            const selectedPlayerTextHighlightClass =
              "font-semibold text-stone-100";

            const winnerIsOverallChampion = gauntlet.champion?.fighterId
              ? gauntlet.champion.fighterId.toString() ===
                winner.fighterId?.toString()
              : false;
            const loserIsOverallChampion = gauntlet.champion?.fighterId
              ? gauntlet.champion.fighterId.toString() ===
                loser.fighterId?.toString()
              : false;

            const winnerIsSelected = selectedCharacter?.id === winner.id;
            const loserIsSelected = selectedCharacter?.id === loser.id;

            const winnerNameToDisplay = (
              <span
                className={
                  winnerIsOverallChampion
                    ? championHighlightClass
                    : winnerIsSelected
                      ? selectedPlayerTextHighlightClass
                      : ""
                }
              >
                {winnerName}
              </span>
            );

            const loserNameToDisplay = (
              <span
                className={
                  loserIsOverallChampion
                    ? championHighlightClass
                    : loserIsSelected
                      ? selectedPlayerTextHighlightClass
                      : ""
                }
              >
                {loserName}
              </span>
            );

            fightDescription = (
              <>
                {winnerNameToDisplay} defeated {loserNameToDisplay}
              </>
            );
          } else {
            fightDescription = `Fight ${fightCounter + 1}: Details incomplete.`;
          }

          if (gauntlet.completedTx) {
            // Double-check that we're not creating a button for an out-of-bounds fight
            if (fightCounter >= combatResults.length) {
              console.error(
                `ERROR: Attempting to create button for out-of-bounds fight! fightCounter=${fightCounter}, combatResults.length=${combatResults.length}`,
              );
              break;
            }

            // Capture the current fightCounter value to avoid closure issues
            const currentFightIndex = fightCounter;
            const currentFightTitle = `Gauntlet Fight ${fightCounter + 1}`;
            const fightKey = `${gauntlet.id}-${currentFightIndex}`;
            const isActiveFight = activeFightKey === fightKey;

            roundFightsJsx.push(
              <button
                key={fight.id || fightCounter}
                type="button"
                className="block w-full text-left"
                onClick={() => {
                  onFightClick?.(fightKey);
                  openFightModal({
                    txId: gauntlet.completedTx || undefined,
                    logIndex: currentFightIndex.toString(),
                    title: currentFightTitle,
                  });
                }}
                onMouseEnter={() => onFightClick?.("")} // Clear active state on hover
              >
                <div
                  className={`p-3 rounded-md mb-2 flex justify-between items-center group transition-colors duration-150 ease-in-out cursor-pointer ${
                    isActiveFight
                      ? "bg-yellow-600/20 border border-yellow-500/40"
                      : "bg-stone-700/40 hover:bg-stone-600/60"
                  }`}
                >
                  <span className="text-sm text-stone-300 group-hover:text-stone-100 transition-colors duration-150 ease-in-out">
                    {fightDescription}
                  </span>
                  <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-stone-200 group-hover:translate-x-0.5 transition-all duration-150 ease-in-out" />
                </div>
              </button>,
            );
          }

          fightCounter++;
        }

        if (roundFightsJsx.length > 0) {
          roundsJsx.push(
            <div key={`round-${roundNum}`} className="mb-3">
              <h5 className="text-sm font-semibold text-stone-300 mb-1.5">
                Round {roundNum}
              </h5>
              {roundFightsJsx}
            </div>,
          );
        }
      }
    }

    return roundsJsx.length > 0 ? (
      <div>{roundsJsx}</div>
    ) : isExpanded ? (
      <p className="text-xs text-stone-400">
        No fight details to display for this gauntlet.
      </p>
    ) : null;
  };

  const gauntletChampionFighterIdString =
    gauntlet.champion?.fighterId?.toString() ?? null;

  const scFighterId = selectedCharacter?.fighterId;

  let isSelectedPlayerTheChampion = false;
  if (gauntletChampionFighterIdString !== null && scFighterId != null) {
    try {
      isSelectedPlayerTheChampion =
        gauntletChampionFighterIdString === scFighterId.toString();
    } catch (error) {
      isSelectedPlayerTheChampion = false;
    }
  }

  return (
    <AccordionItem
      value={itemValue}
      className="bg-stone-800/30 border border-stone-700/50 rounded-md px-0"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-stone-700/30 rounded-t-md data-[state=open]:rounded-b-none data-[state=open]:border-b data-[state=open]:border-stone-700/50">
        <div className="flex items-start gap-3 w-full">
          <div className="flex flex-col items-center mr-2 pt-1">
            <Trophy
              className={`h-7 w-7 ${
                isSelectedPlayerTheChampion
                  ? "text-yellow-400"
                  : "text-stone-500"
              }`}
            />
            <span className="text-lg font-bold text-stone-300 mt-1">
              {gauntlet.size}
            </span>
          </div>
          <div className="text-left">
            <div className="flex items-center">
              <span className="font-semibold text-lg text-stone-300">
                {displayGauntletName}
              </span>
              {gauntlet.isPublic && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTriggerPrimitive asChild>
                      <Info className="h-3.5 w-3.5 text-blue-400 ml-2" />
                    </TooltipTriggerPrimitive>
                    <TooltipContent
                      side="top"
                      className="bg-stone-800 text-stone-200 border-stone-700"
                    >
                      <p>This is a public gauntlet.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {gauntlet.isCompleted && gauntlet.champion?.fullName && (
              <p className="text-sm text-yellow-500 mt-0.5">
                Champion: {gauntlet.champion.fullName}
              </p>
            )}
            <p className="text-xs text-stone-400 mt-0.5">
              {gauntlet.isCompleted ? "Completed" : "Started"}:{" "}
              {formatDate(gauntlet.displayTimestamp)}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-3 text-sm text-stone-300 border-t border-stone-700/50 space-y-3">
        <div>
          <h4 className="font-semibold text-stone-200 mb-2">
            Participants (
            {participants?.length || gauntlet.finalParticipantIds?.length || 0}
            ):
          </h4>
          {isExpanded && isLoadingParticipants ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
            </div>
          ) : participants && participants.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {participants.map((fighter) => (
                <ParticipantCard
                  key={fighter.id}
                  fighter={fighter}
                  isChampion={
                    !!gauntletChampionFighterIdString &&
                    gauntletChampionFighterIdString ===
                      fighter.fighterId?.toString()
                  }
                  isSelectedCharacter={selectedCharacter?.id === fighter.id}
                />
              ))}
            </div>
          ) : isExpanded ? (
            <p className="text-xs text-stone-400">
              Participant details not available.
            </p>
          ) : null}
        </div>

        <div className="mt-4">{renderRoundsAndFights()}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
