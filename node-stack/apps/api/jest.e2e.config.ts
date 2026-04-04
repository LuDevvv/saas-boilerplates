export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir:    '.',
  testMatch:  ['<rootDir>/test/**/*.e2e-spec.ts'],
  transform:  { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  testTimeout:     30_000,
  globalSetup:    './test/setup.ts',
  forceExit:      true,
};
