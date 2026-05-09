import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.d.ts',
      '**/coverage/**',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project:      true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import:               importPlugin,
    },
    rules: {
      // ── No any ───────────────────────────────────────
      '@typescript-eslint/no-explicit-any':          'error',
      '@typescript-eslint/no-unsafe-assignment':     'warn',
      '@typescript-eslint/no-unsafe-member-access':  'warn',
      '@typescript-eslint/no-unsafe-call':           'warn',
      '@typescript-eslint/no-unsafe-return':         'warn',

      // ── Unused variables ─────────────────────────────
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // ── Return types on public methods ───────────────
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],

      // ── No console.log (use NestJS Logger) ───────────
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // ── Import order ─────────────────────────────────
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project:         true,
        tsconfigRootDir: __dirname,
        ecmaFeatures:    { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import:               importPlugin,
      react:                reactPlugin,
      'react-hooks':        reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/no-explicit-any':          'error',
      '@typescript-eslint/no-unsafe-assignment':     'warn',
      '@typescript-eslint/no-unsafe-member-access':  'warn',
      '@typescript-eslint/no-unsafe-call':           'warn',
      '@typescript-eslint/no-unsafe-return':         'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      'react-hooks/rules-of-hooks':  'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // Relax rules for test and migration files
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/test-*.ts', '**/migrate.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any':           'off',
      '@typescript-eslint/no-unsafe-assignment':      'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console':                                   'off',
    },
  },
];
