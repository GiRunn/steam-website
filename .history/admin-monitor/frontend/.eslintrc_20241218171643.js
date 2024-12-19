module.exports = {
    root: true,
    extends: [
        'react-app',
        'react-app/jest',
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    plugins: ['react', '@typescript-eslint'],
    rules: {
        'no-unused-vars': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        'react/react-in-jsx-scope': 'off'
    },
    settings: {
        react: {
            version: 'detect'
        }
    }
}; 