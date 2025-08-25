export { DEFAULT_LIMIT, ProductServiceError, type ProductService, type ServiceKind } from './productService';
export { DummyJsonProductService } from './adapters/dummyjson';

export function createProductService(kind?: ServiceKind): ProductService {
  const serviceKind = (kind ?? (process.env.PRODUCT_BACKEND as ServiceKind)) || 'dummyjson';
  switch (serviceKind) {
    case 'dummyjson':
      return new DummyJsonProductService();
    default:
      throw new Error(`Unknown service kind: ${serviceKind}`);
  }
}
