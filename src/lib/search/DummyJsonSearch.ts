import { searchProducts } from '@/bff/services';
import type { SearchOpts, SearchService } from './SearchService';
import type { ProductSearchResponse } from './types';

export class DummyJsonSearch implements SearchService {
  async indexProducts(): Promise<void> {
    // no-op for dummy search
  }

  async search(q: string, opts: SearchOpts = {}): Promise<ProductSearchResponse> {
    if (!q.trim()) {
      return { hits: [], found: 0, facet_counts: [], page: opts.page, per_page: opts.perPage };
    }
    const perPage = opts.perPage ?? 20;
    const skip = ((opts.page ?? 1) - 1) * perPage;
    const data = await searchProducts(q, 'relevance', skip, perPage);
    const hits = data.items.map((p) => ({
      document: {
        id: String(p.id),
        name: p.title,
        slug: p.slug ?? '',
        description: p.description,
        category: p.category.slug,
        brand: p.brand ?? '',
        price: p.price,
      },
    }));
    const brandCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    for (const p of data.items) {
      if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      if (p.category?.slug)
        categoryCounts[p.category.slug] = (categoryCounts[p.category.slug] || 0) + 1;
    }
    const facet_counts = [
      {
        field_name: 'brand',
        counts: Object.entries(brandCounts).map(([value, count]) => ({ value, count })),
      },
      {
        field_name: 'category',
        counts: Object.entries(categoryCounts).map(([value, count]) => ({ value, count })),
      },
    ];
    return { hits, found: data.total, facet_counts, page: opts.page ?? 1, per_page: perPage };
  }
}
