import "@/styles/globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import Providers from "@/providers";
import type { Metadata, Viewport } from "next/types";
import localFont from "next/font/local";
import { Cinzel, Cormorant_Unicase } from "next/font/google";
import Image from "next/image";
import { Toaster } from "sonner";

import { GlobalFightModal } from "@/components/modals/global-fight-modal";
import { MiniAppDebug } from "@/components/miniapp-debug";

// Load Bokor
const bokor = localFont({
  src: "../../public/fonts/Bokor-Regular.ttf",
  weight: "400",
  display: "swap",
  variable: "--font-bokor",
});

// Load Cinzel (will be default body)
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-cinzel",
});

// Load Cormorant Unicase (for headings)
const cormorantUnicase = Cormorant_Unicase({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-cormorant-unicase",
});

// Farcaster miniapp frame configuration
const farcasterFrame = {
  version: "1",
  imageUrl: `${process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL}/heavy_helms_header.png`,
  button: {
    title: "Enter the Arena",
    action: {
      type: "launch_frame",
      name: "Heavy Helms",
      url: process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL,
      splashImageUrl: `${process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL}/heavy_helms_header.png`,
      splashBackgroundColor: "#000000"
    }
  }
};

export const metadata: Metadata = {
  title: "Heavy Helms",
  description: "A blockchain-based PvP combat game",
  openGraph: {
    title: "Heavy Helms - PvP Combat Arena",
    description: "Enter the arena and battle for glory in this blockchain-based combat game",
    images: [`${process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL}/heavy_helms_header.png`],
    url: process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Heavy Helms - PvP Combat Arena",
    description: "Enter the arena and battle for glory in this blockchain-based combat game",
    images: [`${process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL}/heavy_helms_header.png`],
  },
  other: {
    "fc:miniapp": JSON.stringify(farcasterFrame),
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${bokor.variable} ${cormorantUnicase.variable} ${cinzel.className} min-h-screen flex flex-col`}
      >
        {/* Background with reduced opacity */}
        <div className="fixed inset-0 -z-1">
          <Image
            src="/parchment_bkg6.jpg"
            alt="Background"
            fill
            className="object-cover opacity-30 object-top"
            priority
          />
        </div>
        <Providers>
          <div className="flex flex-col from-slate-900 to-indigo-900">
            <Header />
            <main className="flex flex-col px-0 pt-0 pb-8">{children}</main>
            <Toaster 
              theme="dark" 
              position="top-center"
              toastOptions={{
                style: {
                  background: '#1a1a1a',
                  color: '#f9c846',
                  border: '1px solid #f9c846',
                },
              }}
            />
            <Footer />
          </div>
          <GlobalFightModal />
          <MiniAppDebug />
        </Providers>
      </body>
    </html>
  );
}
