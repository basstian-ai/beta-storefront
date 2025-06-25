import { create } from 'zustand';
import { SortOption } from '@/bff/types';

export interface ProductFiltersState {
  sort: SortOption;
  min: number | null;
  max: number | null;
  brands: string[];
  rating: number | null;
  setSort: (value: SortOption) => void;
  setPrice: (min: number | null, max: number | null) => void;
  toggleBrand: (brand: string) => void;
  setRating: (rating: number | null) => void;
  initializeFromQuery: (params: URLSearchParams) => void;
  reset: () => void;
}

const initialState: Pick<ProductFiltersState, 'sort' | 'min' | 'max' | 'brands' | 'rating'> = {
  sort: 'relevance',
  min: null,
  max: null,
  brands: [],
  rating: null,
};

export const useProductFilters = create<ProductFiltersState>((set) => ({
  ...initialState,
  setSort: (value) => set({ sort: value }),
  setPrice: (min, max) => set({ min, max }),
  toggleBrand: (brand) =>
    set((state) => ({
      brands: state.brands.includes(brand)
        ? state.brands.filter((b) => b !== brand)
        : [...state.brands, brand],
    })),
  setRating: (rating) => set({ rating }),
  initializeFromQuery: (params) =>
    set(() => {
      const brands = params.get('brand')
        ? params.getAll('brand')
        : [];
      const min = params.get('min');
      const max = params.get('max');
      const rating = params.get('rating');
      const sort = (params.get('sort') as SortOption) || 'relevance';
      return {
        brands,
        min: min ? Number(min) : null,
        max: max ? Number(max) : null,
        rating: rating ? Number(rating) : null,
        sort,
      };
    }),
  reset: () => set({ ...initialState }),
}));

