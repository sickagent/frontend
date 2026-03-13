import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { getMe } from '@/api/auth';
import { clearTokens, getAccessToken } from '@/api/client';
import type { Owner } from '@/api/types';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<Owner>({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: 5 * 60_000,
  });

  const logout = useCallback(() => {
    clearTokens();
    queryClient.clear();
    navigate('/login');
  }, [queryClient, navigate]);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('sickagent:unauthorized', handler);
    return () => window.removeEventListener('sickagent:unauthorized', handler);
  }, [logout]);

  return { user: user ?? null, isLoading, isAuthenticated: !!user, error, logout };
}
