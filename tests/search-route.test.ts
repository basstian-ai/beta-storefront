import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../src/lib/search', () => ({
  searchSvc: { search: vi.fn().mockResolvedValue({ hits: [], found: 0 }) },
}));

import { GET } from '../src/app/api/search/route';
import { searchSvc } from '../src/lib/search';

describe('GET /api/search', () => {
  it('sanitizes filter params', async () => {
    const req = new NextRequest('https://example.com/api/search?q=test&brand=foo%20:*');
    await GET(req);
    expect(searchSvc.search).toHaveBeenCalledWith('test', expect.objectContaining({
      filters: 'brand:=foo%20%3A*',
    }));
  });
});
