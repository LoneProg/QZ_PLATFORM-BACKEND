// eslint.config.js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: process.cwd(), recommendedConfig: "eslint:recommended" });

export default [
  ...compat.extends("eslint:recommended"),
  {
    files: ["**/*.ts", "**/*.js"],
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"]
    }
  }
];
