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
    description:
      "Design tokens as CSS custom properties plus Tailwind theme mapping.",
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
    description:
      "Shared spring vocabulary for React and Web Component targets.",
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
    dependencies: [
      "@base-ui/react",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
    ],
    registryDependencies: ["shared/tokens", "shared/lib-utils"],
    files: [
      {
        src: "packages/react/src/accordion/accordion.tsx",
        path: "components/ui/accordion.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "morph-accordion",
    target: "react",
    type: "registry:ui",
    description:
      "Accordion whose open item detaches from the stack as a card of its own.",
    dependencies: [
      "@base-ui/react",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "motion",
    ],
    registryDependencies: [
      "shared/tokens",
      "shared/lib-utils",
      "shared/lib-motion",
    ],
    files: [
      {
        src: "packages/react/src/morph-accordion/morph-accordion.tsx",
        path: "components/ui/morph-accordion.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "morph-select",
    target: "react",
    type: "registry:ui",
    description:
      "Select whose popup grows out from behind the trigger and welds to its edge.",
    dependencies: [
      "@base-ui/react",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
    ],
    registryDependencies: ["shared/tokens", "shared/lib-utils"],
    files: [
      {
        src: "packages/react/src/morph-select/morph-select.tsx",
        path: "components/ui/morph-select.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "relight-image",
    target: "react",
    type: "registry:ui",
    description:
      "Image relighting driven by a depth map, Three.js, TSL, and pointer movement.",
    dependencies: ["three", "@types/three"],
    registryDependencies: ["shared/lib-utils"],
    files: [
      {
        src: "packages/react/src/relight-image/relight-image.tsx",
        path: "components/ui/relight-image.tsx",
        type: "registry:ui",
      },
      {
        src: "packages/react/src/relight-image/relight-image-depth.ts",
        path: "components/ui/relight-image-depth.ts",
        type: "registry:ui",
      },
      {
        src: "packages/react/src/relight-image/relight-image-material.ts",
        path: "components/ui/relight-image-material.ts",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "select",
    target: "react",
    type: "registry:ui",
    description:
      "Select built on Base UI, with a popup that grows from the trigger and an animated checkmark.",
    dependencies: [
      "@base-ui/react",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
    ],
    registryDependencies: ["shared/tokens", "shared/lib-utils"],
    files: [
      {
        src: "packages/react/src/select/select.tsx",
        path: "components/ui/select.tsx",
        type: "registry:ui",
      },
    ],
  },
];
