import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    languageOptions: {
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "jsx-a11y/alt-text": "off",
      // Разрешаем использование any в серверных маршрутах для упрощения маппинга
      "@typescript-eslint/no-explicit-any": "off",
      // Разрешаем пустые интерфейсы в некоторых местах
      "@typescript-eslint/no-empty-object-type": "off",
      // В клиентских компонентах допускаем упрощенное управление зависимостями
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
