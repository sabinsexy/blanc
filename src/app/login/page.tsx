import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { PhantomIcon } from "@/components/icons/phantom";
import { MetamaskIcon } from "@/components/icons/metamask";
import { CoinbaseIcon } from "@/components/icons/coinbase";
import { WalletConnectIcon } from "@/components/icons/walletconnect";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/blanc.svg"
            alt="Blanc"
            width={120}
            height={40}
            className="h-5 w-auto"
          />
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14">
                <PhantomIcon className="size-8 rounded-md" />
              </Button>
              <Button variant="outline" className="flex-1 h-14">
                <MetamaskIcon className="size-8 " />
              </Button>
              <Button variant="outline" className="flex-1 h-14">
                <CoinbaseIcon className="size-8 rounded-md" />
              </Button>
              <Button variant="outline" className="flex-1 h-14">
                <WalletConnectIcon className="size-9" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
