import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [".vite/**", "dist/**", "coverage/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    settings: { react: { version: "19.2" } },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat.recommended,
  },
  {
    files: ["**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat["jsx-runtime"],
  },
  {
    files: ["src/components/**/*.tsx"],
    ignores: ["src/components/ui/**", "src/components/**/*.test.tsx"],
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ["src/components/**/*.test.tsx"],
    rules: {
      "max-lines": ["error", { max: 450, skipBlankLines: true, skipComments: true }],
    },
  },
])
