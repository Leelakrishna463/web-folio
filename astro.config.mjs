// @ts-check
import { defineConfig } from 'astro/config';

/** Test pages (tests/fixtures) exist only in Playwright's build, never in production. */
const fixtures = () => ({
  name: 'lee-fixtures',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      if (process.env.LEE_FIXTURES) injectRoute({ pattern: '/fixture', entrypoint: './tests/fixtures/fixture.astro' });
    },
  },
});

// lee.sh: every page is prerendered to static HTML; interactivity is a few small vanilla-TS modules per page
export default defineConfig({
  site: 'https://lee.sh',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [fixtures()],
});
