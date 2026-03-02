import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import { importX } from "eslint-plugin-import-x";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist", "node_modules"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      prettier: prettierPlugin,
      "import-x": importX,
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "prettier/prettier": "error",
      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // Import hygiene
      "import-x/extensions": [
        "error",
        "ignorePackages",
        {
          js: "always",
          mjs: "always",
          ts: "always",
          mts: "always",
        },
      ],
      "import-x/no-self-import": "error",
      "import-x/no-useless-path-segments": "error",
      "import-x/consistent-type-specifier-style": [
        "error",
        "prefer-top-level",
      ],
      "import-x/export": "error",
      "import-x/no-duplicates": "error",
    },
  },
];
