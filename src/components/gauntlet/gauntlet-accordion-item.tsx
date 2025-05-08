import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { GauntletChronicle } from "@/hooks/use-recent-gauntlets";
import type { Player } from "@/types/player.types";
import { Trophy, Loader2, ChevronRight } from "lucide-react";
import { formatEther } from "viem";
import { ParticipantCard } from "./participant-card";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_FIGHTERS_BY_IDS, GET_COMBAT_RESULTS } from "@/lib/gql-queries";
import type { RawFighterData } from "@/types/fighter-types";
import type { Skin } from "@/types/skin.types";
import { SkinType } from "@/types/skin.types";
import type { PlayerGauntletStatus } from "@/types/player.types";
import type { WeaponType, ArmorType } from "@/types/equipment.types";
import { createPlayerSkin } from "@/lib/player-api";
import { decodePlayerIdFromPackedData } from "@/lib/utils";
import { SUBGRAPH_URL, DEFAULT_CHARACTER_IMAGE } from "@/config";
import Link from "next/link";
import type {
  Fighter,
  FighterType,
  FighterAttributes,
  FighterName,
  FighterRecord,
} from "@/types/fighter-types";

interface GauntletAccordionItemProps {
  gauntlet: GauntletChronicle;
  selectedCharacter: Player | null;
  itemValue: string;
  isExpanded: boolean;
}

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
  return date.toLocaleDateString();
};

function createDefaultSkin(): Skin {
  return {
    collection: {
      id: "",
      contractAddress: "",
      isVerified: false,
      skinType: SkinType.Player,
      requiredNFTAddress: undefined,
    },
    tokenId: 0,
    metadataURL: "",
    imageURL: DEFAULT_CHARACTER_IMAGE,
    spritesheet: {
      image: "",
      fps: {
        idle: 10,
        walking: 10,
        running: 10,
        attacking: 10,
        blocking: 10,
        dying: 10,
        hurt: 10,
        dodging: 10,
        taunting: 10,
      },
      format: "RGBA8888",
      size: { w: 0, h: 0 },
      scale: 1,
      frames: [],
    },
    weapon: 0 as WeaponType,
    armor: 0 as ArmorType,
  };
}

async function mapRawFighterToDomainFighter(
  rawFighter: RawFighterData,
): Promise<Fighter> {
  let finalSkin: Skin;
  if (rawFighter.currentSkin) {
    try {
      const skinAttempt = await createPlayerSkin(rawFighter.currentSkin);
      if (skinAttempt) {
        finalSkin = skinAttempt;
      } else {
        console.warn(
          `createPlayerSkin returned null for fighter ${rawFighter.id}, using default.`,
        );
        finalSkin = createDefaultSkin();
      }
    } catch (error) {
      console.error(
        `Error processing skin via createPlayerSkin for fighter ${rawFighter.id}:`,
        error,
      );
      finalSkin = createDefaultSkin();
    }
  } else {
    finalSkin = createDefaultSkin();
  }

  const fighterName: FighterName = {
    fullName:
      rawFighter.fullName ||
      `${rawFighter.firstName || ""} ${rawFighter.surname || ""}`.trim() ||
      `Fighter ${rawFighter.fighterId}`,
  };

  const fighterAttributes: FighterAttributes = {
    strength: rawFighter.strength,
    constitution: rawFighter.constitution,
    size: rawFighter.size,
    agility: rawFighter.agility,
    stamina: rawFighter.stamina,
    luck: rawFighter.luck,
  };

  const fighterRecord: FighterRecord = {
    wins: rawFighter.wins,
    losses: rawFighter.losses,
    kills: rawFighter.kills,
  };

  return {
    id: rawFighter.id,
    fighterId: rawFighter.fighterId ? BigInt(rawFighter.fighterId) : undefined,
    fighterType: rawFighter.fighterType as FighterType,
    name: fighterName,
    fullName: fighterName.fullName,
    attributes: fighterAttributes,
    currentSkin: finalSkin,
    stance: rawFighter.stance,
    record: fighterRecord,
    isRetired: rawFighter.isRetired,
    isImmortal: rawFighter.isImmortal ?? false,
    owner: rawFighter.owner ? { address: rawFighter.owner.address } : undefined,
    battleRating: rawFighter.battleRating,
    gauntletStatus: rawFighter.gauntletStatus as PlayerGauntletStatus,
  };
}

export function GauntletAccordionItem({
  gauntlet,
  selectedCharacter,
  itemValue,
  isExpanded,
}: GauntletAccordionItemProps) {
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
      return Promise.all(response.fighters.map(mapRawFighterToDomainFighter));
    },
    enabled:
      !!gauntlet.finalParticipantIds && gauntlet.finalParticipantIds.length > 0,
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
        return [];
      }
    },
    enabled: gauntlet.isCompleted && !!gauntlet.completedTx && isExpanded,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const renderRoundsAndFights = () => {
    if (!gauntlet.isCompleted) {
      return (
        <p className="text-xs text-stone-400">
          Fight details will appear once the gauntlet is completed.
        </p>
      );
    }

    if (isLoadingParticipants || isLoadingCombatResults) {
      const numRoundsSkel = Math.max(1, Math.log2(gauntlet.size));
      const totalFightsSkel = Math.max(1, gauntlet.size - 1);
      const skeletonRoundsArr = [];
      let fightsRenderedForSkel = 0;

      for (let i = 0; i < numRoundsSkel; i++) {
        if (fightsRenderedForSkel >= totalFightsSkel && numRoundsSkel > 1)
          break;

        const roundNumSkel = i + 1;
        const fightsInThisRoundSkel =
          numRoundsSkel === 1
            ? totalFightsSkel
            : Math.max(1, gauntlet.size / 2 ** roundNumSkel);
        const skeletonFightsArr = [];

        for (let j = 0; j < fightsInThisRoundSkel; j++) {
          if (fightsRenderedForSkel >= totalFightsSkel) break;
          skeletonFightsArr.push(
            <div
              key={`skeleton-fight-${i}-${j}`}
              className="bg-stone-700/30 p-3 rounded-md mb-2 animate-pulse"
            >
              <div className="h-4 bg-stone-600/50 rounded w-3/4" />
            </div>,
          );
          fightsRenderedForSkel++;
        }

        if (skeletonFightsArr.length > 0) {
          skeletonRoundsArr.push(
            <div key={`skeleton-round-${roundNumSkel}`} className="mb-3">
              <div className="h-5 bg-stone-600/50 rounded w-1/4 mb-1.5 animate-pulse" />
              {skeletonFightsArr}
            </div>,
          );
        }
      }

      if (skeletonRoundsArr.length === 0 && totalFightsSkel > 0) {
        skeletonRoundsArr.push(
          <div
            key="skeleton-fallback-fight"
            className="bg-stone-700/30 p-3 rounded-md mb-2 animate-pulse"
          >
            <div className="h-4 bg-stone-600/50 rounded w-3/4" />
          </div>,
        );
      }

      return skeletonRoundsArr.length > 0 ? (
        <div className="py-2">{skeletonRoundsArr}</div>
      ) : (
        <div className="flex items-center justify-center text-xs text-stone-400 py-2">
          <Loader2 className="h-4 w-4 mr-2 animate-spin text-yellow-500" />
          Loading fight details...
        </div>
      );
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
          if (fightCounter >= combatResults.length) break;
          const fight = combatResults[fightCounter];
          const p1Id = decodePlayerIdFromPackedData(fight.player1Data);
          const p2Id = decodePlayerIdFromPackedData(fight.player2Data);
          const winnerIdBigInt = BigInt(fight.winningPlayerId);

          const player1 = participants.find(
            (p) => p.fighterId === BigInt(p1Id || 0),
          );
          const player2 = participants.find(
            (p) => p.fighterId === BigInt(p2Id || 0),
          );
          const winner = participants.find(
            (p) => p.fighterId === winnerIdBigInt,
          );

          let fightDescription: React.ReactNode;
          if (player1 && player2 && winner) {
            const loser =
              winnerIdBigInt === player1.fighterId ? player2 : player1;
            const winnerName = winner.fullName || `Fighter ${winner.fighterId}`;
            const loserName = loser.fullName || `Fighter ${loser.fighterId}`;

            const championHighlightClass = "font-semibold text-yellow-400";
            const selectedPlayerTextHighlightClass =
              "font-semibold text-stone-100";

            const winnerIsOverallChampion = gauntlet.champion?.fighterId
              ? BigInt(gauntlet.champion.fighterId) === winner.fighterId
              : false;
            const loserIsOverallChampion = gauntlet.champion?.fighterId
              ? BigInt(gauntlet.champion.fighterId) === loser.fighterId
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

          roundFightsJsx.push(
            <Link
              key={fight.id || fightCounter}
              href={`/gauntlet?txId=${gauntlet.completedTx}&logIndex=${fightCounter}`}
              className="block"
            >
              <div className="bg-stone-700/40 p-3 rounded-md mb-2 flex justify-between items-center group hover:bg-stone-600/60 transition-colors duration-150 ease-in-out cursor-pointer">
                <span className="text-sm text-stone-300 group-hover:text-stone-100 transition-colors duration-150 ease-in-out">
                  {fightDescription}
                </span>
                <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-stone-200 group-hover:translate-x-0.5 transition-all duration-150 ease-in-out" />
              </div>
            </Link>,
          );
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

  const gauntletChampionFighterId = gauntlet.champion?.fighterId
    ? BigInt(gauntlet.champion.fighterId)
    : null;

  const scFighterId = selectedCharacter?.fighterId;

  let isSelectedPlayerTheChampion = false;
  if (gauntletChampionFighterId !== null && scFighterId != null) {
    try {
      isSelectedPlayerTheChampion =
        BigInt(scFighterId) === gauntletChampionFighterId;
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
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <Trophy
              className={`h-6 w-6 ${
                isSelectedPlayerTheChampion
                  ? "text-yellow-400"
                  : "text-stone-500"
              }`}
            />
            <div className="text-left">
              <span className="font-medium text-base text-stone-200">
                Gauntlet #{gauntlet.id.substring(0, 6)}... ({gauntlet.size}
                -player)
              </span>
              <p className="text-xs text-stone-400">
                {gauntlet.isCompleted ? "Completed" : "Started"}:{" "}
                {formatDate(gauntlet.displayTimestamp)}
                {gauntlet.isCompleted && gauntlet.champion?.fullName && (
                  <span className="ml-2 text-yellow-400">
                    (Champion: {gauntlet.champion.fullName})
                  </span>
                )}
                {!gauntlet.isCompleted && gauntlet.state !== "PENDING" && (
                  <span className="ml-2 text-orange-400">
                    ({gauntlet.state})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-300">
              Prize: {formatEther(BigInt(gauntlet.prizeAwarded))} ETH
            </p>
            <p className="text-xs text-stone-500">
              Entry: {formatEther(BigInt(gauntlet.entryFee))} ETH
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
          {isLoadingParticipants ? (
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
                    !!gauntletChampionFighterId &&
                    gauntletChampionFighterId === fighter.fighterId
                  }
                  isSelectedCharacter={selectedCharacter?.id === fighter.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400">
              Participant details not available.
            </p>
          )}
        </div>

        <div className="mt-4">{renderRoundsAndFights()}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
