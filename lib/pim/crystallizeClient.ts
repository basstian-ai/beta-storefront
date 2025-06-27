import { createClient } from '@crystallize/js-api-client';

export const crystallize = createClient({
  tenantIdentifier: process.env.CRYSTALLIZE_TENANT_IDENTIFIER!,
  accessTokenId:     process.env.CRYSTALLIZE_ACCESS_TOKEN_ID!,
  accessTokenSecret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET!,
});
