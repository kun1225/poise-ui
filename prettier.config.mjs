export default {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: ["^@?\\w", "", "^[./]"],
  tailwindFunctions: ["cn", "cva"],
};
