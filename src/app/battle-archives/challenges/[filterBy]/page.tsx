import { Challenges } from "@/components/battle-archives/challenges";
import { redirect } from "next/navigation";

// Valid filter options for challenges
const VALID_FILTER_OPTIONS = ["open", "expired"];

interface PageProps {
  params: Promise<{
    filterBy: string;
  }>;
}

export default async function ChallengesFilterPage({ params }: PageProps) {
  const { filterBy } = await params;

  // Validate the filterBy parameter
  if (!VALID_FILTER_OPTIONS.includes(filterBy)) {
    redirect("/battle-archives/challenges/open");
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <Challenges filterBy={filterBy} />
    </div>
  );
}
