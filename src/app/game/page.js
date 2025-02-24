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
    <div className="min-h-screen w-full overflow-y-auto">
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
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full flex justify-center p-4">
          <div className="w-full max-w-[960px]">
            <Image
              src="/heavy_helms_header_drop_shadow.png"
              alt="Heavy Helms Header"
              width={960}
              height={320}
              className="w-full opacity-75"
              priority
            />
          </div>
        </header>

        {/* Game Container */}
        <main className="w-full flex justify-center px-4">
          <div className="w-full max-w-[960px] aspect-video rounded-xl overflow-hidden
            shadow-[0_0_0_1px_rgba(48,48,48,0.9),0_0_0_3px_rgba(64,64,64,0.8),0_8px_16px_rgba(0,0,0,0.5),0_16px_32px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.3)]
            bg-black">
            <Game />
          </div>
        </main>

        {/* Game Controls */}
        <footer className="p-4 pt-16 flex justify-center gap-4">
          <Link 
            href="/"
            className="relative px-12 py-4 text-center text-xl font-bokor transition-all
              bg-[url('/ui/Button_RL_Background.png')] hover:bg-[url('/ui/Button_RL_Hover.png')] 
              bg-[length:100%_100%] bg-no-repeat bg-center min-w-[300px]
              cursor-pointer hover:scale-[1.02] group"
          >
            <span className="relative text-stone-100 group-hover:text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.5)]">
              Back to Menu
            </span>
          </Link>
        </footer>
      </div>
    </div>
  )
}