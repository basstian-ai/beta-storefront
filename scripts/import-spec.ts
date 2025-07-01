import { Bootstrapper } from '@crystallize/import-utilities';
import { readFile } from 'fs/promises';
import { join } from 'path';

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
  await bootstrapper.start();
  console.log(JSON.stringify(bootstrapper.getSummary()));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
