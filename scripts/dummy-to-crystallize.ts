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
  // Select only product with ID 5 ("Essence Mascara Lash Princess") for testing
  const targetProductId = 5;
  const singleProduct = products.find((p: any) => p.id === targetProductId);
  const selected = singleProduct ? [singleProduct] : [];

  if (selected.length === 0) {
    throw new Error(`❌ Could not find product with ID ${targetProductId} for simplified test.`);
  }
  // --- END SIMPLIFICATION ---

    for (const product of selected) { // This loop will now run only once
    const slug = String(product.title || product.name || product.id)
      .toLowerCase()
      .replace(/\s+/g, '-');

    const itemSpec: any = {
      name: product.title || product.name, // Main product name
      tenantLanguage: 'en',
      shape: 'beta-storefront', // Explicitly use the beta-storefront shape
      path: `/${slug}`,
      components: {
        // 'title' component (ID: title) omitted due to restrictive regex pattern
        description: {
          json: [
            {
              type: 'paragraph',
              children: [
                {
                  text: product.description || 'No description available.',
                },
              ],
            },
          ],
        },
        // 'brand' component (ID: brand) omitted due to restrictive regex pattern
        thumbnail: product.thumbnail ? [{ url: product.thumbnail }] : [], // Product-level thumbnail
      },
      variants: [
        {
          name: product.title || product.name, // Variant name
          sku: `SKU-${product.id}`, // Standard SKU field
          isDefault: true,
          priceVariants: { default: product.price || 0 },
          stockLocations: [{ identifier: 'default', stock: product.stock || 0 }],
          images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [], // Variant images
        },
      ],
    };

    // Removed special handling for product.id === 1 as we are targeting a specific product (ID 5)
    // and want its natural data to be used.

    const itemFilePath = path.join(outDir, `${slug}.json`);
    console.log(`Attempting to write item spec to: ${itemFilePath}`);

    await fs.writeFile(
      itemFilePath,
      JSON.stringify(itemSpec, null, 2),
      'utf8'
    );

    // Verify file existence immediately after writing
    try {
      await fs.access(itemFilePath, fs.constants.F_OK); // Check for existence
      console.log(`File ${itemFilePath} exists and is accessible after write.`);
    } catch (e) {
      console.error(`File not found or not accessible immediately after writing: ${itemFilePath}`, e);
      throw new Error(`File not found or not accessible immediately after writing: ${itemFilePath}`);
    }
    }
    console.log(`📝 Wrote ${selected.length} (simplified) item spec to crystallize-import/items/`);

    // Update index.json for the single item
    const itemFilenames = selected.map((p) => {
        // Ensure consistent slug generation for filenames as used when writing item files
        const productSlug = String(p.title || p.name || p.id).toLowerCase().replace(/\s+/g, '-');
        // Removed special handling for p.id === 1 to ensure the filename is always derived from the actual product's slug
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
