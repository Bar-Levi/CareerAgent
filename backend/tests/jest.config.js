module.exports = {
    testEnvironment: 'node',
    verbose: true,
    setupFiles: [
        'dotenv/config', // Load environment variables for tests
        '<rootDir>/tests/jest.setup.js' // Set NODE_ENV before dotenv loads
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // Run the DB setup after env
    testMatch: [
        '<rootDir>/tests/unit/**/*.test.js',
        '<rootDir>/tests/integration/**/*.test.js'
    ],
    modulePathIgnorePatterns: ['<rootDir>/uploads'], // Ignore uploads directory
};
