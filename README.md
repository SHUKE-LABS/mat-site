# mat-site

Product site for **My AI Team** (`my-ai-team`) — published at
[mat.shukelabs.com](https://mat.shukelabs.com).

Astro + Tailwind static site, deployed to Cloudflare Pages (project `mat-site`)
by GitHub Actions on every push to `main`.

## Develop

```bash
npm ci
npm run dev      # local dev server
npm run check    # astro check
npm test         # unit tests
npm run build    # static build into dist/
```

## Cloudflare Pages environment

The production Pages environment supplies the checkout configuration:

- `LEMON_SQUEEZY_API_KEY` — secret API key for creating checkouts.
- `PRICE_LAUNCH_DATE` — the UTC launch date in `YYYY-MM-DD` form (for example, `2026-11-12`).

Preview deployments intentionally do not receive these variables. Their `/buy` route shows the
support error page, while the site keeps its build-time price fallback.
