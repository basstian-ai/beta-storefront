import Typesense from 'typesense';
import type { Product } from '../../types';
import type { SearchOpts, SearchService } from './SearchService';

export class TypesenseSearch implements SearchService {
  private client: Typesense.Client;

  constructor() {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || 'localhost',
          port: Number(process.env.TYPESENSE_PORT || 8108),
          protocol: process.env.TYPESENSE_PROTOCOL || 'http',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
    });
  }

  private async ensureCollection() {
    try {
      await this.client.collections('products').retrieve();
    } catch {
      await this.client.collections().create({
        name: 'products',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'slug', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'category', type: 'string', facet: true },
          { name: 'brand', type: 'string', facet: true },
          { name: 'price', type: 'float' },
        ],
      });
    }
  }

  async indexProducts(products: Product[]): Promise<void> {
    await this.ensureCollection();
    if (!products.length) return;
    const docs = products.map(p => ({
      id: String(p.id),
      name: (p as any).title || (p as any).name,
      slug: (p as any).slug || '',
      description: (p as any).description || '',
      category: (p as any).category?.slug || '',
      brand: (p as any).brand || '',
      price: (p as any).price || 0,
    }));
    await this.client
      .collections('products')
      .documents()
      .import(docs, { action: 'upsert' });
  }

  async search(q: string, opts: SearchOpts = {}): Promise<any> {
    await this.ensureCollection();
    const res = await this.client
      .collections('products')
      .documents()
      .search({
        q,
        query_by: 'name,description',
        filter_by: opts.filters,
        page: opts.page ?? 1,
        per_page: opts.perPage ?? 20,
      });
    return res;
  }
}
