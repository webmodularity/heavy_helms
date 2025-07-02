import { SectionHeader } from "@/components/ui/section-header";
import type { ReactNode } from "react";

interface SkinHeroSectionProps {
  skinData: {
    collection: {
      id: string;
      contractAddress: string;
      isVerified: boolean;
      skinType: number;
      requiredNFTAddress: string | null;
    };
    tokenId: number;
    metadataURI: string;
    weapon: number;
    armor: number;
    imageURL?: string;
    spritesheet?: unknown;
  };
  collectionName: string;
  combatResults: unknown[];
  subtitleElement?: ReactNode;
}

export function SkinHeroSection({
  skinData,
  collectionName,
  combatResults,
  subtitleElement,
}: SkinHeroSectionProps) {
  // Create subtitle - just say "Skin"
  const subtitle = subtitleElement || "Skin";

  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden">
      <div className="flex items-center justify-center h-full min-h-[50px]">
        <SectionHeader
          title={`${collectionName} #${skinData.tokenId}`}
          subtitle={subtitle}
          className="relative z-10 text-center mb-0"
        />
      </div>
    </div>
  );
}
