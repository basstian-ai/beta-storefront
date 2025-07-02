import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function fetchDummyJSON(limit = 100, tries = 3) {
  const url = `https://dummyjson.com/products?limit=${limit}`;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { timeout: 10_000 });
      if (r.ok) return r.json();
    } catch {}
    await new Promise((res) => setTimeout(res, 1_000 * (i + 1)));
  }
  throw new Error('❌ DummyJSON fetch failed after retries');
}

const categories = [
  { slug: 'beauty', name: 'Beauty' },
  { slug: 'fragrances', name: 'Fragrances' },
  { slug: 'furniture', name: 'Furniture' },
  { slug: 'groceries', name: 'Groceries' },
  { slug: 'home-decoration', name: 'Home Decoration' },
  { slug: 'kitchen-accessories', name: 'Kitchen Accessories' },
  { slug: 'laptops', name: 'Laptops' },
  { slug: 'mens-shirts', name: 'Mens Shirts' },
  { slug: 'mens-shoes', name: 'Mens Shoes' },
  { slug: 'mens-watches', name: 'Mens Watches' },
  { slug: 'mobile-accessories', name: 'Mobile Accessories' },
  { slug: 'motorcycle', name: 'Motorcycle' },
  { slug: 'skin-care', name: 'Skin Care' },
  { slug: 'smartphones', name: 'Smartphones' },
  { slug: 'sports-accessories', name: 'Sports Accessories' },
  { slug: 'sunglasses', name: 'Sunglasses' },
  { slug: 'tablets', name: 'Tablets' },
  { slug: 'tops', name: 'Tops' },
  { slug: 'vehicle', name: 'Vehicle' },
  { slug: 'womens-bags', name: 'Womens Bags' },
  { slug: 'womens-dresses', name: 'Womens Dresses' },
  { slug: 'womens-jewellery', name: 'Womens Jewellery' },
  { slug: 'womens-shoes', name: 'Womens Shoes' },
  { slug: 'womens-watches', name: 'Womens Watches' },
];

async function main() {
  try {
    if (!process.env.CRYSTALLIZE_ACCESS_TOKEN_ID) {
      console.log('CRYSTALLIZE_ACCESS_TOKEN_ID not set, skipping');
      return;
    }

  const outDir = path.join('crystallize-import', 'items');
  const topicsDir = path.join('crystallize-import', 'topics');

  await Promise.all([
    fs.mkdir(outDir, { recursive: true }),
    fs.mkdir(topicsDir, { recursive: true }),
  ]);

  await fs.writeFile(
    path.join(topicsDir, 'categories.json'),
    JSON.stringify({ name: 'Categories', path: '/categories' }, null, 2),
    'utf8'
  );

  await fs.writeFile(
    path.join(topicsDir, 'index.json'),
    JSON.stringify(['categories.json'], null, 2),
    'utf8'
  );

  await Promise.all(
    categories.map((c) =>
      fs.writeFile(
        path.join(topicsDir, `${c.slug}.json`),
        JSON.stringify({ parent: '/categories', name: c.name, path: `/categories/${c.slug}` }, null, 2),
        'utf8'
      )
    )
  );

  const { products } = await fetchDummyJSON();
  if (!products?.length) throw new Error('❌ DummyJSON returned 0 products');
  const selected = products.slice(0, 100);

    for (const product of selected) {
    const slug = String(product.slug || product.title || product.name || product.id)
      .toLowerCase()
      .replace(/\s+/g, '-');

    const itemSpec = {
      tenantLanguage: 'en',
      name: product.title || product.name,
      shape: 'product',
      path: slug,
      priceVariants: { default: product.price || 0 },
      variants: [
        {
          sku: `SKU-${product.id}`,
          priceVariants: { default: product.price || 0 },
          stock: product.stock || 0,
          images: (product.images || []).map((url: string) => ({ url })),
        },
      ],
      components: {
        description: {
          json: [
            {
              type: 'paragraph',
              children: [
                {
                  text: product.description || '',
                },
              ],
            },
          ],
        },
      },
    };

    await fs.writeFile(
      path.join(outDir, `${slug}.json`),
      JSON.stringify(itemSpec, null, 2),
      'utf8'
    );
    }
    console.log(`📝 Wrote ${selected.length} item specs to crystallize-import/items/`);
    // After writing item specs, create index.json for bootstrapper
    const index = { items: selected.map((p) => `${String(p.slug || p.title || p.name || p.id).toLowerCase().replace(/\s+/g, '-')}.json`) };
    await fs.writeFile('crystallize-import/index.json', JSON.stringify(index, null, 2));
    console.log('✅ Wrote crystallize-import/index.json');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('DummyJSON fetch failed:', message);
    process.exit(1);
  }
}

main();
