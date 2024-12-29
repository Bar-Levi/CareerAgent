const { defineConfig } = require('cypress');
require('dotenv').config(); // Load variables from .env

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.REACT_APP_FRONTEND_PORT}`,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
