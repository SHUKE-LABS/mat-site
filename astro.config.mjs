// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Custom domain (mat.shukelabs.com) is attached on Cloudflare Pages → keep base at '/'.
export default defineConfig({
  site: 'https://mat.shukelabs.com',
  integrations: [sitemap()],
  vite: {
    // `tailwindcss()` returns a vite.Plugin typed against @tailwindcss/vite's
    // bundled Vite 8, structurally incompatible with Astro's nested Vite 6
    // PluginOption. Runtime is unaffected — only the static types clash — so
    // cast here rather than force a dependency-tree Vite downgrade. Keeps
    // `astro check` green. Same treatment as the shukelabs.com site.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
