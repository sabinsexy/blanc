import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query keys for consistent cache management
export const queryKeys = {
  user: ['user'] as const,
  emails: (folderId?: string, query?: string) => 
    ['emails', { folderId, query }] as const,
  email: (id: string) => ['emails', id] as const,
  folders: ['folders'] as const,
  aliases: ['aliases'] as const,
};