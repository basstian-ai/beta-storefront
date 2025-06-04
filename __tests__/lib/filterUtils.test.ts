// __tests__/lib/filterUtils.test.ts
import { filterProducts } from '@/lib/filterUtils'; // Adjust path if necessary
import { Product } from '@/lib/api'; // Adjust path
import { ActiveFilters } from '@/components/FacetFilters'; // Adjust path

const mockProducts: Product[] = [
  { id: '1', name: 'Laptop Alpha', price: 1200, brand: 'TechCorp', size: '15-inch', imageUrl: 'img1.jpg' },
  { id: '2', name: 'Mouse Beta', price: 25, brand: 'ClickMaster', size: 'Standard', imageUrl: 'img2.jpg' },
  { id: '3', name: 'Keyboard Gamma', price: 75, brand: 'TypeEasy', size: 'Full', imageUrl: 'img3.jpg' },
  { id: '4', name: 'Monitor Delta', price: 300, brand: 'ViewSonic', size: '24-inch', imageUrl: 'img4.jpg' },
  { id: '5', name: 'Laptop Epsilon', price: 1500, brand: 'TechCorp', size: '17-inch', imageUrl: 'img5.jpg' },
  { id: '6', name: 'Mouse Zeta', price: 30, brand: 'ClickMaster', size: 'Compact', imageUrl: 'img6.jpg' },
  { id: '7', name: 'Keyboard Eta', price: 80, brand: 'TypeEasy', size: 'Compact', imageUrl: 'img7.jpg' },
  { id: '8', name: 'Laptop Theta', price: 950, brand: 'TechCorp', size: '15-inch', imageUrl: 'img8.jpg' },
];

describe('filterProducts Utility', () => {
  it('should return all products if activeFilters is empty', () => {
    const activeFilters: ActiveFilters = {};
    expect(filterProducts(mockProducts, activeFilters)).toEqual(mockProducts);
  });

  it('should return an empty array if products list is null or empty', () => {
    const activeFilters: ActiveFilters = { brand: ['TechCorp'] };
    expect(filterProducts([], activeFilters)).toEqual([]);
    // @ts-ignore testing null case for products
    expect(filterProducts(null, activeFilters)).toEqual([]);
  });

  it('should filter by a single brand', () => {
    const activeFilters: ActiveFilters = { brand: ['TechCorp'] };
    const result = filterProducts(mockProducts, activeFilters);
    expect(result.length).toBe(3);
    expect(result.every(p => p.brand === 'TechCorp')).toBe(true);
  });

  it('should filter by multiple brands (OR logic within group)', () => {
    const activeFilters: ActiveFilters = { brand: ['TechCorp', 'ClickMaster'] };
    const result = filterProducts(mockProducts, activeFilters);
    expect(result.length).toBe(5); // 3 TechCorp + 2 ClickMaster
    expect(result.every(p => p.brand === 'TechCorp' || p.brand === 'ClickMaster')).toBe(true);
  });

  it('should filter by a single size', () => {
    const activeFilters: ActiveFilters = { size: ['15-inch'] };
    const result = filterProducts(mockProducts, activeFilters);
    expect(result.length).toBe(2);
    expect(result.every(p => p.size === '15-inch')).toBe(true);
  });

  it('should filter by brand AND size (AND logic across groups)', () => {
    const activeFilters: ActiveFilters = { brand: ['TechCorp'], size: ['15-inch'] };
    const result = filterProducts(mockProducts, activeFilters);
    expect(result.length).toBe(2); // Laptops Alpha and Theta
    expect(result.every(p => p.brand === 'TechCorp' && p.size === '15-inch')).toBe(true);
  });

  it('should filter by brand AND multiple sizes (OR within size, AND with brand)', () => {
    const activeFilters: ActiveFilters = { brand: ['TechCorp'], size: ['15-inch', '17-inch'] };
    const result = filterProducts(mockProducts, activeFilters);
    expect(result.length).toBe(3); // Alpha, Epsilon, Theta
    expect(result.every(p => p.brand === 'TechCorp' && (p.size === '15-inch' || p.size === '17-inch'))).toBe(true);
  });

  it('should return an empty array if no products match the filters', () => {
    const activeFilters: ActiveFilters = { brand: ['NonExistentBrand'] };
    expect(filterProducts(mockProducts, activeFilters)).toEqual([]);
  });

  it('should return an empty array if no products match combined AND filters', () => {
    const activeFilters: ActiveFilters = { brand: ['TechCorp'], size: ['NonExistentSize'] };
    expect(filterProducts(mockProducts, activeFilters)).toEqual([]);
  });

  it('should ignore filter categories not present in products (e.g. color)', () => {
    // Our current Product type doesn't have 'color', so this tests robustness if ActiveFilters contains it
    const activeFilters: ActiveFilters = { brand: ['TechCorp'], color: ['Blue'] } as any;
    // The 'as any' is to bypass TypeScript error since 'color' is not in our defined Facets/ActiveFilters keys.
    // The filterProducts logic should correctly identify that products don't have 'color' and thus not match if 'color' has selectedValues.
    const result = filterProducts(mockProducts, activeFilters);
    // Since products don't have a 'color' field, and 'Blue' is a selected value for 'color',
    // the logic `!product.hasOwnProperty(filterKey)` combined with `selectedValues.length > 0`
    // should cause these products to be filtered out.
    expect(result.length).toBe(0);
  });

  it('should handle filter keys in ActiveFilters that are not properties of Product objects gracefully', () => {
    const productsWithLessProps: Partial<Product>[] = [{ id: '9', name: 'Simple Product', price: 10, brand: undefined, size: undefined, imageUrl: '' }];
    const activeFilters: ActiveFilters = { brand: ['AnyBrand'] };
    // filterProducts should return [] because Simple Product does not have 'brand' property or it's undefined.
    // The hasOwnProperty check will be true if brand is undefined, but then selectedValues.includes(undefined) will be false.
    // If brand is not on the object, hasOwnProperty is false.
    expect(filterProducts(productsWithLessProps as Product[], activeFilters)).toEqual([]);
  });

  it('should handle a filter category with an empty array of selected values (should not filter by it)', () => {
    const activeFilters: ActiveFilters = { brand: ['TechCorp'], size: [] };
    const result = filterProducts(mockProducts, activeFilters);
    // Should be equivalent to filtering only by brand: ['TechCorp']
    expect(result.length).toBe(3);
    expect(result.every(p => p.brand === 'TechCorp')).toBe(true);
  });

});
