# Beta Storefront  🚀
Composable / Headless, B2B-ready Next.js starter-kit maintained by **Forte Digital**.
This repo powers live demos, RFP PoCs and will evolve into our internal accelerator.

---

## ✨ Key features
| Area | What’s shipped ✔ | Notes |
|------|------------------|-------|
| **Core storefront** | Home ▪ Category ▪ Product ▪ Search | SSR + ISR |
| **Checkout** | Stripe card flow | Loads env keys |
| **B2B** | Shared cart ▪ Quote request ▪ Company history | Company context provider |
| **Roles** | Hard-coded `buyer / approver / admin` | Taken from DummyJSON |
| **Emails** | Quote & order via SendGrid | Fallback logs in dev |
| **DX** | Vitest, Playwright, Storybook | CI-lint-test-build |

## 🛠 Quick start
```bash
pnpm i                       # install deps
cp .env.example .env.local   # add your keys
pnpm dev                     # next + company json watcher

# optional helpers
pnpm storybook               # component docs
pnpm test                    # vitest unit suite
pnpm e2e                     # playwright buyer→approver flow
```

> **Demo creds** (DummyJSON)  
> * buyer → `kminchelle / 0lelplR`  
> * approver → `atuny0 / 9uQFF1Lh`  

### 🔐 Environment variables
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
DUMMYJSON_API=https://dummyjson.com
SENDGRID_KEY=...
STRIPE_SECRET_KEY=...
```

See .env.example for the full list.

### 🏗 Architecture (high-level)
```text
Next.js (App Router)
├── /lib/adapters/*          # commerce, CMS, search backends
├── /lib/services/*          # domain logic (cart, price, company)
├── /app/api/*               # BFF routes (REST)
└── /app/*                   # Pages & client components
```

### 🧑‍💼 B2B guide
* CompanyProvider – reads companyId & role from the session.
* Team Cart – /cart is now a shared basket per company.
* Approval flow – buyers “Submit for approval”, approvers accept/reject on /account/approvals.
* Company history – /account/history aggregates orders & quotes for the whole company.
More details in docs/b2b.md.

## 📅 Roadmap
* Crystallize adapter (multi-backend)
* Tiered pricing & budget limits
* CSV quick-order
* Supabase persistence
To contribute: see CONTRIBUTING.md. We use GitHub Projects + Excel task board.

---
