import { CharacterDetailsView } from "@/components/character/character-details-view";
import type { Metadata } from "next";
import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { GET_FIGHTERS_BY_IDS } from "@/lib/gql-queries";
import { convertRawFighterToFighter, type FightersResponse } from "@/lib/player-api";

interface CharacterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: CharacterPageProps): Promise<Metadata> {
  const characterId = (await params).id;
  
  try {
    // Fetch character data server-side for metadata
    const response = await request<FightersResponse>(
      SUBGRAPH_URL,
      GET_FIGHTERS_BY_IDS,
      { fighterIds: [characterId] }
    );

    if (!response.fighters || response.fighters.length === 0) {
      // Fallback metadata for non-existent character
      return {
        title: `Character #${characterId} | Heavy Helms`,
        description: "Character not found in Heavy Helms",
      };
    }

    const rawCharacter = response.fighters[0];
    const character = await convertRawFighterToFighter(rawCharacter);
    
    const appDomain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";
    
    // Generate character image URL with all necessary parameters
    const characterImageUrl = new URL(`${appDomain}/api/character-image`);
    characterImageUrl.searchParams.set("characterId", character.id);
    characterImageUrl.searchParams.set("characterName", character.name.fullName || "Unknown Warrior");
    characterImageUrl.searchParams.set("wins", character.record.wins.toString());
    characterImageUrl.searchParams.set("losses", character.record.losses.toString());
    characterImageUrl.searchParams.set("characterImageUrl", character.currentSkin.imageURL);
    characterImageUrl.searchParams.set("battleRating", character.battleRating?.toString() || "0");
    // characterImageUrl.searchParams.set("rank", character.rank?.toString() || "null");

    // Character page URL
    const characterPageUrl = `${appDomain}/character/${characterId}`;

    const title = `${character.name.fullName} | Heavy Helms Warrior`;
    const description = `Meet ${character.name.fullName}, a warrior with ${character.record.wins} wins and ${character.record.losses} losses. Battle Rating: ${Math.round(character.battleRating || 0)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: characterImageUrl.toString(),
            width: 1200,
            height: 630,
            alt: `${character.name.fullName} - Heavy Helms Warrior`,
          },
        ],
        type: "website",
        url: characterPageUrl,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [characterImageUrl.toString()],
      },
      other: {
        // Standard Farcaster Frame meta tags
        "fc:frame": "vNext",
        "fc:frame:image": characterImageUrl.toString(),
        "fc:frame:image:aspect_ratio": "1.91:1",
        "fc:frame:button:1": "View Warrior",
        "fc:frame:button:1:action": "link",
        "fc:frame:button:1:target": characterPageUrl,
        "fc:frame:post_url": characterPageUrl,
        
        // Open Graph fallbacks
        "og:image": characterImageUrl.toString(),
        "og:image:width": "1200",
        "og:image:height": "630",
        "og:url": characterPageUrl,
      },
    };
  } catch (error) {
    console.error("Error generating character metadata:", error);
    
    // Fallback metadata
    return {
      title: `Character #${characterId} | Heavy Helms`,
      description: "View detailed information about this Heavy Helms warrior",
    };
  }
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden">
      {/* Decorative Background Elements - Using CSS only */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-800/5 via-stone-900/10 to-stone-950/80 z-0" />
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-900/10 to-transparent z-0" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-stone-950 to-transparent z-0" />

      {/* Decorative Elements - Using CSS */}
      <div className="hidden lg:block absolute -left-20 top-1/4 w-64 h-64 rounded-full bg-yellow-600/5 blur-3xl z-0" />
      <div className="hidden lg:block absolute -right-20 top-2/3 w-64 h-64 rounded-full bg-amber-700/5 blur-3xl z-0" />

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8 relative z-10">
        <CharacterDetailsView characterId={id} />
      </main>
    </div>
  );
}
