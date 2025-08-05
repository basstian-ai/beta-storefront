[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL&project-name=YOUR_PROJECT_NAME&repository-name=YOUR_REPO_NAME)

# Beta Storefront

A modern Next.js storefront showcasing B2B features such as quote requests and quick ordering.

## Quick start
1. Copy `.env.example` to `.env.local` and set the environment variables below.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quote flow
B2B users can request a quote from the cart. Submitted quotes are saved and listed under **My Account → Quotes**, and a confirmation email is sent via SendGrid.

## Quick Order
The Quick Order page lets authenticated B2B users add multiple products to the cart by SKU for faster purchasing.

## Role logic
Authentication includes a `role` field (`b2b` or `b2c`). B2B roles expose features like Quick Order and Request Quote, while B2C users proceed directly to checkout.

## Auth session
The authenticated session also exposes a `companyId` derived from the user's company name. Both `role` and `companyId` are available via `useSession()`:

```ts
{
  user: { id: '1', role: 'b2b', companyId: 'acme-inc' },
  role: 'b2b',
  companyId: 'acme-inc'
}
```

## Environment variables
| Variable | Purpose |
| --- | --- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Azure Application Insights connection string for telemetry. |
| `NEXT_PUBLIC_CMS_BASE_URL` | Base URL for the headless CMS (defaults to DummyJSON when unset). |
| `SENDGRID_KEY` | API key used to send quote confirmation emails. |
| `SENDGRID_FROM` | Optional "from" address for SendGrid emails. |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments. |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key. |
| `STRIPE_WEBHOOK_SECRET` | Optional Stripe webhook secret for verifying events. |

Set these in `.env.local` for local development or in your Vercel project settings when deploying.

## CI/CD with Vercel Preview Deployments
GitHub Actions deploy preview environments to Vercel for every pull request. Add `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `VERCEL_TOKEN` secrets to your repository to enable this workflow.

## Crystallize import
A workflow in `.github/workflows/crystallize-import.yml` converts `data/dummyProducts.json` into item specs and imports them into Crystallize. It requires the `CRYSTALLIZE_ACCESS_TOKEN_ID`, `CRYSTALLIZE_ACCESS_TOKEN_SECRET`, and `CRYSTALLIZE_TENANT_IDENTIFIER` secrets.

## Project Implementation Status
- [x] **Task 1: Foundation + Mock BFF** (Adapters, Services, Zod, B2B logic, Vitest)
- [x] **Epic 1: Navigation** (NavBar, Breadcrumbs)
- [x] **Epic 2: Product Discovery & Search** (Category Page, Search Page & API)
- [x] **Epic 3: Product Detail Page** (PDP with Gallery, PriceBox, Slug URLs, JSON-LD)
- [x] **Epic 4: Auth & Session** (NextAuth, Credentials, Remember Me flag, AuthGuard, NavBar Avatar)
- [x] **Epic 5: Cart MVP** (Zustand store with persistence & TTL, PDP integration, NavBar badge, Cart Page)
- [ ] **Epic 6: Quick My Page shell**
- [ ] **Task 8: Dev Experience** (CONTRIBUTING.md, test script, BFF logging)
- [x] **Task 9: CI/CD** (Vercel preview workflow - workflow file created, but full CI setup might be pending actual run)
