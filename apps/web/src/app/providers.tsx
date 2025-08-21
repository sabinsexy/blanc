'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { ApolloClientProvider } from '@/lib/apollo-provider';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ApolloClientProvider>
          {children}
        </ApolloClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}