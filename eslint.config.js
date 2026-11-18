import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  { ignores: ['build/', '.svelte-kit/', 'package/', '**/fixtures/'] },
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs['flat/recommended'],
  prettier,
  svelte.configs['flat/prettier'],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.svelte', '**/*.svelte.ts'], languageOptions: { parserOptions: { parser: ts.parser } } },
  {
    // The app has no base path, and its dates are plain local values, not reactive state
    rules: { 'svelte/no-navigation-without-resolve': 'off', 'svelte/prefer-svelte-reactivity': 'off' },
  },
);
