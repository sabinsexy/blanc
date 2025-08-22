import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, CreateEmailData, UpdateEmailData } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-client';

// Get emails list
export function useEmails(folderId?: string, query?: string) {
  return useQuery({
    queryKey: queryKeys.emails(folderId, query),
    queryFn: () => apiClient.emails.list({ folderId, query }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get emails with infinite scroll
export function useInfiniteEmails(folderId?: string, query?: string) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.emails(folderId, query), 'infinite'],
    queryFn: ({ pageParam = 0 }) => 
      apiClient.emails.list({ 
        folderId, 
        query, 
        offset: pageParam, 
        limit: 50 
      }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 50 ? pages.length * 50 : undefined;
    },
    initialPageParam: 0,
  });
}

// Get single email
export function useEmail(id: string) {
  return useQuery({
    queryKey: queryKeys.email(id),
    queryFn: () => apiClient.emails.get(id),
    staleTime: 1000 * 60 * 10, // 10 minutes - emails don't change often
  });
}

// Send email mutation
export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmailData) => apiClient.emails.create(data),
    onSuccess: (newEmail) => {
      // Invalidate emails queries to refetch
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      
      // Update the specific folder query if we know which folder
      if (newEmail.folderId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.emails(newEmail.folderId) 
        });
      }
    },
  });
}

// Update email mutation (read status, star, move folder)
export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailData }) => 
      apiClient.emails.update(id, data),
    onSuccess: (updatedEmail) => {
      // Update the email in cache
      queryClient.setQueryData(queryKeys.email(updatedEmail.id), updatedEmail);
      
      // Invalidate emails list queries
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

// Delete email mutation
export function useDeleteEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.emails.delete(id),
    onSuccess: (_, emailId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.email(emailId) });
      
      // Invalidate emails list queries
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

// Optimistic update for read status
export function useToggleEmailRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => 
      apiClient.emails.update(id, { isRead }),
    onMutate: async ({ id, isRead }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.email(id) });

      // Snapshot the previous value
      const previousEmail = queryClient.getQueryData(queryKeys.email(id));

      // Optimistically update to the new value
      if (previousEmail) {
        queryClient.setQueryData(queryKeys.email(id), {
          ...previousEmail,
          isRead,
        });
      }

      return { previousEmail };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEmail) {
        queryClient.setQueryData(queryKeys.email(id), context.previousEmail);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.email(id) });
    },
  });
}

// Optimistic update for star status
export function useToggleEmailStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isStarred }: { id: string; isStarred: boolean }) => 
      apiClient.emails.update(id, { isStarred }),
    onMutate: async ({ id, isStarred }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.email(id) });
      const previousEmail = queryClient.getQueryData(queryKeys.email(id));

      if (previousEmail) {
        queryClient.setQueryData(queryKeys.email(id), {
          ...previousEmail,
          isStarred,
        });
      }

      return { previousEmail };
    },
    onError: (err, { id }, context) => {
      if (context?.previousEmail) {
        queryClient.setQueryData(queryKeys.email(id), context.previousEmail);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.email(id) });
    },
  });
}