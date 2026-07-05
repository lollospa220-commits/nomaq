const nextConfig = require('eslint-config-next');

module.exports = [
  {
    // Never lint dependency / build / local-tooling directories.
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      '.npm-local/**',
      'coverage/**',
      'public/**',
      'next-env.d.ts',
    ],
  },
  ...nextConfig,
  {
    rules: {
      // Stylistic-only: escaping every apostrophe/quote in Italian copy adds
      // noise without preventing any real bug. Kept off project-wide.
      'react/no-unescaped-entities': 'off',
      // We intentionally use <img> for remote Unsplash art today; migrating the
      // feed to next/image is tracked separately. Surface as a warning.
      '@next/next/no-img-element': 'warn',
      // react-hooks v7 (pulled in by eslint-config-next 16) promoted two very
      // aggressive rules to errors. They fire on legitimate patterns already in
      // this codebase — reading localStorage in a mount effect, and Math.random()
      // inside a click handler — so keep them visible as warnings, not gate
      // failures. Revisit when refactoring the affected components.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
];
