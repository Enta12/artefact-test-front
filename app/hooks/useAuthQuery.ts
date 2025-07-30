'use client';

import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

export function useAuthQuery<T>(
  queryKey: unknown[],
  url: string,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    ...options,
  });
}

type MutationConfig = {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown; //TODO: use TData
};

export function useAuthMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => MutationConfig,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
) {
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (variables) => {
      const config = mutationFn(variables);
      const response = await fetch(config.url, {
        method: config.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: config.data ? JSON.stringify(config.data) : undefined,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (config.method === 'DELETE') {
        return undefined as TData;
      }

      return response.json();
    },
    ...options,
  });
} 