import AuthButton from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChainSelection } from "./chain-selection";
export function Header() {
  return (
    <header className="w-full flex justify-center py-2">
      <div className="flex justify-end fixed top-4 right-4 z-10 gap-2">
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
