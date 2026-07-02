import React, { useState } from 'react';
import { initiateOAuthFlow } from '../lib/oauth';

interface LoginFormProps { onSuccess: (token: string) => void; }

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const login = async (provider: 'google' | 'github') => {
    setLoading(provider);
    setError('');
    try {
      const url = await initiateOAuthFlow({
        provider,
        clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!,
        clientSecret: '',
        redirectUri: `${window.location.origin}/auth/callback`,
      });
      window.location.href = url;
    } catch {
      setError('Login failed. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button onClick={() => login('google')} disabled={!!loading} className="btn btn-primary w-full">
        {loading === 'google' ? 'Redirecting...' : 'Continue with Google'}
      </button>
      <button onClick={() => login('github')} disabled={!!loading} className="btn btn-secondary w-full">
        {loading === 'github' ? 'Redirecting...' : 'Continue with GitHub'}
      </button>
    </div>
  );
}
