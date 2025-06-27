import productsData from '../../../data/dummyProducts.json';
import type { SearchService, SearchOpts } from './SearchService';
import type { ProductSearchResponse, ProductSearchHit } from './types';

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  slug?: string;
}

interface Dataset { products: Product[] }
const products: Product[] = (productsData as Dataset).products ?? [];

export class MockSearch implements SearchService {
  async indexProducts(): Promise<void> {
    // no-op for mock
  }

  async search(q: string, opts: SearchOpts = {}): Promise<ProductSearchResponse> {
    if (!q) {
      return { hits: [], found: 0, facet_counts: [], page: 1, per_page: opts.perPage ?? 20 };
    }
    const term = q.toLowerCase();
    const page = opts.page ?? 1;
    const perPage = opts.perPage ?? 20;

    let filtered = products.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );

    if (opts.filters) {
      const filters = opts.filters.split(' && ');
      for (const f of filters) {
        const [field, expr] = f.split(':=');
        const value = decodeURIComponent(expr);
        filtered = filtered.filter(p => (p as Record<string, unknown>)[field] === value);
      }
    }

    const total = filtered.length;
    const hits = filtered.slice((page - 1) * perPage, page * perPage).map(p => ({
      document: {
        id: String(p.id),
        name: p.title,
        slug: p.slug ?? '',
        description: p.description,
        category: p.category,
        brand: p.brand ?? '',
        price: p.price,
      }
    })) as ProductSearchHit[];

    const facetCounts: Record<string, Record<string, number>> = {
      brand: {},
      category: {}
    };
    for (const p of filtered) {
      if (p.brand) facetCounts.brand[p.brand] = (facetCounts.brand[p.brand] || 0) + 1;
      facetCounts.category[p.category] = (facetCounts.category[p.category] || 0) + 1;
    }

    return {
      hits,
      found: total,
      facet_counts: [
        { field_name: 'brand', counts: Object.entries(facetCounts.brand).map(([value, count]) => ({ value, count })) },
        { field_name: 'category', counts: Object.entries(facetCounts.category).map(([value, count]) => ({ value, count })) }
      ],
      page,
      per_page: perPage
    };
  }
}
