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

## Application Insights Setup

This project uses Application Insights for logging and telemetry. To enable Application Insights, you need to set the `APPINSIGHTS_INSTRUMENTATIONKEY` environment variable.

### Local Development

Add the following line to your `.env` file:

```
APPINSIGHTS_INSTRUMENTATIONKEY=<your-application-insights-instrumentation-key>
```

Replace `<your-application-insights-instrumentation-key>` with your actual Application Insights Instrumentation Key.

### Vercel Deployment

In your Vercel project settings, go to **Settings > Environment Variables** and add a new variable:

-   **Name:** `APPINSIGHTS_INSTRUMENTATIONKEY`
-   **Value:** (copy from your Azure Application Insights resource)

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