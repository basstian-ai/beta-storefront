import { describe, it, expect } from 'vitest';
import { absoluteUrl } from './absoluteUrl';

describe('absoluteUrl', () => {
  it('uses forwarded headers when present', () => {
    const req = {
      headers: {
        'x-forwarded-host': 'preview.example.com',
        'x-forwarded-proto': 'https'
      }
    };
    expect(absoluteUrl(req, '/api/foo')).toBe('https://preview.example.com/api/foo');
  });

  it('falls back to host header', () => {
    const req = {
      headers: {
        host: 'localhost:3000'
      }
    };
    expect(absoluteUrl(req, '/api/foo')).toBe('http://localhost:3000/api/foo');
  });

  it('uses localhost when no headers present', () => {
    const req = { headers: {} };
    expect(absoluteUrl(req, '/api/foo')).toBe('http://localhost:3000/api/foo');
  });
});

