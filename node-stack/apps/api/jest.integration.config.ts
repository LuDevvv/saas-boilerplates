import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  testMatch: ['**/*.int-spec.ts'],
  testTimeout: 60_000, // containers take time to start
  maxWorkers: 1, // serial — containers are expensive
  forceExit: true,
};
