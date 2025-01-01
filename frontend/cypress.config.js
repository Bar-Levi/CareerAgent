const { defineConfig } = require('cypress');
require('dotenv').config(); // Load variables from .env

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.REACT_APP_FRONTEND_PORT}`,
    defaultCommandTimeout: 15000, // Maximum duration for each Cypress command (15 seconds)
    pageLoadTimeout: 15000, // Maximum time to wait for page loads
  },
});
