import { readFile } from "node:fs/promises";
import path from "node:path";
import { AccordionDemo } from "@/components/demos/accordion-demo";
import { AccordionStaggerDemo } from "@/components/demos/accordion-stagger-demo";
import { MorphAccordionDemo } from "@/components/demos/morph-accordion-demo";
import { MorphAccordionPlainDemo } from "@/components/demos/morph-accordion-plain-demo";
import { SelectDemo } from "@/components/demos/select-demo";
import { SelectGroupsDemo } from "@/components/demos/select-groups-demo";
import { PreviewPanel } from "@/components/preview-panel";

/** Statically scoped so Turbopack traces only this folder, not the project. */
const DEMO_DIR = "components/demos";

/** The rendered demo and the file its source is read from, keyed by name. */
const demos = {
  accordion: { node: <AccordionDemo />, src: "accordion-demo.tsx" },
  "accordion-stagger": {
    node: <AccordionStaggerDemo />,
    src: "accordion-stagger-demo.tsx",
  },
  "morph-accordion": {
    node: <MorphAccordionDemo />,
    src: "morph-accordion-demo.tsx",
  },
  "morph-accordion-plain": {
    node: <MorphAccordionPlainDemo />,
    src: "morph-accordion-plain-demo.tsx",
  },
  select: { node: <SelectDemo />, src: "select-demo.tsx" },
  "select-groups": {
    node: <SelectGroupsDemo />,
    src: "select-groups-demo.tsx",
  },
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
