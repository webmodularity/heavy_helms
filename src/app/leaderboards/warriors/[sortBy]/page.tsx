import { WarriorLeaderboard } from "@/components/leaderboards/warrior-leaderboard";
import { redirect } from "next/navigation";

// Valid sort options for warriors
const VALID_SORT_OPTIONS = [
  "battleRating",
  "wins",
  "losses",
  "kills",
  "duelWins",
  "gauntletWins",
];

interface PageProps {
  params: Promise<{
    sortBy: string;
  }>;
}

export default async function WarriorsLeaderboardSortPage({ params }: PageProps) {
  const { sortBy } = await params;
  
  // Validate the sortBy parameter
  if (!VALID_SORT_OPTIONS.includes(sortBy)) {
    redirect("/leaderboards/warriors/battleRating");
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <WarriorLeaderboard sortBy={sortBy} />
    </div>
  );
}
