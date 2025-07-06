interface EmbedConfig {
  title: string;
  description?: string;
  imageUrl?: string;
  buttonTitle?: string;
  url?: string;
}

export function generateFarcasterEmbed({
  title,
  description,
  imageUrl,
  buttonTitle = "View Battle",
  url,
}: EmbedConfig) {
  const baseUrl = process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL;
  
  return {
    version: "1",
    imageUrl: imageUrl || `${baseUrl}/heavy_helms_header.png`,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_frame",
        name: "Heavy Helms",
        url: url || baseUrl,
        splashImageUrl: `${baseUrl}/heavy_helms_header.png`,
        splashBackgroundColor: "#000000"
      }
    }
  };
}

export function generateShareableMetadata({
  title,
  description,
  imageUrl,
  buttonTitle,
  url,
}: EmbedConfig) {
  const embed = generateFarcasterEmbed({
    title,
    description,
    imageUrl,
    buttonTitle,
    url,
  });

  return {
    title,
    description: description || "A blockchain-based PvP combat game",
    openGraph: {
      title,
      description: description || "A blockchain-based PvP combat game",
      images: [imageUrl || `${process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL}/heavy_helms_header.png`],
      url: url || process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description: description || "A blockchain-based PvP combat game",
      images: [imageUrl || `${process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL}/heavy_helms_header.png`],
    },
    other: {
      "fc:miniapp": JSON.stringify(embed),
    },
  };
} 