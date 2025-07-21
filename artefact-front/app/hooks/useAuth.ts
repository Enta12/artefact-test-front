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


export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      console.log('Session expirée ou non authentifié');
      router.push('/auth');
      throw new Error('Session expirée');
    }

    return response;
  };

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log('Tentative de connexion...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        console.error('Erreur de connexion:', response.status);
        throw new Error('Échec de la connexion');
      }

      const data = await response.json();
      console.log('Connexion réussie');
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
        credentials: 'include',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: `${credentials.firstName} ${credentials.lastName}`,
        }),
      });

      if (!response.ok) {
        console.error('Erreur d\'inscription:', response.status);
        throw new Error('Échec de l\'inscription');
      }

      const data = await response.json();
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
      try {
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);
        if (!response.ok) {
          if (response.status === 401) {
            console.log('Non authentifié');
            return null;
          }
          throw new Error('Échec de la récupération du profil');
        }

        const userData = await response.json();
        console.log('Profil utilisateur récupéré', userData);
        return userData;
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }
    },
  });

  return {
    user,
    isLoadingUser,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    fetchWithAuth,
  };
} 