// src/app/api/orders/[id]/route.ts
import { fetchCartById } from "@/lib/services/dummyjson";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const cart = await fetchCartById(id);

  if (!cart) {
    return NextResponse.json({ message: "Cart not found" }, { status: 404 });
  }

  return NextResponse.json(cart);
}
