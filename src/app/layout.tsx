import "@/styles/globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import Providers from "@/providers";
import type { Metadata, Viewport } from "next/types";
import localFont from "next/font/local";
import Image from "next/image";
import { Toaster } from "sonner";
import { ConditionalBackButtonWrapper } from '@/components/layout/conditional-back-button-wrapper';
import { cn } from '@/lib/utils';
import { FarcasterReady } from '@/components/layout/farcaster-ready';

// Load Bokor font from the public directory
const bokor = localFont({
  src: "../../public/fonts/Bokor-Regular.ttf",
  weight: "400",
  display: "swap",
  variable: "--font-bokor",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bokor.className} min-h-screen flex flex-col`}>
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
            <main className="container mx-auto flex min-h-screen flex-col px-4 py-8 md:px-6 lg:px-8">
              <FarcasterReady>
                <ConditionalBackButtonWrapper>
                  {children}
                </ConditionalBackButtonWrapper>
              </FarcasterReady>
            </main>
            <Toaster />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
