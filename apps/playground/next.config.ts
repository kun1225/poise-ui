import type { NextConfig } from "next";

const config: NextConfig = {
  // The workspace packages export raw TypeScript source, so Next must compile
  // them rather than treat them as pre-built dependencies.
  transpilePackages: [
    "@poise-ui/motion",
    "@poise-ui/react",
    "@poise-ui/shared",
    "@poise-ui/web",
  ],
};

export default config;
