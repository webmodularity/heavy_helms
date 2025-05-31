import "@/styles/globals.css";
import { Footer } from "@/components/layout/footer";
import { RetroHeader } from "@/components/ui/retro-header";
import Providers from "@/providers";
import type { Metadata, Viewport } from "next/types";
import localFont from "next/font/local";
import { Cinzel, Cormorant_Unicase } from "next/font/google";
import Image from "next/image";
import { Toaster } from "sonner";
import { ConditionalBackButtonWrapper } from "@/components/layout/conditional-back-button-wrapper";

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

const pixeloid = localFont({
  src: "../../public/fonts/PixeloidMono.ttf",
  variable: "--font-pixeloid",
});

// Load Cormorant Unicase (for headings)
const cormorantUnicase = Cormorant_Unicase({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-cormorant-unicase",
});

export const metadata: Metadata = {
  title: "Heavy Helms",
  description: "A blockchain-based PvP combat game",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${bokor.variable} ${cormorantUnicase.variable} ${cinzel.className} ${pixeloid.variable} min-h-screen flex flex-col pixel-perfect`}
      >
        {/* Enhanced retro background with CRT effect */}
        <div className="fixed inset-0 -z-10">
          <Image
            src="/parchment_bkg6.jpg"
            alt="Background"
            fill
            className="object-cover opacity-20 object-top pixel-perfect"
            priority
          />
          {/* Retro grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
          {/* Subtle vignette effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,15,28,0.3)_100%)]" />
        </div>

        <Providers>
          <div className="flex flex-col min-h-screen relative">
            {/* Optional screen flicker effect */}
            <div className="fixed inset-0 pointer-events-none screen-flicker opacity-50 -z-5" />
            
            <RetroHeader />
            
            <main className="container mx-auto flex min-h-screen flex-col px-4 pt-0 pb-8 md:px-6 lg:px-8 relative z-10">
              <ConditionalBackButtonWrapper>
                {children}
              </ConditionalBackButtonWrapper>
            </main>
            
            <Toaster 
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'var(--color-arcade-screen)',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-pixeloid)',
                  fontSize: '12px',
                },
              }}
            />
            
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
