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
      // Auto-generated OpenAPI schema — do not lint
      'packages/api-client/src/schema.ts',
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
      // react-hooks v4 is incompatible with ESLint v9 (context.getSource removed).
      // Re-enable once plugin is upgraded to v5+.
      // 'react-hooks/rules-of-hooks':  'error',
      // 'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // Dashboard — intentional relaxations (see ENGINEERING_GUIDE.md §17):
    //
    // 1. no-unsafe-*: api-client methods return manually-typed values, not schema.ts types yet.
    //    TO REMOVE: update every api-client method (auth.ts, workspace.ts, …) to use
    //    `components["schemas"]["X"]` from packages/api-client/src/schema.ts, then delete
    //    these four lines. ~298 warnings will surface — all fixable with typed assertions.
    //
    // 2. explicit-function-return-type: React components don't benefit from `: JSX.Element`
    //    on every arrow function. Keep off permanently for tsx files in this app.
    files: ['apps/dashboard/**/*.ts', 'apps/dashboard/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment':    'off',  // TECH DEBT — see note 1
      '@typescript-eslint/no-unsafe-member-access': 'off',  // TECH DEBT — see note 1
      '@typescript-eslint/no-unsafe-call':          'off',  // TECH DEBT — see note 1
      '@typescript-eslint/no-unsafe-return':        'off',  // TECH DEBT — see note 1
      '@typescript-eslint/explicit-function-return-type': 'off',  // intentional — see note 2
    },
  },
  {
    // Relax rules for test and migration files
    // Also disable typed-linting for spec files that are excluded from tsconfig
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/test-*.ts', '**/migrate.ts'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any':                    'off',
      '@typescript-eslint/no-unsafe-assignment':               'off',
      '@typescript-eslint/no-unsafe-member-access':            'off',
      '@typescript-eslint/no-unsafe-call':                     'off',
      '@typescript-eslint/no-unsafe-return':                   'off',
      '@typescript-eslint/no-unsafe-argument':                 'off',
      '@typescript-eslint/explicit-function-return-type':      'off',
      '@typescript-eslint/no-floating-promises':               'off',
      '@typescript-eslint/restrict-template-expressions':      'off',
      '@typescript-eslint/no-unused-vars':                     'off',
      'no-console':                                            'off',
    },
  },
];
