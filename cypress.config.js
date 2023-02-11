const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://example:30000', // Override with CYPRESS_BASE_URL
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
});
