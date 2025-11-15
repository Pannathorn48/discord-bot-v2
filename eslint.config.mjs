// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default defineConfig({
  extends: [
    eslint.configs.recommended,
    // tseslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic
  ],
  settings: {
    'import-x/resolver-next': [
      createTypeScriptImportResolver({
        alwaysTryTypes: true,
        project: './tsconfig.json',
      }),
    ],
  },
  rules: {
    "@typescript-eslint/no-extraneous-class": "off"
  }
});