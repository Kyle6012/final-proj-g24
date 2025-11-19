// jest.config.js
export default {
    transform: {
      '^.+\\.mjs$': 'babel-jest',   // Use babel-jest for .mjs files
      '^.+\\.js$': 'babel-jest',    // Use babel-jest for .js files
    },
    testMatch: [
      '**/?(*.)+(spec|test).[tj]s?(x)', // Default test match pattern
      '**/test/cron.test.mjs',         // Add your test file here explicitly
    ],
    transformIgnorePatterns: [
      '/node_modules/(?!node-cron)/',  // Ensure node-cron is processed by Babel
    ],
  };
  