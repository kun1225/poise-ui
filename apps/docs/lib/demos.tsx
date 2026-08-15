import { ButtonDemo } from "@/components/demos/button-demo";
import { PoiseButtonDemo } from "@/components/demos/poise-button-demo";

/**
 * Every preview declares both targets. `src` is a filename inside DEMO_DIR,
 * read at build time so the code shown is always the code that rendered.
 * Keeping it a bare filename keeps the fs path statically scoped for tracing.
 */
export const demos = {
  button: {
    react: {
      node: <ButtonDemo />,
      src: "button-demo.tsx",
    },
    web: {
      node: <PoiseButtonDemo />,
      src: "poise-button-demo.tsx",
    },
  },
} as const;

export type DemoName = keyof typeof demos;
