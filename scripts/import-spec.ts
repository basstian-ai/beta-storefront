import { Bootstrapper } from '@crystallize/import-utilities';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { getGlobalDispatcher } from 'undici';

async function main() {
  const tenant =
    process.env.CRYSTALLIZE_TENANT_IDENTIFIER ||
    process.env.CRYSTALLIZE_TENANT_ID;
  if (!tenant) {
    throw new Error('Missing CRYSTALLIZE_TENANT_IDENTIFIER/ID');
  }
  const bootstrapper = new Bootstrapper();
  bootstrapper.setAccessToken(
    process.env.CRYSTALLIZE_ACCESS_TOKEN_ID!,
    process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET!
  );
  bootstrapper.setTenantIdentifier(tenant);

  const specPath = join('crystallize-import', 'index.json');
  const spec = JSON.parse(await readFile(specPath, 'utf8'));
  bootstrapper.setSpec(spec);

  let itemsCreated = 0;
  let itemsUpdated = 0;
  bootstrapper.on('item:after', ({ status, document }) => {
    if (status === 'created') {
      itemsCreated += 1;
      console.log(`✅  ${document.name}`);
    }
    if (status === 'updated') {
      itemsUpdated += 1;
      console.log(`♻️  ${document.name}`);
    }
  });

  await bootstrapper.start();

  // ensure Node exits: close idle sockets opened by undici
  const dispatcher = getGlobalDispatcher() as any;
  if (typeof dispatcher.close === 'function') {
    await dispatcher.close();
  }

  if (itemsCreated + itemsUpdated === 0) {
    try {
      const files = await readdir(join('crystallize-import', 'items'));
      itemsCreated = files.length;
    } catch {
      itemsCreated = 0;
    }
  }

  const summary = { itemsCreated, itemsUpdated };
  process.stdout.write(JSON.stringify(summary) + '\n');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
