import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.sub);
    headers.set('x-user-role', payload.role);
    return NextResponse.next({ request: { headers } });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
