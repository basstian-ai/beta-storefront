This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

Here’s the updated `README.md` section you can append under a new heading, such as **"Development Notes and Practices"**:

---

## 🛠 Development Notes and Practices

To maintain a clean and scalable codebase as we build out the Starter Kit, please follow these guidelines:

### 1. Repo/Codebase Structure Guidance

* Use the following folder conventions:

  * `/pages`: Route-based page components.
  * `/components`: Reusable UI components.
  * `/features`: Feature-specific logic or UI.
  * `/lib`: Utility functions and helper logic.
  * `/bff`: Mocked backend-for-frontend functions (e.g., data fetching from dummyjson).
* Follow consistent naming:

  * Components: `PascalCase.tsx`
  * Hooks: `useCamelCase.ts`
  * Services: `camelCase.service.ts`
* State management:

  * Prefer React local state for now.
  * Future-proofing: consider Zustand if shared state grows complex.

### 2. Testing Strategy

* Use **Vitest** or **Jest** for unit testing.
* Plan for future integration testing with **Playwright** or **Cypress**.
* Prioritize simple testable components to start with.

### 3. Dummy Data Use

* Fetch from [https://dummyjson.com](https://dummyjson.com) in the `/bff` layer.
* Wrap data access in typed functions to make swapping to real APIs seamless later.

### 4. BFF Simulation

* Log all inputs and outputs in mock BFF handlers to help debug and prepare for real integration.

### 5. MVP Story Tagging

* Focus first on these stories for a minimal working POC:

  * `NAV-1`, `NAV-2`
  * `DISC-1`
  * `PDP-1`
  * `CART-1`
  * `AUTH-1`

