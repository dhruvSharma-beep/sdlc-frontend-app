import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCode, fetchOAuthUser, type Provider } from '@/lib/auth/oauth';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const ALLOWED: Provider[] = ['google', 'github'];

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider as Provider;
  if (!ALLOWED.includes(provider)) return NextResponse.redirect(`/login?error=unknown_provider`);

  const url   = new URL(req.url);
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) return NextResponse.redirect(`/login?error=${oauthError}`);

  // CSRF: validate state against cookie
  const stored = (await cookies()).get('oauth_state')?.value;
  if (!state || !stored || state !== stored) return NextResponse.redirect('/login?error=state_mismatch');
  if (!code) return NextResponse.redirect('/login?error=no_code');

  try {
    const { accessToken } = await exchangeCode(provider, code);
    const info = await fetchOAuthUser(provider, accessToken);

    const user = await prisma.user.upsert({
      where:  { email: info.email },
      update: { name: info.name, lastLoginAt: new Date() },
      create: { email: info.email, name: info.name, role: 'developer', isActive: true, lastLoginAt: new Date() },
    });

    const token = jwt.sign({ sub: user.id, email: user.email, role: (user as any).role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    res.cookies.set('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 604800 });
    res.cookies.delete('oauth_state');
    return res;
  } catch (err: any) {
    console.error(`[oauth:${provider}]`, err.message);
    return NextResponse.redirect('/login?error=oauth_failed');
  }
}