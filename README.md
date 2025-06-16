[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL&project-name=YOUR_PROJECT_NAME&repository-name=YOUR_REPO_NAME)

**Note:** Replace `YOUR_REPO_URL`, `YOUR_PROJECT_NAME`, and `YOUR_REPO_NAME` in the badge URL above with your actual repository URL, desired Vercel project name, and repository name.

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

## Environment Variables

To run this project effectively and enable all features, you will need to set up the following environment variables. You can create a `.env.local` file in the root of the project to store these variables locally for development.

### Authentication

-   `NEXTAUTH_SECRET`: A secret key used to sign and encrypt session cookies and tokens. This is **critical** for security.
    -   **Local Development**: You can generate a random string (e.g., using `openssl rand -hex 32` in your terminal).
    -   **Vercel (Production)**: You **must** set this to a strong, unique, randomly generated string in your Vercel project's environment variable settings. **Do not use a weak or guessable secret.**
    -   Example for `.env.local`: `NEXTAUTH_SECRET=your-super-secret-key-here-for-local-dev`

-   `NEXTAUTH_URL`: The **critical** canonical URL of your Next.js application. This variable is essential not only for runtime authentication flows but also **during the build process** for prerendering pages and for any NextAuth utility functions that construct absolute URLs.
    -   **Local Development & Local Builds (`.env.local`)**: `NEXTAUTH_URL=http://localhost:3000` (or your development port).
    -   **Vercel (Production Environment)**: Set this to your canonical production domain in Vercel project settings (e.g., `NEXTAUTH_URL=https://your-app-name.vercel.app`).
    -   **Vercel (Preview Environments)**: Set this to `https://${VERCEL_URL}` in Vercel project settings. `VERCEL_URL` is a system environment variable provided by Vercel that automatically points to the unique URL of each preview deployment.
    -   **Important for Builds**: If this variable is not correctly set and available during Vercel's build phase, you may encounter `TypeError: Invalid URL` errors, especially when prerendering static pages like `_not-found`.

-   `AUTH_URL`: (Optional, for compatibility or specific helpers) Typically, `NEXTAUTH_URL` is sufficient for NextAuth v5. However, if you experience URL-related errors during build or runtime even with `NEXTAUTH_URL` correctly set, consider also setting `AUTH_URL` to the same value as `NEXTAUTH_URL`. Some older utilities or specific NextAuth internal helpers might fall back to `AUTH_URL`.

-   `AUTH_TRUST_HOST`: Set to `true` when deploying to Vercel or other environments that use a proxy or load balancer in front of your Next.js application. This is often required for NextAuth v5 to work correctly in such environments, especially for preview deployments.
    -   **Vercel/Production**: `AUTH_TRUST_HOST=true`

### Application Insights
-   `APPINSIGHTS_INSTRUMENTATIONKEY`: Your Application Insights Instrumentation Key. This is used for logging and telemetry.
    -   **Local Development**: Add this key to your `.env.local` file:
        ```
        APPINSIGHTS_INSTRUMENTATIONKEY=<your-application-insights-instrumentation-key>
        ```
    -   **Vercel Deployment**: In your Vercel project settings, go to **Settings > Environment Variables** and add `APPINSIGHTS_INSTRUMENTATIONKEY` with your key.

### CMS Configuration
-   `NEXT_PUBLIC_CMS_BASE_URL`: The base URL for your headless CMS. This is used to fetch dynamic content, such as the hero banner for the home page.
    -   **Example**: `NEXT_PUBLIC_CMS_BASE_URL=https://your-cms-instance.com/api`
    -   If not set, the application will default to using `https://dummyjson.com` for placeholder content for some features like the Hero Banner.

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

---

## Testing Strategy

### Overview
Testing is a critical component of this project, ensuring code quality, reliability, and maintainability. Our strategy focuses on comprehensive unit testing for backend logic and BFF services, with plans to expand to other forms of testing as the project evolves.

### Unit Testing
-   **Framework**: We use [Vitest](https://vitest.dev/) for unit testing. Vitest provides a fast and modern testing experience, compatible with Vite-based projects.
-   **Location**: Unit tests are co-located within `__tests__` directories, mirroring the structure of the code being tested. For example, tests for `bff/utils/fetchData.js` would be found in `__tests__/bff/utils/fetchData.test.js`.
-   **Execution**: Tests can be run using the following command:
    ```bash
    npm test
    ```
    Alternatively, you can run Vitest directly:
    ```bash
    npx vitest
    ```

### BFF Service Testing
The Backend-for-Frontend (BFF) services (e.g., `getProducts`, `getUsers` located in the `/bff` directory) are unit tested to ensure their correctness and resilience. These tests specifically verify:
-   **Data Fetching and Processing**: Correct interaction with data sources (like `dummyjson.com`) and that data is processed as expected.
-   **Application Insights Integration**: Proper integration with Application Insights. This involves mocking the `applicationinsights` module to assert that telemetry methods (e.g., `trackTrace`, `trackEvent`, `trackMetric`, `trackException`) are called with the correct parameters (message, severity, properties, event name, exception details).
-   **Error Handling**: Graceful handling of errors, ensuring that exceptions are caught, logged to Application Insights, and then re-thrown as appropriate.

### Coverage
Code coverage is actively monitored using Vitest's built-in coverage reporting capabilities. While a strict target is not enforced for early development stages, contributions should aim to maintain or ideally improve the existing code coverage. This helps in identifying untested parts of the codebase and ensuring new features are adequately tested.

### End-to-End (E2E) Tests

This project uses [Playwright](https://playwright.dev/) for End-to-End testing. The tests cover critical user flows such as authentication.

To run the E2E tests locally:

1.  Ensure your local development server is running (usually `npm run dev` or `pnpm dev`).
2.  Set the `PLAYWRIGHT_TEST_BASE_URL` environment variable if your application is not running on `http://localhost:3000`. For example, in your `.env.local` or directly in the command line:
    ```bash
    PLAYWRIGHT_TEST_BASE_URL=http://localhost:your_port npm run test:e2e
    ```
3.  Run the tests using the following npm script:

    ```bash
    npm run test:e2e
    ```
    Or, if using pnpm:
    ```bash
    pnpm test:e2e
    ```

Playwright will execute the tests defined in the `tests/e2e` directory. Test reports (HTML) can be found in `playwright-report` after the test run.

### Future Considerations
As the project grows, we plan to incorporate additional testing methodologies:
-   **Integration Testing**: To test the interactions between different parts of the application, such as BFF services and actual downstream APIs (once we move beyond `dummyjson`).
-   **Expanded E2E Coverage**: While basic E2E tests for authentication are in place, coverage will be expanded to other critical user flows.

---

## CI/CD with Vercel Preview Deployments

This project uses GitHub Actions to deploy preview environments to Vercel for each pull request. This allows for easy testing and review of changes before merging to the main branch.

### 1. Connect GitHub Repository to Vercel

*   Go to your Vercel dashboard and create a new project.
*   Choose "Import Git Repository" and select your GitHub repository.
*   Vercel will automatically detect that it's a Next.js project and configure the build settings. You can usually leave these as default.
*   For detailed steps, refer to the [Vercel documentation on importing a project](https://vercel.com/docs/projects/importing-projects).

### 2. Enable PR Previews (Git Integration Settings)

*   Once the project is imported, navigate to your Vercel project's settings.
*   Go to the "Git" section.
*   Ensure that "Automatic Deployments" is enabled for your production branch (e.g., `main` or `master`).
*   Crucially, ensure that "Create a unique URL for each Git branch and pull request" (or similar wording for Preview Deployments) is enabled. This will automatically deploy new pull requests.
*   Vercel typically enables this by default when you import a project. You can find more information in the [Vercel Git Integration documentation](https://vercel.com/docs/projects/git).

### 3. Add GitHub Secrets for Vercel Action

The GitHub Actions workflow (`.github/workflows/deploy.yml`) requires the following secrets to be added to your GitHub repository settings. This allows the action to authenticate with Vercel and deploy your project.

*   `VERCEL_ORG_ID`: Your Vercel organization ID.
    *   You can find this by going to your Vercel account settings, under "General", your organization/team slug is often part of the URL (e.g., `vercel.com/your-org-slug`). The ID itself can be found via the Vercel API or sometimes in project settings URLs. A more reliable way is to use the Vercel CLI: run `vercel link` in your local project directory (after installing Vercel CLI with `npm i -g vercel` and logging in with `vercel login`), which will create a `.vercel` folder containing a `project.json` file with both `orgId` and `projectId`.
*   `VERCEL_PROJECT_ID`: The Project ID from your Vercel project.
    *   In your Vercel project, go to "Settings" -> "General". The Project ID is usually displayed there.
    *   Alternatively, as mentioned above, linking your local project using `vercel link` will generate a `.vercel/project.json` file containing this ID.
*   `VERCEL_TOKEN`: A Vercel Access Token.
    *   Go to your Vercel account settings.
    *   Navigate to the "Tokens" section.
    *   Create a new token. Give it a descriptive name (e.g., "GitHub Actions CI").
    *   Ensure the token has permissions to deploy projects within your organization/scope.
    *   Copy the token immediately, as it will not be shown again.
    *   For more details, see [Vercel's documentation on Access Tokens](https://vercel.com/docs/rest-api#creating-an-access-token).

To add these secrets to GitHub:

1.  Go to your GitHub repository.
2.  Click on "Settings".
3.  In the left sidebar, navigate to "Secrets and variables" -> "Actions".
4.  Click on "New repository secret" for each of the three secrets listed above, pasting the corresponding values.

Once these steps are completed, any new pull request to your repository should trigger the GitHub Action, which will then deploy a preview environment to Vercel. The deployment URL will typically be commented on the pull request by the Vercel bot.

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