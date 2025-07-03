import { redirect } from "next/navigation";

export default function BattleArchivesPage() {
  // Redirect to the default tab (gauntlets)
  redirect("/battle-archives/gauntlets");
}
