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
        files: ['webpack*.config.ts', 'config/**/*.ts'],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        rules: {
            // JSX is indented by react/jsx-indent. Airbnb leaves JSX out of indent; without that,
            // both rules fix the same lines differently and never agree.
            indent: [2, 2, {
                ignoredNodes: [
                    'JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName',
                    'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement',
                    'JSXClosingElement', 'JSXFragment', 'JSXOpeningFragment', 'JSXClosingFragment', 'JSXText',
                    'JSXEmptyExpression', 'JSXSpreadChild',
                ],
            }],
            // Airbnb's ignore options, so long SVG paths, strings and URLs do not count
            'max-len': ['error', {
                code: 200,
                ignoreComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true,
            }],
            // rel="noopener" is enough: the opened page cannot reach window.opener, and the sites and
            // file hosts we link to still get the Referer they get today (noreferrer would remove it)
            'react/jsx-no-target-blank': ['error', { allowReferrer: true, enforceDynamicLinks: 'always' }],
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            // TypeScript reports undefined names itself; ESLint's core rule does not know type-only names like React.ChangeEvent
            'no-undef': 'off',
        },
    },
];
