import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, CreateFolderData, UpdateFolderData } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-client';

// Get folders list
export function useFolders() {
  return useQuery({
    queryKey: queryKeys.folders,
    queryFn: () => apiClient.folders.list(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create folder mutation
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderData) => apiClient.folders.create(data),
    onSuccess: () => {
      // Invalidate and refetch folders
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
      // Also invalidate user query since folders are included
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

// Update folder mutation
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderData }) => 
      apiClient.folders.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

// Delete folder mutation
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.folders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      // Also invalidate emails since they may have moved to inbox
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}