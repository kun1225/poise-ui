import { readFile } from "node:fs/promises";
import path from "node:path";
import { AccordionDemo } from "@/components/demos/accordion/default";
import { AccordionStaggerDemo } from "@/components/demos/accordion/stagger";
import { MorphAccordionDemo } from "@/components/demos/morph-accordion/default";
import { MorphAccordionDepthDemo } from "@/components/demos/morph-accordion/depth";
import { MorphAccordionGapDemo } from "@/components/demos/morph-accordion/gap";
import { MorphAccordionNoBorderDemo } from "@/components/demos/morph-accordion/no-border";
import { SelectAlignItemDemo } from "@/components/demos/select/align-item";
import { SelectDemo } from "@/components/demos/select/default";
import { SelectGroupsDemo } from "@/components/demos/select/groups";
import { SelectPlacementDemo } from "@/components/demos/select/placement";
import { SelectScrollDemo } from "@/components/demos/select/scroll";
import { PreviewPanel } from "@/components/preview-panel";

/** Statically scoped so Turbopack traces only this folder, not the project. */
const DEMO_DIR = "components/demos";

/**
 * The rendered demo and the file its source is read from, keyed by name. One
 * folder per component, one file per option it documents.
 */
const demos = {
  accordion: { node: <AccordionDemo />, src: "accordion/default.tsx" },
  "accordion-stagger": {
    node: <AccordionStaggerDemo />,
    src: "accordion/stagger.tsx",
  },
  "morph-accordion": {
    node: <MorphAccordionDemo />,
    src: "morph-accordion/default.tsx",
  },
  "morph-accordion-no-border": {
    node: <MorphAccordionNoBorderDemo />,
    src: "morph-accordion/no-border.tsx",
  },
  "morph-accordion-depth": {
    node: <MorphAccordionDepthDemo />,
    src: "morph-accordion/depth.tsx",
  },
  "morph-accordion-gap": {
    node: <MorphAccordionGapDemo />,
    src: "morph-accordion/gap.tsx",
  },
  select: { node: <SelectDemo />, src: "select/default.tsx" },
  "select-groups": {
    node: <SelectGroupsDemo />,
    src: "select/groups.tsx",
  },
  "select-align-item": {
    node: <SelectAlignItemDemo />,
    src: "select/align-item.tsx",
  },
  "select-placement": {
    node: <SelectPlacementDemo />,
    src: "select/placement.tsx",
  },
  "select-scroll": { node: <SelectScrollDemo />, src: "select/scroll.tsx" },
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
