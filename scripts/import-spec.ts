import { Bootstrapper } from '@crystallize/import-utilities';

async function main() {
  const tenant =
    process.env.CRYSTALLIZE_TENANT_IDENTIFIER ||
    process.env.CRYSTALLIZE_TENANT_ID;
  if (!tenant) {
    throw new Error('Missing CRYSTALLIZE_TENANT_IDENTIFIER/ID');
  }

  const bootstrapper = new Bootstrapper({
    tenantIdentifier: tenant,
    accessTokenId: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID ?? '',
    accessTokenSecret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET ?? '',
    config: {
      publish: true,
      languages: ['en'],
    },
  });

  await bootstrapper.setPath('crystallize-import');
  await bootstrapper.run();

  process.stdout.write(
    JSON.stringify(bootstrapper.getStatusSummary()) + '\n',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
