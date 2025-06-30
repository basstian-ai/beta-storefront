# 🕹️ Agents Registry

| Agent name | Goal (one-liner) | Entry script | Trigger | Secrets used |
|----------------------|------------------------------------------------------------------------|------------------------------------------|---------------------------------|---------------------------------------|
| import-crystallize | Convert first 100 DummyJSON products → Crystallize item specs and run `crystallize import`. | `scripts/dummy-to-crystallize.ts` | GitHub Action `crystallize-import.yml` (manual or cron) | `CRYSTALLIZE_ACCESS_TOKEN_ID`, `CRYSTALLIZE_ACCESS_TOKEN_SECRET`, `CRYSTALLIZE_TENANT_IDENTIFIER / _ID` |

## Conventions
- All agent scripts are TypeScript and executed with [`tsx`](https://github.com/esbuild-kit/tsx).
- Scripts must be **idempotent** (safe to run twice).
- New agents can be added by appending rows and committing the script + Action.

## How to run locally
```bash
pnpm exec tsx scripts/dummy-to-crystallize.ts
```
