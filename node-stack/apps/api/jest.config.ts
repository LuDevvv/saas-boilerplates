import type { Config } from 'jest';

process.env.DATABASE_URL = 'postgresql://johndoe:randompassword@localhost:5432/mydb';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['.*\\.e2e-spec\\.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true,
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@node-stack/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  transformIgnorePatterns: ['node_modules/(?!(@scure|otplib)/)'],
  collectCoverage: false, // only collect when --coverage flag is passed
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.dto.ts',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './src/auth/': {
      lines: 70,
    },
    './src/workspaces/': {
      lines: 65,
    },
    './src/billing/': {
      lines: 65,
    },
  },
  testEnvironment: 'node',
};

export default config;
