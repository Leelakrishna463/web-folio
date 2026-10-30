// @ts-check
import { defineConfig } from 'astro/config';

// lee.sh: every page is prerendered to static HTML; interactivity is a few small vanilla-TS modules per page
export default defineConfig({
  site: 'https://lee.sh',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
