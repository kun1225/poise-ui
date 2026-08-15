import type { RegistryFileType, RegistryTarget } from "./schema.ts";

export type ItemSource = {
  name: string;
  target: RegistryTarget;
  type: RegistryFileType;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: Array<{
    /** Path on disk, relative to the repo root. */
    src: string;
    /** Emitted shadcn-style path. */
    path: string;
    type: RegistryFileType;
  }>;
};

export const items: ItemSource[] = [
  {
    name: "tokens",
    target: "shared",
    type: "registry:style",
    description: "Design tokens as CSS custom properties plus Tailwind theme mapping.",
    files: [
      {
        src: "packages/tokens/src/tokens.css",
        path: "styles/poise-tokens.css",
        type: "registry:style",
      },
    ],
  },
  {
    name: "lib-motion",
    target: "shared",
    type: "registry:lib",
    description: "Shared spring vocabulary for React and Web Component targets.",
    files: [
      {
        src: "packages/motion/src/springs.ts",
        path: "lib/motion.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "lib-utils",
    target: "shared",
    type: "registry:lib",
    description: "The cn() class merging helper.",
    dependencies: ["clsx", "tailwind-merge"],
    files: [
      {
        src: "packages/shared/src/cn.ts",
        path: "lib/utils.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "button",
    target: "react",
    type: "registry:ui",
    description: "Button with variants, sizes and a spring press interaction.",
    dependencies: ["motion", "class-variance-authority"],
    registryDependencies: ["shared/tokens", "shared/lib-utils", "shared/lib-motion"],
    files: [
      {
        src: "packages/react/src/button/button.tsx",
        path: "components/ui/button.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "button",
    target: "web",
    type: "registry:ui",
    description: "Lit button matching the React design, tokens and press spring.",
    dependencies: ["lit", "motion"],
    registryDependencies: ["shared/tokens", "shared/lib-motion"],
    files: [
      {
        src: "packages/web/src/button/poise-button.ts",
        path: "components/ui/poise-button.ts",
        type: "registry:ui",
      },
    ],
  },
];
