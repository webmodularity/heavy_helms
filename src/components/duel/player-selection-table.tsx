"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useActivePlayers } from "@/hooks/use-active-players";
import { ArmorType, StanceType, WeaponType } from "@/types/equipment.types";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, ArrowUpDown } from "lucide-react";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { Fighter } from "@/types/fighter-types";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
} from "@/lib/equipment-utils";
import { useSupabaseAddressToUserMap } from "@/hooks/use-supabase-players";
import { getAddress } from "viem";
import { useFarcaster } from "@/store/farcaster-context";
import { useFarcasterData } from "@/hooks/use-farcaster-data";

interface PlayerSelectionTableProps {
  onSelectPlayer: (player: Fighter) => void;
  currentPlayerId?: string;
}

export function PlayerSelectionTable({
  onSelectPlayer,
  currentPlayerId,
}: PlayerSelectionTableProps) {
  const { players: allPlayers, isLoading, error } = useActivePlayers();
  const { viewProfile } = useFarcaster();
  const { players: ownPlayers, isLoading: isOwnPlayersLoading } =
    useOwnPlayers();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);

  const { data: addressToUserMap, isLoading: isAddressToUserMapLoading } =
    useSupabaseAddressToUserMap();

  // Get Farcaster data
  const { currentUserFid, isLoadingFollowing, followingError, isFollowing } =
    useFarcasterData();

  // Enhanced filtered players logic with Farcaster following
  const filteredPlayers = useMemo(() => {
    if (isLoading || isOwnPlayersLoading || !allPlayers) {
      return [];
    }

    let players = allPlayers;

    // Filter out own players if currentPlayerId is provided
    if (currentPlayerId) {
      const ownPlayerIdsSet = new Set(
        ownPlayers?.map((player) => player.id) ?? [],
      );
      players = players.filter((player) => !ownPlayerIdsSet.has(player.id));
    }

    // Apply Farcaster following filter
    if (showFollowingOnly && currentUserFid && !isLoadingFollowing) {
      players = players.filter((player) => {
        // Get player's Farcaster FID from address mapping
        const playerAddress = player.owner?.address;
        if (!playerAddress || !addressToUserMap) return false;

        const user = addressToUserMap[getAddress(playerAddress)];
        if (!user?.farcaster_fid) return false;

        return isFollowing(user.farcaster_fid);
      });
    }

    return players;
  }, [
    allPlayers,
    currentPlayerId,
    isLoading,
    isOwnPlayersLoading,
    ownPlayers,
    showFollowingOnly,
    currentUserFid,
    isLoadingFollowing,
    addressToUserMap,
    isFollowing,
  ]);

  // Define columns for the table
  const columns: ColumnDef<Fighter>[] = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <div className="h-8 w-8 rounded-full overflow-hidden bg-stone-800 relative">
          <Image
            src={row.original.currentSkin.imageURL}
            alt={row.original.name.fullName || ""}
            fill
            className="object-cover"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.name.fullName,
      id: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          Name
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        // Check if this player is followed
        const playerAddress = row.original.owner?.address;
        const user =
          playerAddress && addressToUserMap
            ? addressToUserMap[getAddress(playerAddress)]
            : null;
        const isPlayerFollowed = user?.farcaster_fid
          ? isFollowing(user.farcaster_fid)
          : false;

        return (
          <div className="font-medium text-stone-200 text-xs sm:text-sm flex items-center gap-1">
            {row.original.name.fullName}
            {isPlayerFollowed && (
              <div
                className="w-2 h-2 bg-blue-500 rounded-full"
                title="You follow this player"
              />
            )}
          </div>
        );
      },
      enableHiding: false,
    },
    {
      id: "farcaster",
      header: () => (
        <div style={{ width: "16px", height: "16px", margin: "0 auto" }}>
          <Image
            src="/logos/farcaster-logo.svg"
            alt="Farcaster"
            width={16}
            height={16}
          />
        </div>
      ),
      cell: ({ row }) => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const playerAddress = row.original.owner?.address!;
        const user = addressToUserMap?.[getAddress(playerAddress)];
        const farcasterUsername = user?.username;

        if (farcasterUsername) {
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                viewProfile(user.farcaster_fid);
              }}
              className="flex justify-center items-center"
              title={`View ${farcasterUsername} on Farcaster`}
            >
              <Image
                src="/logos/farcaster-logo.svg"
                alt={`${farcasterUsername} on Farcaster`}
                width={20}
                height={20}
                className="rounded-sm"
              />
            </button>
          );
        }
        return <div className="w-[20px] h-[20px] mx-auto" />;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.attributes.strength,
      id: "strength",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          STR
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {row.original.attributes.strength}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.attributes.agility,
      id: "agility",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          AGI
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {row.original.attributes.agility}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.attributes.stamina,
      id: "stamina",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          STA
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {row.original.attributes.stamina}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.currentSkin.weapon,
      id: "weapon",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          Weapon
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {getWeaponDisplayName(row.original.currentSkin.weapon)}
        </div>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorFn: (row) => row.currentSkin.armor,
      id: "armor",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          Armor
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {getArmorDisplayName(row.original.currentSkin.armor)}
        </div>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorFn: (row) => row.record.wins,
      id: "wins",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          W
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-green-400 text-xs">
          {row.original.record.wins}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.record.losses,
      id: "losses",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          L
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-red-400 text-xs">
          {row.original.record.losses}
        </div>
      ),
    },
  ];

  // Create table instance
  const table = useReactTable({
    data: filteredPlayers,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, value) => {
      const searchValue = value.toLowerCase();
      if (columnId === "name" && row.original.name.fullName) {
        return (
          row.original.name.fullName.toLowerCase().includes(searchValue) ||
          row.original.id.toLowerCase().includes(searchValue)
        );
      }
      return false;
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Early loading state
  if (isLoading || isOwnPlayersLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  // Early error state
  if (error) {
    return (
      <div className="text-center text-red-400 h-40 flex flex-col justify-center">
        <h3 className="text-base font-medium mb-1.5">Error loading players</h3>
        <p className="text-xs text-red-300">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  // Render the main component with filters always visible
  return (
    <div className="flex flex-col h-full gap-2.5">
      {/* Farcaster Following Filter Row - Always show if user has FID */}
      {currentUserFid && (
        <div className="flex-none">
          <div className="flex items-center space-x-2 p-2 bg-stone-900/30 rounded-md border border-yellow-600/10">
            <Checkbox
              id="following-filter"
              checked={showFollowingOnly}
              onCheckedChange={(checked) =>
                setShowFollowingOnly(
                  checked === "indeterminate" ? false : checked === true,
                )
              }
              disabled={isLoadingFollowing}
              className="border-yellow-600/20 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
            />
            <label
              htmlFor="following-filter"
              className="text-xs text-stone-200 cursor-pointer flex items-center gap-1.5"
            >
              <Image
                src="/logos/farcaster-logo.svg"
                alt="Farcaster"
                width={14}
                height={14}
              />
              Show only players I follow
              {isLoadingFollowing && (
                <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
              )}
            </label>
            {followingError && (
              <span
                className="text-xs text-red-400"
                title={followingError.message}
              >
                (Error loading following)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter Controls - Always show */}
      <div className="flex-none flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            placeholder="Search by name or ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 py-1 h-8 text-xs bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-1.5">
          {/* Weapon filter */}
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("weapon")?.setFilterValue(undefined);
              } else {
                table.getColumn("weapon")?.setFilterValue([Number(value)]);
              }
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[110px] h-8 text-xs border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Weapon" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200 text-xs">
              <SelectItem value="all">All Weapons</SelectItem>
              {Object.entries(WeaponType).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Armor filter */}
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("armor")?.setFilterValue(undefined);
              } else {
                table.getColumn("armor")?.setFilterValue([Number(value)]);
              }
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[100px] h-8 text-xs border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Armor" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200 text-xs">
              <SelectItem value="all">All Armor</SelectItem>
              {Object.entries(ArmorType).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stance filter */}
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("stance")?.setFilterValue(undefined);
              } else {
                table.getColumn("stance")?.setFilterValue([Number(value)]);
              }
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[100px] h-8 text-xs border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Stance" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200 text-xs">
              <SelectItem value="all">All Stances</SelectItem>
              {Object.entries(StanceType).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content Area */}
      {filteredPlayers.length === 0 ? (
        // No results state - but filters remain visible above
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-stone-300">
            <h3 className="text-base font-medium text-yellow-500 mb-1.5">
              {showFollowingOnly && currentUserFid
                ? "No followed challengers found"
                : "No challengers found"}
            </h3>
            <p className="text-xs max-w-md mx-auto">
              {showFollowingOnly && currentUserFid
                ? "None of the players you follow on Farcaster are available to challenge. Try unchecking the filter above."
                : "There are no active players available to challenge at the moment."}
            </p>
          </div>
        </div>
      ) : (
        // Table with data
        <>
          <div className="flex-grow min-h-0 rounded-md border border-yellow-600/20 overflow-hidden">
            <div className="h-full overflow-auto">
              <Table className="border-collapse text-xs">
                <TableHeader className="bg-stone-100/50 sticky top-0 z-10">
                  <TableRow>
                    {table.getHeaderGroups()[0].headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-center py-2 px-2"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => onSelectPlayer(row.original)}
                      className="group hover:bg-amber-900/10 hover:border-yellow-600/30 cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-1.5 px-2">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex-none flex items-center justify-end space-x-1.5 py-2">
            <div className="text-xs text-stone-400">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-7 px-2 text-xs border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-200"
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-7 px-2 text-xs border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-200"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
