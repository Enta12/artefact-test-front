'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface LoginResponse {
  access_token: string;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Échec de la connexion');
      }

      const data: LoginResponse = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/dashboard');
    },
  });

  const register = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: `${credentials.firstName} ${credentials.lastName}`,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Échec de l\'inscription');
      }

      const data: LoginResponse = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/dashboard');
    },
  });

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    queryClient.clear();
    router.push('/auth');
  };

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error('Échec de la récupération du profil');
      }

      return response.json();
    },
  });

  return {
    user,
    isLoadingUser,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
} 