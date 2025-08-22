import { useQuery } from '@tanstack/react-query';
import { apiClient, User } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-client';

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => apiClient.user.getCurrent(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.message?.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}