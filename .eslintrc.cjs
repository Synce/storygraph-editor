/** @type {import("eslint").Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'prettier',
    'sonarjs',
    '@tanstack/query',
  ],
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended',
    'eslint:recommended',
    'airbnb',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:react/jsx-runtime',
    'plugin:sonarjs/recommended',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:import/typescript',
  ],
  rules: {
    'react/jsx-curly-brace-presence': ['warn', {children: 'always'}],
    'no-plusplus': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    'react/jsx-filename-extension': [
      'error',
      {
        allow: 'as-needed',
        extensions: ['.tsx'],
      },
    ],
    'import/no-unused-modules': [
      'warn',
      {
        unusedExports: true,
        ignoreExports: ['**/layout.tsx', 'src/trpc/*', '**/page.tsx'],
      },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'never',
      {
        json: 'always',
      },
    ],
    'react/prop-types': 'off',
    'react/style-prop-object': 'off',
    'no-shadow': 'off',
    camelcase: 'off',
    'react/jsx-props-no-spreading': ['off'],
    'import/no-extraneous-dependencies': [
      'error',
      {devDependencies: ['**/*.test.js']},
    ],
    '@typescript-eslint/no-shadow': ['off'],
    'no-underscore-dangle': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
      },
    ],
    'no-param-reassign': ['warn', {props: false}],
    'no-void': 'off',
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'sibling',
          'parent',
          'type',
        ],
        pathGroups: [
          {
            pattern: '{react}',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        args: 'all',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    'no-console': ['warn', {allow: ['warn', 'error']}],
    '@typescript-eslint/restrict-template-expressions': [
      'warn',
      {allowNumber: true, allowBoolean: true},
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
};

module.exports = config;
