const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    /**
     * Override baseUrl if provided via the config.env.json
     * https://stackoverflow.com/questions/47262338/overriding-configuration-variables-from-cypress-env-json
     */
    setupNodeEvents(on, config) {
      if (config.hasOwnProperty("env") && config.env.hasOwnProperty("baseUrl")) {
        config.baseUrl = config.env.baseUrl;
      }
      return config;
    },
    baseUrl: 'http://localhost:30000',
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 60000,
  videoCompression: 16
});
