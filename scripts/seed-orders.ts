import { put } from '@vercel/blob';
import orders from '../data/dummyOrders.json';

async function main() {
  await put('orders/demo-orders.json', JSON.stringify(orders), { access: 'public' });
  console.log('Seeded demo orders \u2713');
}

main();
