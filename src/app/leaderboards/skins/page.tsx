import { redirect } from "next/navigation";

export default function SkinsLeaderboardPage() {
  // Redirect to the default sort option (winRate)
  redirect("/leaderboards/skins/winRate");
}
