import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Helper function to fetch a single page of products
async function fetchProductPage(limit: number, skip: number, tries = 3) {
  const url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
  for (let i = 0; i < tries; i++) {
    try {
      const response = await fetch(url, { timeout: 10_000 });
      if (response.ok) {
        return response.json() as Promise<{ products: any[]; total: number; skip: number; limit: number }>;
      }
      console.error(`Failed to fetch page: ${url}, status: ${response.status}`);
    } catch (e) {
      console.error(`Error fetching page: ${url}, attempt ${i + 1}/${tries}`, e);
    }
    if (i < tries - 1) {
      await new Promise((res) => setTimeout(res, 1_000 * (i + 1)));
    }
  }
  throw new Error(`❌ DummyJSON fetch failed for page (limit=${limit}, skip=${skip}) after ${tries} retries`);
}

async function fetchAllDummyProducts() {
  let allProducts: any[] = [];
  let fetchedCount = 0;
  let totalProducts = 0;
  const limit = 100; // Max limit per dummyjson.com API

  try {
    // First call to get the total
    const initialData = await fetchProductPage(limit, 0);
    allProducts = allProducts.concat(initialData.products);
    fetchedCount = initialData.products.length;
    totalProducts = initialData.total;
    console.log(`Initial fetch: got ${fetchedCount} of ${totalProducts} products.`);

    while (fetchedCount < totalProducts) {
      console.log(`Fetching next page, current count: ${fetchedCount}, total: ${totalProducts}`);
      const nextPageData = await fetchProductPage(limit, fetchedCount);
      if (nextPageData.products.length === 0) {
        console.warn('Received empty products array on a subsequent fetch, stopping.');
        break; // Avoid infinite loops if API behaves unexpectedly
      }
      allProducts = allProducts.concat(nextPageData.products);
      fetchedCount += nextPageData.products.length;
      console.log(`Fetched page: got ${nextPageData.products.length} products. Total now: ${fetchedCount}`);
    }

    console.log(`Finished fetching. Total products retrieved: ${allProducts.length}`);
    return allProducts;
  } catch (err) {
    console.warn('Failed to fetch from dummyjson.com, falling back to local dataset.', err);
    try {
      const fallbackPath = path.resolve(process.cwd(), 'data', 'dummyProducts.json');
      const fileData = await fs.readFile(fallbackPath, 'utf-8');
      const localProducts = JSON.parse(fileData);
      console.log(`Loaded ${localProducts.length} products from local file.`);
      return localProducts.slice(0, limit);
    } catch (e) {
      console.error('Failed to load local fallback data', e);
      throw err;
    }
  }
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

  const allProducts = await fetchAllDummyProducts();
  if (!allProducts?.length) throw new Error('❌ DummyJSON returned 0 products after attempting to fetch all.');

  // Process all fetched products
  const productsToProcess = allProducts;

  console.log(`Processing ${productsToProcess.length} products.`);

    for (const product of productsToProcess) {
    const slug = String(product.title || product.name || product.id)
      .toLowerCase()
      .replace(/\s+/g, '-');

    const itemSpec: any = {
      name: product.title || product.name, // Main product name
      tenantLanguage: 'en',
      shape: 'beta-storefront', // Explicitly use the beta-storefront shape
      path: `/${slug}`,
      components: {
        title: product.title || '', // Added title component
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
        brand: product.brand || '', // Added brand component
        thumbnail: product.thumbnail ? [{ url: product.thumbnail }] : [], // Product-level thumbnail
      },
      variants: [
        {
          name: product.title || product.name, // Variant name (remains at root)
          isDefault: true, // (remains at root)
          priceVariants: { default: product.price || 0 }, // (remains at root)
          // stockLocations: [{ identifier: 'default', stock: product.stock || 0 }], // REMOVED as per user feedback
          // SKU, images, and stock are now moved into the components object below
          components: {
            sku: `SKU-${product.id}`, // SKU moved into components
            images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [], // Images moved into components
            stock: product.stock || 0, // Stock (numeric) added to components
            // attributes key is now omitted as it would be an empty array
          },
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
    console.log(`📝 Wrote ${productsToProcess.length} item specs to crystallize-import/items/`);

    // Update index.json to include all generated item filenames
    const itemFilenames = productsToProcess.map((p) => {
        const productSlug = String(p.title || p.name || p.id).toLowerCase().replace(/\s+/g, '-');
        return `${productSlug}.json`;
    });
    const index = { items: itemFilenames };

    await fs.writeFile(path.resolve(baseImportDir, 'index.json'), JSON.stringify(index, null, 2));
    console.log(`✅ Wrote crystallize-import/index.json for ${itemFilenames.length} items.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error in main execution:', message);
    process.exit(1);
  }
}

main();
