'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'

// Dynamically import Game component with no SSR
const Game = dynamic(() => import('../../components/Game'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white font-bokor text-2xl">
      Loading game...
    </div>
  )
})

export default function GamePage() {
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Background with reduced opacity */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/parchment_bkg6.jpg"
          alt="Background"
          fill
          className="object-cover opacity-25 object-top"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full flex justify-center">
          <div className="w-full max-w-[960px]">
            <Image
              src="/hh_header5_no_bkg_small.png"
              alt="Heavy Helms Header"
              width={960}
              height={320}
              className="w-full opacity-75"
              priority
            />
          </div>
        </header>

        {/* Game Container */}
        <main className="w-full flex justify-center mt-[-24px]">
          <div className="w-full max-w-[960px]">
            <div className="w-[960px] h-[540px] rounded-xl overflow-hidden
              shadow-[0_0_0_1px_rgba(48,48,48,0.9),0_0_0_3px_rgba(64,64,64,0.8),0_8px_16px_rgba(0,0,0,0.5),0_16px_32px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.3)]
              bg-black">
              <Game />
            </div>
          </div>
        </main>

        {/* Game Controls */}
        <footer className="p-4 flex justify-center gap-4">
          <Link 
            href="/"
            className="px-4 py-2 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Back to Menu
          </Link>
        </footer>
      </div>
    </div>
  )
}