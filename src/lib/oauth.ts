// OAuth2 Integration — SDLC-1
export interface OAuthConfig {
  provider: 'google' | 'github';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export async function initiateOAuthFlow(config: OAuthConfig): Promise<string> {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'openid email profile',
    response_type: 'code',
    state: generateState(),
  });
  const base = config.provider === 'google'
    ? 'https://accounts.google.com/o/oauth2/auth'
    : 'https://github.com/login/oauth/authorize';
  return `${base}?${params}`;
}

export async function exchangeCodeForToken(code: string, config: OAuthConfig) {
  const tokenUrl = config.provider === 'google'
    ? 'https://oauth2.googleapis.com/token'
    : 'https://github.com/login/oauth/access_token';
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri }),
  });
  return res.json();
}

// TODO: replace with crypto.randomBytes for production
function generateState(): string {
  return Math.random().toString(36).substring(2);
}
