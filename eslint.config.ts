import type { Linter } from 'eslint';

type ESLintPlugin = NonNullable<Linter.Config['plugins']>[keyof NonNullable<Linter.Config['plugins']>];

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tsEslint from 'typescript-eslint';

const getDirname = (importMetaUrl: string) => {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = dirname(__filename);
  return __dirname;
};

const __dirname = getDirname(import.meta.url);

const extractConfigRules = (configs: Linter.Config[]) =>
  configs.reduce<NonNullable<Linter.Config['rules']>>((rules, config) => ({ ...rules, ...(config.rules ?? {}) }), {});

export default [
  {
    name: 'ES-modules',
    ignores: ['**/dist/**/*'],
    languageOptions: {
      globals: {
        __filename: 'off',
        __dirname: 'off',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-restricted-globals': [
        'error',
        { name: '__filename', message: '__filename is not defined in the ES module scope' },
        { name: '__dirname', message: '__dirname is not defined in the ES module scope' },
        { name: 'require', message: 'only use ES Module' },
        { name: 'module', message: 'only use ES Module' },
        { name: 'exports', message: 'only use ES Module' },
      ],
      ...prettierConfig.rules,
    },
  },
  {
    name: 'TypeScript',
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsEslint.parser as Linter.Parser,
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint.plugin as ESLintPlugin,
    },
    rules: {
      ...extractConfigRules(tsEslint.configs.strictTypeChecked as Linter.Config[]),
      ...extractConfigRules(tsEslint.configs.stylisticTypeChecked as Linter.Config[]),
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': { descriptionFormat: '^: ts\\(\\d+\\) because .+$' },
          'ts-ignore': { descriptionFormat: '^: ts\\(\\d+\\) because .+$' },
          'ts-nocheck': { descriptionFormat: '^: ts\\(\\d+\\) because .+$' },
          'ts-check': true,
          minimumDescriptionLength: 10,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
] satisfies Linter.Config[];
