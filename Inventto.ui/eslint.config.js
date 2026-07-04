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
  '❌ Deep import entre features é proibido. Use apenas a API pública da feature: "@/features/nome-da-feature". Dentro da própria feature, use imports relativos ou "@/features/sua-feature/...".';

function checkDeepFeatureImport(context, importPath, reportNode) {
  // Só nos importa caminhos que entram em sub-pastas de uma feature
  const importFeatureMatch = importPath.match(/^@\/features\/([^/]+)\/.+/);
  if (!importFeatureMatch) return;

  const importedFeature = importFeatureMatch[1];

  // Descobre a feature do arquivo sendo analisado
  const filename = context.filename ?? context.getFilename?.();
  const currentFeatureMatch = filename.match(
    /[/\\]features[/\\]([^/\\]+)[/\\]/
  );

  // Se o arquivo atual não pertence a nenhuma feature OU pertence a uma
  // feature diferente da importada → deep import cross-feature → erro
  if (!currentFeatureMatch || currentFeatureMatch[1] !== importedFeature) {
    context.report({
      node: reportNode,
      message: PUBLIC_FEATURE_API_MESSAGE
    });
  }
  // Mesma feature → import absoluto intra-feature → permitido (sem report)
}

const featureDeepImportRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Proíbe deep imports cross-feature via alias absoluto, mas permite intra-feature.'
    },
    schema: []
  },
  create(context) {
    return {
      // import estático: import { X } from '@/features/...'
      ImportDeclaration(node) {
        checkDeepFeatureImport(context, node.source.value, node);
      },
      // dynamic import: import('@/features/...')  ← o caso que quebrava
      ImportExpression(node) {
        if (
          node.source.type === 'Literal' &&
          typeof node.source.value === 'string'
        ) {
          checkDeepFeatureImport(context, node.source.value, node);
        }
      }
    };
  }
};

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
      'simple-import-sort': simpleImportSort,
      // Plugin inline com a regra customizada
      'local-rules': {
        rules: {
          'feature-deep-import': featureDeepImportRule
        }
      }
    },
    settings: {
      // Sem isso, o plugin boundaries não consegue resolver o arquivo de
      // destino de nenhum import (nem relativo) e trata tudo como
      // "unknown" — a regra boundaries/dependencies nunca dispara.
      'import/resolver': {
        typescript: { project: './tsconfig.json' }
      },
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
          mode: 'file',
          capture: ['feature']
        },
        {
          type: 'feature-presentation',
          pattern: 'src/features/*/presentation/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-domain-services',
          pattern: 'src/features/*/domain/services/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-domain-entities',
          pattern: 'src/features/*/domain/entities/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-domain-constants',
          pattern: 'src/features/*/domain/constants/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-domain-utils',
          pattern: 'src/features/*/domain/utils/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-domain-validators',
          pattern: 'src/features/*/domain/validators/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-domain-private',
          pattern: 'src/features/*/domain/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-data-api',
          pattern: 'src/features/*/data/api/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-data-private',
          pattern: 'src/features/*/data/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-tests',
          pattern: 'src/features/*/tests/**',
          capture: ['feature', 'path']
        },
        {
          type: 'feature-private',
          pattern: 'src/features/*/**',
          capture: ['feature', 'path']
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
            ['^@/infra(/.*|$)'],
            ['^@/shared(/.*|$)'],
            ['^@/features(/.*|$)'],
            ['^@/app(/.*|$)'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$']
          ]
        }
      ],
      'local-rules/feature-deep-import': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          // Alvos escopados por feature levam `captured.feature` amarrado ao
          // `from.captured.feature` para impedir que uma feature acesse os
          // internals de OUTRA feature que bata no mesmo tipo (ex: um
          // domain/services de uma feature importando o domain/services de
          // outra). feature-public-api fica sem essa amarra de propósito:
          // consumir a API pública de QUALQUER feature é o padrão desejado.
          rules: [
            {
              from: { type: 'app' },
              allow: [
                { to: { type: 'app' } },
                { to: { type: 'shared' } },
                { to: { type: 'infra' } },
                { to: { type: 'feature-public-api' } }
              ]
            },
            {
              from: { type: 'infra' },
              allow: [{ to: { type: 'infra' } }, { to: { type: 'shared' } }]
            },
            {
              from: { type: 'shared' },
              allow: [{ to: { type: 'shared' } }, { to: { type: 'infra' } }]
            },
            {
              from: { type: 'feature-public-api' },
              allow: [
                {
                  to: {
                    type: 'feature-presentation',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-services',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-data-api',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-validators',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                }
              ]
            },
            {
              from: { type: 'feature-presentation' },
              allow: [
                {
                  to: {
                    type: 'feature-presentation',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-services',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-data-api',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-validators',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-domain-services' },
              allow: [
                {
                  to: {
                    type: 'feature-domain-services',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-data-api',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-validators',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-domain-entities' },
              allow: [
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-validators',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-domain-constants' },
              allow: [
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-domain-validators' },
              allow: [
                {
                  to: {
                    type: 'feature-domain-validators',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-domain-utils' },
              allow: [
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-domain-private' },
              allow: [
                {
                  to: {
                    type: 'feature-domain-services',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-validators',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-private',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-data-api' },
              allow: [
                {
                  to: {
                    type: 'feature-data-api',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-data-private',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'infra' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-data-private' },
              allow: [
                {
                  to: {
                    type: 'feature-data-api',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-data-private',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'feature-public-api' } },
                { to: { type: 'infra' } },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-tests' },
              allow: [
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-validators',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-data-private',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'shared' } }
              ]
            },
            {
              from: { type: 'feature-private' },
              allow: [
                { to: { type: 'feature-public-api' } },
                {
                  to: {
                    type: 'feature-domain-services',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-entities',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-constants',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-utils',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-data-api',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-domain-validators',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                {
                  to: {
                    type: 'feature-tests',
                    captured: { feature: '{{from.captured.feature}}' }
                  }
                },
                { to: { type: 'shared' } }
              ]
            }
          ]
        }
      ]
    }
  },
  eslintConfigPrettier,
  prettierRecommended
]);
