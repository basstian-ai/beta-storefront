import { searchSvc } from '../src/lib/search';

async function run() {
  const res = await fetch('http://localhost:3000/api/bff/products?all=true');
  if (!res.ok) throw new Error(`Failed fetch: ${res.status}`);
  const data = await res.json();
  const products = data.items || data.products || [];
  await searchSvc.indexProducts(products);
  console.log(`Indexed ${products.length} products`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
