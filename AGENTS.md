# Adapters & Integration Layer

The storefront is designed to be **backend-agnostic**, enabling integrations with multiple platforms without changing the core codebase.

## Adapter Concept

Adapters define **interfaces** between the storefront and backend systems.  
Each adapter implements the required operations (e.g., fetching products, managing carts, handling orders) according to a common contract.

### Adapter Categories

- **Commerce / PIM Adapter**
  - Products (id, name, SKU, variants, specs, images, categories)
  - Prices (list price, customer-specific price, currency)
  - Stock availability
  - Categories & navigation

- **CMS Adapter**
  - Content pages
  - Home page layout
  - Rich media assets

- **Search Adapter**
  - Autocomplete
  - Filtered product search
  - Personalization hooks

- **Auth Adapter**
  - Login & registration
  - Session handling
  - Role-based access

---

## Example Platforms

Adapters can be implemented for:
- **Commerce / PIM:** commercetools, Centra, Crystallize  
- **CMS:** Sanity, Contentful, Storyblok  
- **Search:** Relewise, Algolia, Elasticsearch  
- **Auth:** Auth0, Azure AD B2C  

---

## How to Implement an Adapter

1. **Create the adapter file** in `/adapters/<platform>/`
2. **Implement required interfaces**, e.g.:

```ts
// Example: ProductAdapter interface
export interface ProductAdapter {
  getProductById(id: string): Promise<Product>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  searchProducts(query: string, filters: any): Promise<Product[]>;
}
```

3. **Configure the adapter** in your environment settings.
4. **Plug it into the BFF layer**, so the frontend can query products without caring about the underlying platform.

---

## Benefits of the Adapter Approach

* Swap out backend systems without rewriting the storefront
* Standardized interfaces reduce complexity
* Enables multi-vendor, composable commerce solutions
* Future-proof against vendor lock-in

