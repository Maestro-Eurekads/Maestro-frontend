import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser, // Use TypeScript ESLint parser
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin, // Use the plugin property
    },
    rules: {
      // Disable `no-unused-vars`
      "@typescript-eslint/no-unused-vars": "off",

      // Disable `no-explicit-any`
      "@typescript-eslint/no-explicit-any": "off",

      // Customize rules if needed
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
    },
  },

  // Use the recommended configs
  js.configs.recommended,
  tseslint.configs.base, // Correct way to use the base config
];
