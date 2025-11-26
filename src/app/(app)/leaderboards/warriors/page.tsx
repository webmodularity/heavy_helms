import { redirect } from "next/navigation";

export default function WarriorsLeaderboardPage() {
  // Redirect to the default sort option (battleRating)
  redirect("/leaderboards/warriors/battleRating");
}
