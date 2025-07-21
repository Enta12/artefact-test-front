'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export function useAuthQuery<TData>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  const { fetchWithAuth } = useAuth();

  return useQuery<TData, Error>({
    queryKey: key,
    queryFn: async () => {
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la requête');
      }
      return response.json();
    },
    ...options,
  });
} 