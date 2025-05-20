import type { Metadata } from "next";

interface FightResultPageProps {
  params: { fightId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params,
  searchParams,
}: FightResultPageProps): Promise<Metadata> {
  const fightId = params.fightId;
  const winnerName = searchParams.winnerName as string | undefined;
  const loserName = searchParams.loserName as string | undefined;

  if (!winnerName || !loserName) {
    // Fallback metadata or handle error - for simplicity, basic tags
    return {
      title: "Fight Result",
      description: "Details of a completed fight.",
    };
  }

  const appDomain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080"; // Ensure this env var is set

  // URL for the dynamically generated image
  const imageUrl = new URL(`${appDomain}/api/fight-image`);
  imageUrl.searchParams.set("winnerName", winnerName);
  imageUrl.searchParams.set("loserName", loserName);
  if (fightId) {
    imageUrl.searchParams.set("fightId", fightId);
  }

  // URL of this page, for the fc:frame post_url or other references
  const pageUrl = new URL(`${appDomain}/fight-results/${fightId}`);
  pageUrl.searchParams.set("winnerName", winnerName);
  pageUrl.searchParams.set("loserName", loserName);

  const frameData = {
    image: imageUrl.toString(),
    // post_url: pageUrl.toString(), // URL to hit when a button in the frame is clicked.
    // If no buttons, can point to app or be omitted depending on client requirements.
    // For a simple share, the image is key. Let's point it to the results page itself.
    post_url: pageUrl.toString(),
    // Example buttons (optional):
    // buttons: [
    //   { label: "View Details", action: "post" }, // 'post' will send a POST to post_url
    //   { label: "Play Again?", action: "link", target: `${appDomain}/play` } // 'link' opens a URL
    // ],
    // aspect_ratio: "1.91:1", // Common for OG images
  };

  const fcFrameContent = JSON.stringify(frameData);

  return {
    title: `Fight: ${winnerName} vs ${loserName}`,
    description: `${winnerName} defeated ${loserName} in an epic duel!`,
    openGraph: {
      title: `Fight: ${winnerName} vs ${loserName}`,
      description: `${winnerName} defeated ${loserName}!`,
      images: [
        {
          url: imageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `Image showing ${winnerName} defeated ${loserName}`,
        },
      ],
      type: "website",
      url: pageUrl.toString(),
    },
    other: {
      // Farcaster specific meta tags
      "fc:frame": fcFrameContent,
      "fc:frame:image": imageUrl.toString(), // Redundant with fc:frame content but some older parsers might look for it
      "fc:frame:post_url": pageUrl.toString(), // Also potentially redundant
      // If you add buttons:
      // "fc:frame:button:1": "View Details",
      // "fc:frame:button:1:action": "post", // or "link"
      // "fc:frame:button:2": "Play Again?",
      // "fc:frame:button:2:action": "link",
      // "fc:frame:button:2:target": `${appDomain}/play`,

      // For Warpcast Mini App Debugger compatibility (these might change or vary by client)
      "og:image": imageUrl.toString(), // Standard OG tag
      "og:url": pageUrl.toString(),
    },
  };
}

export default function FightResultPage({
  params,
  searchParams,
}: FightResultPageProps) {
  const winnerName = searchParams.winnerName as string | undefined;
  const loserName = searchParams.loserName as string | undefined;

  if (!winnerName || !loserName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Fight Result Inconclusive</h1>
        <p>
          Required information (winner or loser) is missing to display this
          result.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#2e1b3b] text-white font-pixeloid">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">Fight Over!</h1>
      <div className="mb-4">
        <span className="text-3xl md:text-4xl text-yellow-400">
          {winnerName}
        </span>
        <span className="text-2xl md:text-3xl mx-2">defeated</span>
        <span className="text-3xl md:text-4xl text-red-400">{loserName}!</span>
      </div>
      <p className="text-lg mt-6">
        This page is for sharing on Farcaster. The image above is what will be
        embedded in your cast.
      </p>
      <p className="mt-2 text-sm text-gray-400">Fight ID: {params.fightId}</p>
      {/* You can add a link back to your main app or other relevant content here */}
    </div>
  );
}
