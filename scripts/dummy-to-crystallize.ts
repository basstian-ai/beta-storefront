import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  if (!process.env.CRYSTALLIZE_ACCESS_TOKEN_ID) {
    console.log('CRYSTALLIZE_ACCESS_TOKEN_ID not set, skipping');
    return;
  }

  const src = path.join('data', 'dummyProducts.json');
  const outDir = path.join('crystallize-import', 'items');
  await fs.mkdir(outDir, { recursive: true });

  const raw = await fs.readFile(src, 'utf8');
  const data = JSON.parse(raw);
  const products = Array.isArray(data) ? data : data.products || [];

  for (const product of products) {
    const slug = String(product.slug || product.title || product.name || product.id)
      .toLowerCase()
      .replace(/\s+/g, '-');

    const itemSpec = {
      name: product.title || product.name,
      shape: 'Product',
      path: slug,
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
