import { Bootstrapper, loadSpecFromPath } from '@crystallize/import-utilities';
import { resolve } from 'node:path';

async function main() {
  const tenant =
    process.env.CRYSTALLIZE_TENANT_IDENTIFIER ||
    process.env.CRYSTALLIZE_TENANT_ID;
  if (!tenant) {
    throw new Error('Missing CRYSTALLIZE_TENANT_IDENTIFIER/ID');
  }

  const spec = await loadSpecFromPath(resolve('crystallize-import'));

  const bootstrapper = new Bootstrapper({
    tenantIdentifier: tenant,
    accessTokenId: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID ?? '',
    accessTokenSecret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET ?? '',
    config: {
      publish: true,
      languages: ['en'],
    },
  });

  bootstrapper.setSpec(spec);
  const summary = await bootstrapper.start();
  process.stdout.write(JSON.stringify(summary) + '\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
