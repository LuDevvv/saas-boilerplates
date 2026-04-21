import config from './jest.config.js';

export default {
  ...config,
  setupFiles: ['./jest.setup.ts'],
  moduleNameMapper: {
    '^@faker-js/faker$': '<rootDir>/src/testing/faker-mock.ts',
  },
  testRegex: undefined,
  testMatch: ['**/*.int-spec.ts'],
  testTimeout: 60_000, // containers take time to start
  maxWorkers: 1,           // serial — containers are expensive
  forceExit: true,
};
