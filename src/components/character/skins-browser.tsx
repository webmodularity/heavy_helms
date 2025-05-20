"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchVerifiedSkinCollections } from "@/lib/player-api";
import { SkinType } from "@/types/skin.types";
import type { Player } from "@/types/player.types";
import { Shield, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { SkinCard } from "./skin-card";
import { SkinTypeFilter } from "./skin-type-filter";
import { SkinDetailsDialog } from "../dialogs/skin-details-dialog";
import { useEquipSkin } from "@/hooks/use-equip-skin";
import type { StanceType } from "@/types/equipment.types";
import { SectionHeader } from "../ui/section-header";
import { CompactSectionHeader } from "../ui/compact/CompactSectionHeader";

export interface SkinWithMetadataURI {
  id: string;
  tokenId: number;
  metadataURI: string;
  weapon: number;
  armor: number;
  collection: {
    id: string;
    registryId: string;
    contractAddress: string;
    skinType: SkinType;
    requiredNFTAddress?: string | null;
    isVerified: boolean;
  };
  imageURL?: string;
}

interface SkinsBrowserProps {
  character: Player;
}

export function SkinsBrowser({ character }: SkinsBrowserProps) {
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType | null>(
    null,
  );
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSkinForDetails, setSelectedSkinForDetails] =
    useState<SkinWithMetadataURI | null>(null);
  const { equipSkin, isEquipping } = useEquipSkin(character.id);

  // Fetch verified skin collections
  const { data: skinCollections, isLoading } = useQuery({
    queryKey: ["verifiedSkinCollections"],
    queryFn: () => fetchVerifiedSkinCollections(),
  });

  // Filter skins based on selected type
  const filteredSkins = useMemo(() => {
    if (!skinCollections) return [];

    // Flatten all skins from all collections
    const allSkins = skinCollections
      .flatMap((collection) =>
        collection.skins.map((skin) => ({
          ...skin,
          collection: {
            id: collection.id,
            contractAddress: collection.contractAddress,
            skinType: collection.skinType,
            requiredNFTAddress: collection.requiredNFTAddress,
            isVerified: true,
            registryId: collection.registryId,
          },
        })),
      )
      .filter((skin) => skin.collection.skinType !== SkinType.Monster);

    // Filter by skin type if selected
    return selectedSkinType !== null
      ? allSkins.filter((skin) => skin.collection.skinType === selectedSkinType)
      : allSkins;
  }, [skinCollections, selectedSkinType]);

  // Handle skin selection
  const handleSelectSkin = (skinId: string) => {
    setSelectedSkinId(skinId === selectedSkinId ? null : skinId);
  };

  // Handle viewing skin details
  const handleViewSkinDetails = (skin: SkinWithMetadataURI) => {
    setSelectedSkinForDetails(skin);
    setDetailsDialogOpen(true);
  };

  // Handle skin type filter change
  const handleFilterChange = (skinType: SkinType | null) => {
    setSelectedSkinType(skinType);
    setSelectedSkinId(null); // Reset selection when filter changes
  };

  // Handle equipping the skin from the dialog
  const handleEquipSkin = async (stance: StanceType) => {
    if (!selectedSkinForDetails) return;

    const isCurrentSkin =
      character.currentSkin.collection.id ===
        selectedSkinForDetails.collection.id &&
      character.currentSkin.tokenId === selectedSkinForDetails.tokenId;

    if (isCurrentSkin || isEquipping) return;

    await equipSkin(
      Number.parseInt(selectedSkinForDetails.collection.registryId, 10),
      selectedSkinForDetails.tokenId,
      selectedSkinForDetails,
      stance,
    );

    // Close the dialog after equipping
    setDetailsDialogOpen(false);
  };

  // Check if the skin is currently equipped
  const isCurrentSkin = (skin: SkinWithMetadataURI) =>
    character.currentSkin.collection.id === skin.collection.id &&
    character.currentSkin.tokenId === skin.tokenId;

  return (
    <section>
      <CompactSectionHeader
        title="Character Skins"
        description="Choose wisely, adventurer - your chosen skin dictates your warrior's equipment and combat path!"
        icon={<Swords className="h-5 w-5 text-yellow-500" />}
      />

      {/* Skin Type Filter - more compact */}
      <div className="mb-3">
        <CompactSkinTypeFilter
          selectedType={selectedSkinType}
          onChange={handleFilterChange}
        />
      </div>

      {/* Skins Grid - more compact */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <div
                key={`skeleton-${index.toString()}`}
                className="aspect-square bg-stone-800/50 rounded-lg animate-pulse"
              />
            ))}
        </div>
      ) : filteredSkins.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredSkins.map((skin, index) => (
            <SkinCard
              key={skin.id}
              skin={skin}
              isCurrentSkin={isCurrentSkin(skin)}
              onViewDetails={handleViewSkinDetails}
              delay={index * 0.05}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-3 bg-stone-800/20 rounded-lg border border-yellow-600/10">
          <p className="text-stone-400 text-xs">
            {selectedSkinType !== null
              ? `No ${SkinType[selectedSkinType]} skins available`
              : "No skins available"}
          </p>
        </div>
      )}

      {/* Single Skin Details Dialog */}
      {selectedSkinForDetails && (
        <SkinDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          skin={selectedSkinForDetails}
          character={character}
          isCurrentSkin={isCurrentSkin(selectedSkinForDetails)}
          onEquip={handleEquipSkin}
          isEquipping={isEquipping}
        />
      )}
    </section>
  );
}

// More compact skin type filter
function CompactSkinTypeFilter({
  selectedType,
  onChange,
}: {
  selectedType: SkinType | null;
  onChange: (type: SkinType | null) => void;
}) {
  // Filter options
  const filterOptions = [
    { label: "All", value: null },
    { label: "Default", value: SkinType.DefaultPlayer },
    { label: "Verified", value: SkinType.Player },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {filterOptions.map((option) => (
        <button
          key={`filter-${option.label}`}
          onClick={() => onChange(option.value)}
          className={`px-2 py-1 text-xs rounded-md ${
            selectedType === option.value
              ? "bg-yellow-600 text-stone-900"
              : "border border-yellow-600/20 text-yellow-500 hover:bg-yellow-900/20"
          }`}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
