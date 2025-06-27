import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/search/route';

describe('GET /api/search', () => {
  it('returns results for a simple query', async () => {
    const req = new NextRequest('https://example.com/api/search?q=lipstick');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.hits.length).toBeGreaterThan(0);
  });

  it('handles empty query safely', async () => {
    const req = new NextRequest('https://example.com/api/search');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.hits).toEqual([]);
    expect(json.found || json.totalHits || 0).toBe(0);
  });
});
