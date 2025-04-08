import type { Metadata } from 'next'
import HomeClientPage from './home-client-page'; // Import the renamed client component

// Metadata specifically for the root page, including Farcaster Frame tags
export const metadata: Metadata = {
  title: "Heavy Helms - Home", // Optional: More specific title for home
  description: "Enter the world of Heavy Helms, a blockchain PvP combat game.", // Optional: Specific description
  // Add other general metadata if needed, inheriting from layout.tsx might cover most
  other: {
    // Farcaster Frame configuration
    'fc:frame': 'vNext',
    // TODO: Replace with a dedicated OG image URL (1.91:1 aspect ratio recommended)
    'fc:frame:image': `${process.env.NEXT_PUBLIC_APP_URL || 'https://heavyhelms.xyz'}/parchment_bkg6.jpg`,
    'fc:frame:button:1': 'Open Heavy Helms',
    // Optional: Add post_url if you want the frame button click to POST somewhere
    // 'fc:frame:post_url': `${process.env.NEXT_PUBLIC_APP_URL || 'https://heavyhelms.xyz'}/api/frame`,
    // Optional: Add input if you want text input in the frame
    // 'fc:frame:input:text': 'Enter your message...',
  },
};

// This is now a Server Component
export default function Home() {
  // Render the client component that contains the actual page logic
  return <HomeClientPage />;
}
