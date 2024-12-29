const { defineConfig } = require('cypress');
require('dotenv').config(); // Load variables from .env

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.PORT}`,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
