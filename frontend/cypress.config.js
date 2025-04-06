const { defineConfig } = require('cypress');
require('dotenv').config(); // Load variables from .env

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.REACT_APP_FRONTEND_PORT}`,
    defaultCommandTimeout: 30000, // Maximum duration for each Cypress command (15 seconds)
    pageLoadTimeout: 30000, // Maximum time to wait for page loads
    screenshotOnRunFailure: false, // Disable screenshot on test failure
  },
});
