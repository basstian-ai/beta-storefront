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

  const baseImportDir = path.resolve(process.cwd(), 'crystallize-import');
  const outDir = path.join(baseImportDir, 'items');
  const topicsDir = path.join(baseImportDir, 'topics');

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

  // --- START SIMPLIFICATION ---
  // Select only product with ID 1 (iPhone 9) for testing
  const singleProduct = products.find((p: any) => p.id === 1);
  const selected = singleProduct ? [singleProduct] : [];

  if (selected.length === 0) {
    throw new Error('❌ Could not find product with ID 1 (iPhone 9) for simplified test.');
  }
  // --- END SIMPLIFICATION ---

    for (const product of selected) { // This loop will now run only once
    const slug = String(product.title || product.name || product.id) // Prioritize title for slug, and ensure it's the iPhone 9
      .toLowerCase()
      .replace(/\s+/g, '-');

    const itemSpec: any = { // Use 'any' for flexibility during simplification
      tenantLanguage: 'en',
      name: product.title || product.name,
      shape: 'product', // Must match a shape identifier in Crystallize
      path: `/${slug}`,  // Ensure path starts with a slash
      // ExternalReference is often useful, ensure it's unique if used
      // externalReference: `dummyjson-${product.id}`,
      variants: [
        {
          sku: `SKU-${product.id}`,
          name: product.title || product.name, // Variant name
          priceVariants: { default: product.price || 0 },
          // Temporarily removing stock and images
          // stock: product.stock || 0,
          // images: (product.images || []).slice(0, 1).map((url: string) => ({ url })), // Limit to 1 image if re-enabled
        },
      ],
      // Temporarily removing components
      // components: {
      //   description: { // Assuming 'description' is the ID of a component in your 'product' shape
      //     json: [
      //       {
      //         type: 'paragraph',
      //         children: [
      //           {
      //             text: product.description || 'No description available.',
      //           },
      //         ],
      //       },
      //     ],
      //   },
      // },
    };

    // Ensure the path is exactly /iphone-9 for the test product
    if (product.id === 1) {
        itemSpec.path = '/iphone-9';
        itemSpec.name = 'iPhone 9'; // Ensure name is consistent for the test
        itemSpec.variants[0].sku = 'SKU-IPHONE9-TEST'; // Make SKU distinct for test
        itemSpec.variants[0].name = 'iPhone 9';
    }


    await fs.writeFile(
      path.join(outDir, `${slug}.json`), // Will be 'iphone-9.json'
      JSON.stringify(itemSpec, null, 2),
      'utf8'
    );
    }
    console.log(`📝 Wrote ${selected.length} (simplified) item spec to crystallize-import/items/`);

    // Update index.json for the single item
    const itemFilenames = selected.map((p) => {
        // Ensure consistent slug generation for filenames as used when writing item files
        const productSlug = String(p.title || p.name || p.id).toLowerCase().replace(/\s+/g, '-');
        if (p.id === 1) return 'iphone-9.json'; // Explicitly for iPhone 9 to match the forced slug
        return `${productSlug}.json`;
    });
    const index = { items: itemFilenames };

    await fs.writeFile(path.resolve(baseImportDir, 'index.json'), JSON.stringify(index, null, 2));
    console.log('✅ Wrote crystallize-import/index.json for the single simplified item');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('DummyJSON fetch failed:', message);
    process.exit(1);
  }
}

main();
