import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { metaMask, walletConnect, baseAccount } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    // MetaMask connector
    metaMask(),

    // Coinbase Base Account connector
    baseAccount({
      appName: "Blanc",
    }),

    // WalletConnect connector
    ...(process.env.NEXT_PUBLIC_WC_PROJECT_ID
      ? [
          walletConnect({
            projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
            metadata: {
              name: "Blanc",
              description: "Blanc Application",
              url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              icons: [],
            },
            showQrModal: true, // Enable built-in modal temporarily to test
            qrModalOptions: {
              themeMode: "light",
            },
          }),
        ]
      : []),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});
