import { Bootstrapper, type JSONSpec } from '@crystallize/import-utilities';
import { readFile } from 'fs/promises';
import { join } from 'node:path';

async function main() {
  const tenant =
    process.env.CRYSTALLIZE_TENANT_IDENTIFIER ||
    process.env.CRYSTALLIZE_TENANT_ID;
  const id = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
  const secret = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;

  if (!tenant || !id || !secret) {
    throw new Error('Missing Crystallize environment variables.');
  }

  const specPath = join('crystallize-import', 'index.json');
  const raw = await readFile(specPath, 'utf-8');
  const spec: JSONSpec = JSON.parse(raw);

  const bootstrapper = new Bootstrapper();
  bootstrapper.setAccessToken(id, secret);
  bootstrapper.setTenantIdentifier(tenant);
  bootstrapper.setSpec(spec);

  await bootstrapper.start();
  await bootstrapper.kill();

  console.log('✅ Import completed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
