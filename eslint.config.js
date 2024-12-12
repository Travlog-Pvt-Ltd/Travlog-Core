import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    {
        languageOptions: {
            globals: globals.node,
            ecmaVersion: 2022,
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-unused-expressions': 'warn',
            'no-useless-catch': 'warn',
        },
    },
];
