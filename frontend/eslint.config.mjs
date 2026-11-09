import { configs as airbnb } from 'eslint-config-airbnb-extended/legacy';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
    {
        ignores: ['build/**', 'node_modules/**'],
    },
    react.configs.flat.recommended,
    ...airbnb.react.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
        },
    },
    {
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.jest,
                __IS_DEV__: 'readonly',
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/jsx-indent': [2, 2],
            'react/jsx-indent-props': [2, 2],
            indent: [2, 2],
            'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.tsx', '.ts'] }],
            'import/no-unresolved': 'off',
            'import/prefer-default-export': 'off',
            'no-unused-vars': 'warn',
            'react/require-default-props': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-props-no-spreading': 'warn',
            'react/function-component-definition': 'off',
            'no-shadow': 'off',
            'import/extensions': 'off',
            'import/no-extraneous-dependencies': 'off',
            'no-underscore-dangle': 'off',
            'jsx-a11y/label-has-associated-control': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'max-len': ['error', { ignoreComments: true, code: 200 }],
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            // TypeScript checks the props where they are typed
            'react/prop-types': 'off',
            // Replaced by naming-convention, like in Airbnb's TypeScript config: our own names
            // are checked, the snake_case fields of the API (Python backend) are not
            camelcase: 'off',
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
                { selector: 'function', format: ['camelCase', 'PascalCase'] },
                { selector: 'typeLike', format: ['PascalCase'] },
                // API fields that are destructured keep their name
                { selector: 'variable', modifiers: ['destructured'], format: null },
                // Global defined by webpack
                { selector: 'variable', filter: { regex: '^__IS_DEV__$', match: true }, format: null },
            ],
        },
    },
    {
        files: ['webpack*.config.ts', 'config/**/*.ts'],
        languageOptions: {
            globals: globals.node,
        },
    },
];
