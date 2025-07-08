import { redirect } from "next/navigation";

export default function ChallengesPage() {
  // Redirect to the default filter option (open)
  redirect("/battle-archives/challenges/open");
}
