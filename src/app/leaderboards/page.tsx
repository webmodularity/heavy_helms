import { redirect } from "next/navigation";

export default function LeaderboardsPage() {
  // Redirect to the default tab (warriors)
  redirect("/leaderboards/warriors");
}
