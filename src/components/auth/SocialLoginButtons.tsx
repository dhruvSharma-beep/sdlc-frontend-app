'use client';
import { useState } from 'react';
import { buildAuthUrl, generateState, type Provider } from '@/lib/auth/oauth';

const PROVIDERS = [
  { id: 'google' as Provider, label: 'Continue with Google', className: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' },
  { id: 'github' as Provider, label: 'Continue with GitHub', className: 'bg-gray-900 text-white hover:bg-gray-800' },
];

export function SocialLoginButtons() {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error,   setError]   = useState('');

  const login = async (provider: Provider) => {
    setPending(provider); setError('');
    try {
      const state = generateState();
      document.cookie = `oauth_state=${state}; path=/; max-age=600; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
      window.location.href = buildAuthUrl(provider, state);
    } catch { setError('Login unavailable — please try again.'); setPending(null); }
  };

  return (
    <div className="space-y-2.5">
      {error && <p className="text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2 border border-red-200">{error}</p>}
      {PROVIDERS.map(({ id, label, className }) => (
        <button key={id} onClick={() => login(id)} disabled={!!pending}
          className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${className} disabled:opacity-50 disabled:cursor-not-allowed`}>
          {pending === id ? 'Redirecting…' : label}
        </button>
      ))}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-gray-400">or email</span></div>
      </div>
    </div>
  );
}