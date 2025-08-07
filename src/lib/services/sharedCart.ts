import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { CartItem } from '@/types/order';

export interface SharedCart {
  items: CartItem[];
  status: string;
  contributors?: string[];
}

const baseDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const filePath = path.join(baseDir, 'companyHistory.json');

const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number(),
});

const itemsSchema = z.object({
  items: z.array(cartItemSchema),
});

const statusSchema = z.object({
  status: z.string(),
});

async function readHistory(): Promise<Record<string, SharedCart>> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as Record<string, SharedCart>;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      return {};
    }
    throw err;
  }
}

async function writeHistory(history: Record<string, SharedCart>): Promise<void> {
  await fs.mkdir(baseDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(history), 'utf8');
}

export async function getCart(companyId: string): Promise<SharedCart> {
  const history = await readHistory();
  return history[companyId] ?? { items: [], status: 'draft', contributors: [] };
}
export async function addOrUpdateItems(
  companyId: string,
  items: unknown,
  contributor?: string,
): Promise<SharedCart> {
  const { items: validated } = itemsSchema.parse({ items });
  const history = await readHistory();
  const cart = history[companyId] ?? { items: [], status: 'draft', contributors: [] };

  for (const item of validated) {
    const index = cart.items.findIndex((i) => i.productId === item.productId);
    if (index !== -1) {
      if (item.quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = item.quantity;
      }
    } else if (item.quantity > 0) {
      cart.items.push(item);
    }
  }

  if (contributor) {
    cart.contributors = cart.contributors || [];
    cart.contributors = [contributor, ...cart.contributors.filter((c) => c !== contributor)].slice(0, 3);
  }

  history[companyId] = cart;
  await writeHistory(history);
  return cart;
}

export async function setStatus(companyId: string, status: unknown): Promise<SharedCart> {
  const { status: validated } = statusSchema.parse({ status });
  const history = await readHistory();
  const cart = history[companyId] ?? { items: [], status: 'draft', contributors: [] };
  cart.status = validated;
  history[companyId] = cart;
  await writeHistory(history);
  return cart;
}
