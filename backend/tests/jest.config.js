module.exports = {
    testEnvironment: 'node',
    verbose: true,
    setupFiles: ['dotenv/config'], // Load environment variables for tests
    modulePathIgnorePatterns: ['<rootDir>/uploads'], // Ignore uploads directory
};
