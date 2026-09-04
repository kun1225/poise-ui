import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: [
    "@poise-ui/motion",
    "@poise-ui/react",
    "@poise-ui/shared",
  ],
};

export default createMDX()(config);
