export function absoluteUrl(
  req: { headers: Record<string, string | string[] | undefined> },
  path = ''
): string {
  const host =
    (req.headers['x-forwarded-host'] ?? req.headers['host']) ?? 'localhost:3000';
  let protocol: string | undefined;
  const protoHeader =
    req.headers['x-forwarded-proto'] ?? req.headers['x-forwarded-protocol'];
  if (Array.isArray(protoHeader)) {
    protocol = protoHeader[0];
  } else if (typeof protoHeader === 'string') {
    protocol = protoHeader.split(',')[0];
  }
  if (!protocol) {
    protocol = host.includes('localhost') ? 'http' : 'https';
  }
  return `${protocol}://${host}${path}`;
}

