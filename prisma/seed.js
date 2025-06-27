import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const USERS = Array.from({ length: 20 }, (_, i) => i + 1);

async function main() {
  for (const id of USERS) {
    const res = await fetch(`https://dummyjson.com/carts/user/${id}`);
    if (!res.ok) continue;
    const data = await res.json();
    if (!data.carts?.length) continue;

    for (const c of data.carts) {
      await prisma.order.create({
        data: {
          id: c.id,
          userId: id,
          total: c.total,
          items: {
            create: c.products.map((p) => ({
              productId: p.id,
              title: p.title,
              price: p.price,
              quantity: p.quantity,
            })),
          },
        },
      });
    }
  }
}

main().catch((e) => console.error(e)).finally(() => prisma.$disconnect());
