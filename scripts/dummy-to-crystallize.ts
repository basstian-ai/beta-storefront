import { promises as fs } from 'fs';
import path from 'path';

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
  if (!process.env.CRYSTALLIZE_ACCESS_TOKEN_ID) {
    console.log('CRYSTALLIZE_ACCESS_TOKEN_ID not set, skipping');
    return;
  }

  const src = path.join('data', 'dummyProducts.json');
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

  await Promise.all(
    categories.map((c) =>
      fs.writeFile(
        path.join(topicsDir, `${c.slug}.json`),
        JSON.stringify({ parent: '/categories', name: c.name, path: `/categories/${c.slug}` }, null, 2),
        'utf8'
      )
    )
  );

  const raw = await fs.readFile(src, 'utf8');
  const data = JSON.parse(raw);
  const products = Array.isArray(data) ? data : data.products || [];

  for (const product of products) {
    const slug = String(product.slug || product.title || product.name || product.id)
      .toLowerCase()
      .replace(/\s+/g, '-');

    const itemSpec = {
      tenantLanguage: 'en',
      name: product.title || product.name,
      shape: 'Product',
      path: slug,
      priceVariants: { default: product.price || 0 },
      components: {
        description: {
          content: { plainText: product.description || '' },
        },
        price: {
          priceVariants: [
            {
              identifier: 'default',
              price: product.price || 0,
              currency: 'USD',
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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
