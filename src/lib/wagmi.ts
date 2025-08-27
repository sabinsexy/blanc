import { createConfig, http } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum],
  connectors: [
    injected(),
    ...(process.env.NEXT_PUBLIC_WC_PROJECT_ID
      ? [
          walletConnect({
            projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
          }),
        ]
      : []),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});
