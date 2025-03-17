"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchVerifiedSkinCollections } from "@/lib/player-api";
import { SectionHeader } from "@/components/ui/section-header";

import { SkinType } from "@/types/skin.types";
import type { Character } from "@/types/player.types";
import { Paintbrush } from "lucide-react";
import { motion } from "framer-motion";
import { SkinCard } from "./skin-card";
import { SkinTypeFilter } from "./skin-type-filter";

interface SkinsBrowserProps {
  character: Character;
}

export function SkinsBrowser({ character }: SkinsBrowserProps) {
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType | null>(
    null,
  );
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);

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

  // Handle skin type filter change
  const handleFilterChange = (skinType: SkinType | null) => {
    setSelectedSkinType(skinType);
    setSelectedSkinId(null); // Reset selection when filter changes
  };

  return (
    <section className="mt-12 mb-16">
      <SectionHeader
        title="Character Skins"
        subtitle="Customize your warrior's appearance"
        icon={<Paintbrush className="h-5 w-5 text-yellow-500" />}
      />

      {/* Skin Type Filter */}
      <div className="mb-6">
        <SkinTypeFilter
          selectedType={selectedSkinType}
          onChange={handleFilterChange}
        />
      </div>

      {/* Skins Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="aspect-square bg-stone-800/50 rounded-lg animate-pulse"
              />
            ))}
        </div>
      ) : filteredSkins.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredSkins.map((skin, index) => (
            <SkinCard
              key={skin.id}
              skin={skin}
              isSelected={selectedSkinId === skin.id}
              isCurrentSkin={
                character.currentSkin.collection.id === skin.collection.id &&
                character.currentSkin.tokenId === skin.tokenId
              }
              onSelect={() => handleSelectSkin(skin.id)}
              character={character}
              delay={index * 0.05}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-stone-800/20 rounded-lg border border-yellow-600/10">
          <p className="text-stone-400">
            {selectedSkinType !== null
              ? `No ${SkinType[selectedSkinType]} skins available`
              : "No skins available"}
          </p>
        </div>
      )}
    </section>
  );
}
