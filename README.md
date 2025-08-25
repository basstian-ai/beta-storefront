# Beta Storefront

A composable, product-agnostic e-commerce starter kit built with **Next.js**.  

This repository provides a reusable foundation for building modern, headless storefronts.  
It is designed to be **backend-agnostic**, supporting integrations with any CMS, commerce, or PIM platform through pluggable adapters.

---

## Key Principles

- **Composable** – loosely coupled components with clear interfaces
- **Headless-first** – not tied to any specific CMS, commerce, or PIM
- **Reusable & extendable** – works for both B2B and B2C
- **Minimal but complete** – essential features with room to grow
- **Multitenant-ready** – adaptable for SaaS delivery

---

## Features

- **Frontend (Next.js)**
  - Home page (configurable from CMS)
  - Content pages (route-based, CMS-driven)
  - Product listing & detail pages
  - Search page with filters and personalization
  - Cart & checkout flow
  - Customer account ("My Page") with orders, quotes, and profile
  - Authentication & account management

- **Backend-for-Frontend (BFF)**
  - Unified GraphQL/REST API layer
  - Abstracted interfaces for product, price, stock, category, customer, and order/quote
  - Middleware for auth/session handling
  - Logging & observability hooks

- **Infrastructure**
  - CI/CD via GitHub Actions or Azure Pipelines
  - Vercel deployment & preview environments
  - Pluggable configuration & secret management
  - Monitoring & error reporting

---

## Backend Adapters

The storefront integrates with backend systems through **adapters**.  
These adapters ensure that the core storefront logic remains **independent of any vendor**.

Adapter categories include:
- **Commerce / PIM** – products, categories, pricing, inventory
- **CMS** – content and layout
- **Search** – filters, autocomplete, personalization
- **Auth** – login, sessions, role management

Examples of supported platforms:
- Commerce: commercetools, Centra, Crystallize
- CMS: Sanity, Contentful, Storyblok
- Search: Relewise, Algolia, Elasticsearch
- Auth: Auth0, Azure AD B2C

---

## Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/basstian-ai/beta-storefront.git
   ```

2. Install dependencies

   ```bash
   npm install
   ```
3. Run the development server

   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Next Steps

* Configure adapters for your CMS, commerce, PIM, and search providers
* Extend the UI with custom pages and components
* Customize styling and layout for your project
* Add additional business-specific logic

---

## License

MIT

