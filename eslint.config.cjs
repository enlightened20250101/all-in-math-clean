const reactHooks = require("eslint-plugin-react-hooks");
const next = require("@next/eslint-plugin-next");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "@next/next": next,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      "no-undef": "off",
      "no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "scripts/**"],
  },
];
