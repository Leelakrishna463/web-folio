import { defineConfig, devices } from '@playwright/test';

// Runs against the built site (astro preview). Locally it uses the installed Chrome; CI sets PW_CHROMIUM=1 and
// installs Playwright's own Chromium instead
const browser = process.env.PW_CHROMIUM ? {} : { channel: 'chrome' };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321', ...browser },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'], ...browser } },
  ],
  // builds with the test fixtures included, then serves the build
  webServer: { command: 'npm run build && npm run preview', env: { LEE_FIXTURES: '1' }, url: 'http://localhost:4321', reuseExistingServer: !process.env.CI, timeout: 180_000 },
});
