import { CharacterDetailsView } from "@/components/character/character-details-view";
import type { Metadata } from "next";

interface CharacterPageProps {
  params: {
    id: string;
  };
}


export async function generateMetadata({
  params,
}: CharacterPageProps): Promise<Metadata> {
  // This would be enhanced with real character data in production
  return {
    title: `Character Details #${params.id} | Heavy Helms`,
    description: "View detailed information about your warrior character",
  };
}

export default function CharacterPage({ params }: CharacterPageProps) {
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
        <CharacterDetailsView characterId={params.id} />
      </main>
    </div>
  );
}
