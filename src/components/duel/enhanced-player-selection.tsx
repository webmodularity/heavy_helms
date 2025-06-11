import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { ArmorType, StanceType, WeaponType } from "@/types/equipment.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, Users, ChevronDown, X } from "lucide-react";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { Player } from "@/types/player.types";
import type { Fighter } from "@/types/fighter-types";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
  getStanceDisplayName,
} from "@/lib/equipment-utils";
import { usePlayerSearch } from "@/hooks/use-player-search";
import { YellowButton } from "@/components/ui/yellow-button";
import { useSkinMetadata } from "@/hooks/use-skin-metadata";

interface EnhancedPlayerSelectionProps {
  onSelectPlayer: (player: Fighter) => void;
  currentPlayerId?: string;
}

export function EnhancedPlayerSelection({
  onSelectPlayer,
  currentPlayerId,
}: EnhancedPlayerSelectionProps) {
  const { players: ownPlayers, isLoading: isOwnPlayersLoading } =
    useOwnPlayers();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState<number | undefined>();
  const [selectedArmor, setSelectedArmor] = useState<number | undefined>();
  const [selectedStance, setSelectedStance] = useState<number | undefined>();

  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minStrength, setMinStrength] = useState<number | undefined>();
  const [maxStrength, setMaxStrength] = useState<number | undefined>();
  const [minConstitution, setMinConstitution] = useState<number | undefined>();
  const [maxConstitution, setMaxConstitution] = useState<number | undefined>();
  const [minSize, setMinSize] = useState<number | undefined>();
  const [maxSize, setMaxSize] = useState<number | undefined>();
  const [minAgility, setMinAgility] = useState<number | undefined>();
  const [maxAgility, setMaxAgility] = useState<number | undefined>();
  const [minStamina, setMinStamina] = useState<number | undefined>();
  const [maxStamina, setMaxStamina] = useState<number | undefined>();
  const [minLuck, setMinLuck] = useState<number | undefined>();
  const [maxLuck, setMaxLuck] = useState<number | undefined>();

  // Use the enhanced search hook
  const {
    players: allPlayers,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalLoaded,
    resetSearch,
  } = usePlayerSearch({
    searchTerm,
    weapon: selectedWeapon,
    armor: selectedArmor,
    stance: selectedStance,
    minStrength,
    maxStrength,
    minConstitution,
    maxConstitution,
    minSize,
    maxSize,
    minAgility,
    maxAgility,
    minStamina,
    maxStamina,
    minLuck,
    maxLuck,
    pageSize: 50,
  });

  // Infinite scroll setup
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Filter out own players
  const filteredPlayers = useMemo(() => {
    if (isOwnPlayersLoading || !allPlayers) return [];

    const ownPlayerIds = ownPlayers?.map((player) => player.id) || [];
    return allPlayers.filter((player) => !ownPlayerIds.includes(player.id));
  }, [allPlayers, ownPlayers, isOwnPlayersLoading]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedWeapon(undefined);
    setSelectedArmor(undefined);
    setSelectedStance(undefined);
    setMinStrength(undefined);
    setMaxStrength(undefined);
    setMinConstitution(undefined);
    setMaxConstitution(undefined);
    setMinSize(undefined);
    setMaxSize(undefined);
    setMinAgility(undefined);
    setMaxAgility(undefined);
    setMinStamina(undefined);
    setMaxStamina(undefined);
    setMinLuck(undefined);
    setMaxLuck(undefined);
    resetSearch();
  };

  if (error) {
    return (
      <div className="text-center text-red-400 h-64 flex flex-col justify-center">
        <h3 className="text-lg font-medium mb-2">Error loading players</h3>
        <p className="text-sm text-red-300 mb-4">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <YellowButton onClick={resetSearch} size="sm">
          Try Again
        </YellowButton>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Search and Filters Header */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200"
          />
        </div>

        {/* Basic Filters */}
        <div className="flex flex-wrap gap-2">
          <Select
            onValueChange={(value) => {
              setSelectedWeapon(value === "all" ? undefined : Number(value));
            }}
            value={selectedWeapon?.toString() || "all"}
          >
            <SelectTrigger className="w-full sm:w-[130px] border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="All Weapons" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200">
              <SelectItem value="all">All Weapons</SelectItem>
              {Object.entries(WeaponType)
                .filter(([key]) => Number(key) <= 26) // Only show valid weapons (0-26)
                .map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {getWeaponDisplayName(Number(key))}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => {
              setSelectedArmor(value === "all" ? undefined : Number(value));
            }}
            value={selectedArmor?.toString() || "all"}
          >
            <SelectTrigger className="w-full sm:w-[120px] border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="All Armor" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200">
              <SelectItem value="all">All Armor</SelectItem>
              {Object.entries(ArmorType)
                .filter(([key]) => Number(key) <= 3) // Only show valid armor (0-3)
                .map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {getArmorDisplayName(Number(key))}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => {
              setSelectedStance(value === "all" ? undefined : Number(value));
            }}
            value={selectedStance?.toString() || "all"}
          >
            <SelectTrigger className="w-full sm:w-[120px] border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="All Stances" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200">
              <SelectItem value="all">All Stances</SelectItem>
              {Object.entries(StanceType)
                .filter(([key]) => Number(key) <= 2) // Only show valid stances (0-2)
                .map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {getStanceDisplayName(Number(key))}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex-1 sm:flex-initial border-yellow-600/20 hover:border-yellow-500 bg-stone-900/50 text-stone-200 hover:bg-stone-800/60"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`}
            />
          </Button>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex-1 sm:flex-initial border-yellow-600/20 hover:border-yellow-500 bg-stone-900/50 text-stone-200 hover:bg-stone-800/60"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 p-4 border border-yellow-600/20 rounded-lg bg-stone-900/20">
            <div className="space-y-1">
              <label htmlFor="minStrength" className="text-xs text-stone-400">
                Min Strength
              </label>
              <Input
                id="minStrength"
                type="number"
                min={3}
                max={21}
                value={minStrength || ""}
                onChange={(e) =>
                  setMinStrength(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="3"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="maxStrength" className="text-xs text-stone-400">
                Max Strength
              </label>
              <Input
                id="maxStrength"
                type="number"
                min={3}
                max={21}
                value={maxStrength || ""}
                onChange={(e) =>
                  setMaxStrength(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="21"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="minConstitution"
                className="text-xs text-stone-400"
              >
                Min Constitution
              </label>
              <Input
                id="minConstitution"
                type="number"
                min={3}
                max={21}
                value={minConstitution || ""}
                onChange={(e) =>
                  setMinConstitution(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="3"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="maxConstitution"
                className="text-xs text-stone-400"
              >
                Max Constitution
              </label>
              <Input
                id="maxConstitution"
                type="number"
                min={3}
                max={21}
                value={maxConstitution || ""}
                onChange={(e) =>
                  setMaxConstitution(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="21"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="minSize" className="text-xs text-stone-400">
                Min Size
              </label>
              <Input
                id="minSize"
                type="number"
                min={3}
                max={21}
                value={minSize || ""}
                onChange={(e) =>
                  setMinSize(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="3"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="maxSize" className="text-xs text-stone-400">
                Max Size
              </label>
              <Input
                id="maxSize"
                type="number"
                min={3}
                max={21}
                value={maxSize || ""}
                onChange={(e) =>
                  setMaxSize(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="21"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="minAgility" className="text-xs text-stone-400">
                Min Agility
              </label>
              <Input
                id="minAgility"
                type="number"
                min={3}
                max={21}
                value={minAgility || ""}
                onChange={(e) =>
                  setMinAgility(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="3"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="maxAgility" className="text-xs text-stone-400">
                Max Agility
              </label>
              <Input
                id="maxAgility"
                type="number"
                min={3}
                max={21}
                value={maxAgility || ""}
                onChange={(e) =>
                  setMaxAgility(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="21"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="minStamina" className="text-xs text-stone-400">
                Min Stamina
              </label>
              <Input
                id="minStamina"
                type="number"
                min={3}
                max={21}
                value={minStamina || ""}
                onChange={(e) =>
                  setMinStamina(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="3"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="maxStamina" className="text-xs text-stone-400">
                Max Stamina
              </label>
              <Input
                id="maxStamina"
                type="number"
                min={3}
                max={21}
                value={maxStamina || ""}
                onChange={(e) =>
                  setMaxStamina(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="21"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="minLuck" className="text-xs text-stone-400">
                Min Luck
              </label>
              <Input
                id="minLuck"
                type="number"
                min={3}
                max={21}
                value={minLuck || ""}
                onChange={(e) =>
                  setMinLuck(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="3"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="maxLuck" className="text-xs text-stone-400">
                Max Luck
              </label>
              <Input
                id="maxLuck"
                type="number"
                min={3}
                max={21}
                value={maxLuck || ""}
                onChange={(e) =>
                  setMaxLuck(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-sm"
                placeholder="21"
              />
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">
            {totalLoaded} warriors found {hasNextPage && "(scroll for more)"}
          </span>
          <span className="sm:hidden">
            {totalLoaded} found {hasNextPage && "(scroll for more)"}
          </span>
        </div>
      </div>

      {/* Players Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && totalLoaded === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center text-stone-300 h-64 flex flex-col justify-center">
            <h3 className="text-lg font-medium text-yellow-500 mb-2">
              No warriors found
            </h3>
            <p className="text-sm max-w-md mx-auto">
              Try adjusting your search terms or filters to find more
              challengers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 pb-4">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onSelect={onSelectPlayer}
              />
            ))}
          </div>
        )}

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
          ) : hasNextPage ? (
            <span className="text-sm text-stone-400">Scroll for more</span>
          ) : filteredPlayers.length > 0 ? (
            <span className="text-sm text-stone-400">All warriors loaded</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface PlayerCardProps {
  player: Fighter;
  onSelect: (player: Fighter) => void;
}

function PlayerCard({ player, onSelect }: PlayerCardProps) {
  const { data: skinMetadata } = useSkinMetadata(
    player.currentSkin?.metadataURL,
  );
  const imageUrl = skinMetadata?.imageUrl || "/placeholder-skin.jpg";

  return (
    <button
      type="button"
      onClick={() => onSelect(player)}
      className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border border-yellow-600/20 rounded-lg bg-stone-900/40 hover:bg-stone-800/60 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500/50 w-full text-left"
    >
      <div className="relative flex-shrink-0">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-stone-800">
          <img
            src={imageUrl}
            alt={player.name?.fullName || ""}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-skin.jpg";
            }}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-stone-200 truncate text-sm">
          {player.name?.fullName || `Fighter #${player.id}`}
        </h4>
        {/* Mobile: Everything on fewer lines */}
        <div className="sm:hidden">
          <div className="flex items-center gap-2 text-xs text-stone-400 flex-wrap">
            <span>ID: {player.id}</span>
            <span>W: {player.record?.wins || 0}</span>
            <span>L: {player.record?.losses || 0}</span>
            <span>K: {player.record?.kills || 0}</span>
            <span>R: {player.battleRating || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5 flex-wrap">
            <span>STR: {player.attributes?.strength || 0}</span>
            <span>CON: {player.attributes?.constitution || 0}</span>
            <span>SIZ: {player.attributes?.size || 0}</span>
            <span>AGI: {player.attributes?.agility || 0}</span>
            <span>STA: {player.attributes?.stamina || 0}</span>
            <span>LUK: {player.attributes?.luck || 0}</span>
            <span className="ml-1">|</span>
            <span>{getWeaponDisplayName(player.currentSkin?.weapon || 0)}</span>
            <span>•</span>
            <span>{getArmorDisplayName(player.currentSkin?.armor || 0)}</span>
            <span>•</span>
            <span>{getStanceDisplayName(player.stance)}</span>
          </div>
        </div>
        {/* Desktop: Original layout */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
            <span>ID: {player.id}</span>
            <span>W: {player.record?.wins || 0}</span>
            <span>L: {player.record?.losses || 0}</span>
            <span>K: {player.record?.kills || 0}</span>
            <span>Rating: {player.battleRating || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-400 mt-1 flex-wrap">
            <span>STR: {player.attributes?.strength || 0}</span>
            <span>CON: {player.attributes?.constitution || 0}</span>
            <span>SIZ: {player.attributes?.size || 0}</span>
            <span>AGI: {player.attributes?.agility || 0}</span>
            <span>STA: {player.attributes?.stamina || 0}</span>
            <span>LUK: {player.attributes?.luck || 0}</span>
          </div>
        </div>
      </div>
      {/* Desktop loadout - detailed format */}
      <div className="text-right text-xs text-stone-400 flex-shrink-0 hidden sm:block">
        <div>{getWeaponDisplayName(player.currentSkin?.weapon || 0)}</div>
        <div>{getArmorDisplayName(player.currentSkin?.armor || 0)}</div>
        <div>{getStanceDisplayName(player.stance)}</div>
      </div>
    </button>
  );
}
