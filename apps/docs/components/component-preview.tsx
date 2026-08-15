import { readFile } from "node:fs/promises";
import path from "node:path";

import { AccordionDemo } from "@/components/demos/accordion-demo";
import { PreviewPanel } from "@/components/preview-panel";

/** Statically scoped so Turbopack traces only this folder, not the project. */
const DEMO_DIR = "components/demos";

/** The rendered demo and the file its source is read from, keyed by name. */
const demos = {
  accordion: { node: <AccordionDemo />, src: "accordion-demo.tsx" },
} as const;

export type DemoName = keyof typeof demos;

export async function ComponentPreview({ name }: { name: DemoName }) {
  const demo = demos[name];
  const code = await readFile(
    path.join(process.cwd(), DEMO_DIR, demo.src),
    "utf8",
  );

  return <PreviewPanel code={code}>{demo.node}</PreviewPanel>;
}
