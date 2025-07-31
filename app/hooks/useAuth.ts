'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../context/useAuthContext';
import { useAuthMutation } from './useAuthQuery';
import { User } from '../types/auth';

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
  const { user, setUser  } = useAuthContext();
  
  
  const fetchCurrentUser = async (): Promise<User> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: 'include',
    });
  
    if (!response.ok) {
      throw new Error(response.status === 401 ? 'Unauthorized' : 'Failed to fetch user data');
    }
  
    return response.json();
  };

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Failed to login');
      }
      const user = await fetchCurrentUser();
      setUser(user);
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const register = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
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
        throw new Error('Failed to register');
      }
      const user = await fetchCurrentUser();
      setUser(user);
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const logout = useAuthMutation(
    () => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
      method: 'POST',
    }),
    {
      onSuccess: () => {
        queryClient.clear();
        router.push('/auth');
        setUser(null);
      },
    }
  );



  return {
    user,
    login,
    register,
    logout: logout.mutate
  };
} 