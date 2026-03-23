import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setTokens } from '@/api/client';
import { PageSpinner } from '@/components/ui/Spinner';

/**
 * AuthCallback — receives Google OAuth tokens from the backend redirect:
 *   /auth/callback?access_token=<jwt>&refresh_token=<jwt>
 *
 * On error the backend redirects to /login?error=<code> instead, so this
 * page only handles the success path. If the tokens are missing for any
 * reason we fall back to /login.
 */
export function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const access = params.get('access_token');
    const refresh = params.get('refresh_token');

    if (access && refresh) {
      setTokens(access, refresh);
      navigate('/app', { replace: true });
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [navigate, params]);

  return <PageSpinner />;
}
