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
    name: "accordion",
    target: "react",
    type: "registry:ui",
    description:
      "Accordion built on Base UI, with a CSS-driven panel height transition.",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["shared/tokens", "shared/lib-utils"],
    files: [
      {
        src: "packages/react/src/accordion/accordion.tsx",
        path: "components/ui/accordion.tsx",
        type: "registry:ui",
      },
    ],
  },
];
