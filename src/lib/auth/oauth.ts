import { randomBytes } from 'crypto';

export type Provider = 'google' | 'github';

const ENDPOINTS = {
  google: { auth: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token', userInfo: 'https://www.googleapis.com/oauth2/v3/userinfo', scope: 'openid email profile' },
  github: { auth: 'https://github.com/login/oauth/authorize',     token: 'https://github.com/login/oauth/access_token',    userInfo: 'https://api.github.com/user',                          scope: 'read:user user:email' },
} as const;

export interface OAuthUser { providerAccountId: string; email: string; name: string; image?: string; provider: Provider; }

/** Must use crypto — Math.random() is NOT cryptographically secure (CWE-338) */
export function generateState(): string { return randomBytes(32).toString('hex'); }

export function buildAuthUrl(provider: Provider, state: string): string {
  const ep = ENDPOINTS[provider];
  const p  = new URLSearchParams({
    client_id:    process.env[`${provider.toUpperCase()}_CLIENT_ID`]!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${provider}`,
    scope: ep.scope, response_type: 'code', state,
    ...(provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : {}),
  });
  return `${ep.auth}?${p}`;
}

export async function exchangeCode(provider: Provider, code: string) {
  const ep  = ENDPOINTS[provider];
  const res = await fetch(ep.token, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`], client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`], code, redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${provider}`, grant_type: 'authorization_code' }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(`Token exchange failed: ${e.error_description ?? res.status}`); }
  const d = await res.json();
  return { accessToken: d.access_token as string, refreshToken: d.refresh_token as string | undefined };
}

export async function fetchOAuthUser(provider: Provider, accessToken: string): Promise<OAuthUser> {
  const ep  = ENDPOINTS[provider];
  const res = await fetch(ep.userInfo, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`User info fetch failed (${provider}): ${res.status}`);
  const d = await res.json();
  if (provider === 'google') return { providerAccountId: d.sub, email: d.email, name: d.name, image: d.picture, provider };
  // GitHub may have private email — fall back to emails endpoint
  let email: string = d.email;
  if (!email) {
    const r  = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}` } });
    const es = await r.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
    email = es.find(e => e.primary && e.verified)?.email ?? '';
  }
  if (!email) throw new Error('No verified email on GitHub account — ask user to make email public');
  return { providerAccountId: String(d.id), email, name: d.name ?? d.login, image: d.avatar_url, provider };
}