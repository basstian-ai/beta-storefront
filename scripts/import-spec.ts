import { Bootstrapper, type BootstrapperContext } from '@crystallize/import-utilities';
import fs from 'fs/promises';

async function main() {
  const context: BootstrapperContext = {
    tenantId: process.env.CRYSTALLIZE_TENANT_IDENTIFIER ?? process.env.CRYSTALLIZE_TENANT_ID,
    accessTokenId: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID!,
    accessTokenSecret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET!,
    logLevel: 'info',
    spec: {
      shapes: './crystallize-import/shapes',
      items: './crystallize-import/items',
      topics: './crystallize-import/topics',
      priceVariants: './crystallize-import/priceVariants.json',
    },
  };

  const bootstrapper = new Bootstrapper();
  await bootstrapper.setContext(context);
  const result = await bootstrapper.bootstrap();

  const summary = {
    status: 'ok',
    importedItems: result?.spec?.items?.length ?? 0,
  };

  await fs.writeFile('import.json', JSON.stringify(summary, null, 2));
  console.log('✅ Import completed:', summary);
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
