import { SkinLeaderboard } from "@/components/leaderboards/skin-leaderboard";
import { redirect } from "next/navigation";

// Valid sort options for skins
const VALID_SORT_OPTIONS = [
  "winRate",
  "totalCombats",
  "wins",
  "losses",
  "kills",
  "averageDamage",
  "averageDamageTaken",
];

interface PageProps {
  params: Promise<{
    sortBy: string;
  }>;
}

export default async function SkinsLeaderboardSortPage({ params }: PageProps) {
  const { sortBy } = await params;
  
  // Validate the sortBy parameter
  if (!VALID_SORT_OPTIONS.includes(sortBy)) {
    redirect("/leaderboards/skins/winRate");
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <SkinLeaderboard sortBy={sortBy} />
    </div>
  );
}
