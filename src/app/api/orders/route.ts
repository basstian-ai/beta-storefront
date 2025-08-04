// src/app/api/orders/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchUserCarts } from "@/lib/services/dummyjson";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const carts = await fetchUserCarts(session.user.id);

  return NextResponse.json(carts);
}
