import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import boundaries from 'eslint-plugin-boundaries';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

const PUBLIC_FEATURE_API_MESSAGE =
  '❌ Deep import entre features é proibido. Use apenas a API pública da feature: "@/features/nome-da-feature". Dentro da própria feature, use imports relativos.';

export default defineConfig([
  globalIgnores([
    'dist',
    'build',
    'coverage',
    'node_modules',
    '.turbo',
    '.next',
    'storybook-static'
  ]),
  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite
    ],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser
    },

    plugins: {
      boundaries,
      'simple-import-sort': simpleImportSort
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        {
          type: 'app',
          pattern: 'src/app/**/*'
        },
        {
          type: 'shared',
          pattern: 'src/shared/**/*'
        },
        {
          type: 'infra',
          pattern: 'src/infra/**/*'
        },
        {
          type: 'feature-public-api',
          pattern: 'src/features/*/index.ts',
          mode: 'file'
        },
        {
          type: 'feature-presentation',
          pattern: 'src/features/*/presentation/**/*'
        },
        {
          type: 'feature-domain-services',
          pattern: 'src/features/*/domain/services/**/*'
        },
        {
          type: 'feature-domain-entities',
          pattern: 'src/features/*/domain/entities/**/*'
        },
        {
          type: 'feature-domain-consts',
          pattern: 'src/features/*/domain/consts/**/*'
        },
        {
          type: 'feature-domain-utils',
          pattern: 'src/features/*/domain/utils/**/*'
        },
        {
          type: 'feature-domain-private',
          pattern: 'src/features/*/domain/**/*'
        },
        {
          type: 'feature-data-api',
          pattern: 'src/features/*/data/api/**/*'
        },
        {
          type: 'feature-data-private',
          pattern: 'src/features/*/data/**/*'
        },
        {
          type: 'feature-private',
          pattern: 'src/features/*/**/*'
        }
      ]
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react$', '^react-dom', '^react-router', '^@?\\w'],
            ['^@/app(/.*|$)'],
            ['^@/features(/.*|$)'],
            ['^@/shared(/.*|$)'],
            ['^@/infra(/.*|$)'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$']
          ]
        }
      ],
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: ['app'],
              allow: ['app', 'shared', 'feature-public-api', 'infra']
            },
            {
              from: ['infra'],
              allow: ['infra', 'shared']
            },
            {
              from: ['shared'],
              allow: ['shared']
            },
            {
              from: ['feature-public-api'],
              allow: [
                'feature-presentation',
                'feature-domain-services',
                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',
                'feature-data-api'
              ]
            },
            {
              from: ['feature-presentation'],
              allow: [
                'feature-presentation',
                'feature-domain-services',
                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',
                'feature-data-api',
                'feature-public-api',
                'shared'
              ]
            },
            {
              from: ['feature-domain-services'],
              allow: [
                'feature-domain-services',
                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',
                'feature-data-api',
                'feature-public-api',
                'shared'
              ]
            },
            {
              from: ['feature-domain-entities'],
              allow: [
                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',
                'feature-public-api',
                'shared'
              ]
            },
            {
              from: ['feature-domain-consts'],
              allow: ['feature-domain-consts', 'shared']
            },
            {
              from: ['feature-domain-utils'],
              allow: [
                'feature-domain-utils',
                'feature-domain-entities',
                'feature-domain-consts',
                'shared'
              ]
            },
            {
              from: ['feature-domain-private'],
              allow: [
                'feature-domain-services',
                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',
                'feature-domain-private',
                'shared'
              ]
            },
            {
              from: ['feature-domain-private'],
              allow: [
                'feature-domain-services',
                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',
                'feature-domain-private',
                'shared'
              ]
            },
            {
              from: ['feature-data-api'],
              allow: [
                'feature-data-api',
                'feature-data-private',

                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',

                'infra',
                'shared'
              ]
            },
            {
              from: ['feature-data-private'],
              allow: [
                'feature-data-api',
                'feature-data-private',
                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',
                'infra',
                'shared'
              ]
            },
            {
              from: ['feature-private'],
              allow: [
                'feature-public-api',

                'feature-domain-services',
                'feature-domain-entities',
                'feature-domain-consts',
                'feature-domain-utils',

                'feature-data-api',

                'shared'
              ]
            }
          ]
        }
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: PUBLIC_FEATURE_API_MESSAGE
            }
          ]
        }
      ]
    }
  },
  eslintConfigPrettier,
  prettierRecommended
]);
