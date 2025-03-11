import "@/styles/globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import Providers from "@/providers";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import { Toaster } from "sonner";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
            <main className="flex flex-col flex-1">{children}</main>
            <Toaster />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
