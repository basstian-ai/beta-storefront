import { Bootstrapper, type JSONSpec } from '@crystallize/import-utilities';
import fs from 'fs/promises';

async function main() {
  const tenant = process.env.CRYSTALLIZE_TENANT_IDENTIFIER || process.env.CRYSTALLIZE_TENANT_ID;
  const id = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
  const secret = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;
  if (!tenant || !id || !secret) throw new Error('Missing Crystallize tokens');

  let spec: JSONSpec;
  try {
    const raw = await fs.readFile('crystallize-import/index.json', 'utf-8');
    console.log('🔍 Raw index.json size:', raw.length);
    spec = JSON.parse(raw);
    console.log('📦 Parsed spec items:', (spec as any).items?.length);
  } catch (err) {
    console.error('❌ Error reading/parsing index.json:', err);
    process.exit(1);
  }

  if (!(spec as any)?.items?.length) {
    console.error('❌ Spec JSON missing items array or empty');
    process.exit(1);
  }

  const bootstrapper = new Bootstrapper();
  bootstrapper.setAccessToken(id, secret);
  bootstrapper.setTenantIdentifier(tenant);
  bootstrapper.setSpec(spec);

  try {
    console.log('🚀 Starting import...');
    await bootstrapper.start();
    await bootstrapper.kill();
    console.log('✅ Import completed successfully');
    console.log(JSON.stringify({ success: true, count: (spec as any).items.length }));
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('🐞 Unexpected error:', err);
  process.exit(1);
});
