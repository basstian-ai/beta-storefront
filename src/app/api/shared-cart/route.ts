import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCart, addOrUpdateItems, setStatus } from '@/lib/services/sharedCart';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

async function getCompanyId() {
  const session = await getServerSession(authOptions);
  return session?.companyId || session?.user?.companyId || null;
}

export async function GET() {
  const companyId = await getCompanyId();
  if (!companyId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
  const cart = await getCart(companyId);
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const companyId = await getCompanyId();
  if (!companyId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const { items, contributor } = body as { items?: unknown; contributor?: string };
    const cart = await addOrUpdateItems(companyId, items, contributor);
    return NextResponse.json(cart);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }
    console.error('Shared cart POST error', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const companyId = await getCompanyId();
  if (!companyId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const { status } = body as { status?: unknown };
    const cart = await setStatus(companyId, status);
    return NextResponse.json(cart);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }
    console.error('Shared cart PATCH error', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
