import AuthButton from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChainSelection } from "./chain-selection";
import Link from "next/link";
import { ChartBar } from "lucide-react";
export function Header() {
  return (
    <header className="w-full flex justify-center py-2">
      <div className="flex justify-end fixed top-4 right-4 z-10 gap-2 items-center">
        <Link href="/stats">
          <Button
            variant="default"
            size="sm"
            className="group border-yellow-600/30 hover:bg-yellow-500 hover:text-stone-900 hover:border-yellow-500 text-yellow-500"
          >
            <ChartBar className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            Game Statistics
          </Button>
        </Link>
        <AuthButton />
        <ChainSelection />
      </div>
      <div className="w-full max-w-[800px]">
        <Image
          src="/heavy_helms_header_drop_shadow.png"
          alt="Heavy Helms Header"
          width={800}
          height={266}
          className="w-full opacity-100"
          priority
        />
      </div>
    </header>
  );
}
