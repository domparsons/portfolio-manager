import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ["dist/", "node_modules/"] },
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: globals.browser } },
  {
    files: ["tailwind.config.js"],
    languageOptions: { globals: { ...globals.node, require: true } },
  },
  {
    files: ["vite.config.js"],
    languageOptions: { globals: { ...globals.node, __dirname: true } },
  },
  pluginJs.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: "detect" } },
  },
];
