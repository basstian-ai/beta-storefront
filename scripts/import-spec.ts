import { Bootstrapper } from '@crystallize/import-utilities';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { request } from 'undici';

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

  bootstrapper.on('item:after', ({ status, document }) => {
    if (status === 'created') console.log(`✅  ${document.name}`);
    if (status === 'updated') console.log(`♻️  ${document.name}`);
  });

  await bootstrapper.start();

  // ensure Node exits: close idle sockets opened by undici
  request.close();

  const summary = {
    itemsCreated: spec.items?.length ?? 0,
    itemsUpdated: 0,
    shapesCreated: spec.shapes?.length ?? 0,
    shapesUpdated: 0,
  };
  process.stdout.write(JSON.stringify(summary) + '\n');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
