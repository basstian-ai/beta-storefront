import { searchSvc } from '../lib/search';

async function run() {
  const res = await fetch('http://localhost:3000/api/bff/products?all=true');
  if (!res.ok) throw new Error(`Failed fetch: ${res.status}`);
  const data = await res.json();
  const products = data.items || data.products || [];
  await searchSvc.indexProducts(products);
  console.log(`Imported ${products.length} documents into Typesense`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
