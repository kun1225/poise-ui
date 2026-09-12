import { readFile } from "node:fs/promises";
import path from "node:path";
import { AccordionDemo } from "@/components/demos/accordion/default";
import { AccordionStaggerDemo } from "@/components/demos/accordion/stagger";
import { LiquidTabDemo } from "@/components/demos/liquid-tab/default";
import { LiquidTabIconDemo } from "@/components/demos/liquid-tab/icon";
import { LiquidTabIconEndDemo } from "@/components/demos/liquid-tab/icon-end";
import { LiquidTabIconsAllDemo } from "@/components/demos/liquid-tab/icons-all";
import { MorphAccordionDemo } from "@/components/demos/morph-accordion/default";
import { MorphAccordionDepthDemo } from "@/components/demos/morph-accordion/depth";
import { MorphAccordionGapDemo } from "@/components/demos/morph-accordion/gap";
import { MorphAccordionNoBorderDemo } from "@/components/demos/morph-accordion/no-border";
import { MorphSelectDemo } from "@/components/demos/morph-select/default";
import { MorphSelectGroupsDemo } from "@/components/demos/morph-select/groups";
import { MorphSelectScrollDemo } from "@/components/demos/morph-select/scroll";
import { MorphSelectSideDemo } from "@/components/demos/morph-select/side";
import { MorphTabDemo } from "@/components/demos/morph-tab/default";
import { MorphTabGapDemo } from "@/components/demos/morph-tab/gap";
import { RelightImageDemo } from "@/components/demos/relight-image/default";
import { SelectAlignItemDemo } from "@/components/demos/select/align-item";
import { SelectDemo } from "@/components/demos/select/default";
import { SelectGroupsDemo } from "@/components/demos/select/groups";
import { SelectPlacementDemo } from "@/components/demos/select/placement";
import { SelectScrollDemo } from "@/components/demos/select/scroll";
import { SliderDemo } from "@/components/demos/slider/default";
import { SliderRigidDemo } from "@/components/demos/slider/rigid";
import { SliderStepsDemo } from "@/components/demos/slider/steps";
import { SliderTwoDemo } from "@/components/demos/slider/two-slider";
import { TabDemo } from "@/components/demos/tab/default";
import { PreviewPanel } from "@/components/preview-panel";
import { Fragment } from "react";

/** Statically scoped so Turbopack traces only this folder, not the project. */
const DEMO_DIR = "components/demos";

/**
 * The rendered demo and the file its source is read from, keyed by name. One
 * folder per component, one file per option it documents.
 */
const demos = {
  accordion: {
    label: "React",
    node: <AccordionDemo />,
    src: "accordion/default.tsx",
  },
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
  "liquid-tab": {
    node: <LiquidTabDemo />,
    src: "liquid-tab/default.tsx",
  },
  "liquid-tab-icon": {
    node: <LiquidTabIconDemo />,
    src: "liquid-tab/icon.tsx",
  },
  "liquid-tab-icons-all": {
    node: <LiquidTabIconsAllDemo />,
    src: "liquid-tab/icons-all.tsx",
  },
  "liquid-tab-icon-end": {
    node: <LiquidTabIconEndDemo />,
    src: "liquid-tab/icon-end.tsx",
  },
  "morph-select": {
    node: <MorphSelectDemo />,
    src: "morph-select/default.tsx",
  },
  "morph-select-side": {
    node: <MorphSelectSideDemo />,
    src: "morph-select/side.tsx",
  },
  "morph-select-groups": {
    node: <MorphSelectGroupsDemo />,
    src: "morph-select/groups.tsx",
  },
  "morph-select-scroll": {
    node: <MorphSelectScrollDemo />,
    src: "morph-select/scroll.tsx",
  },
  "morph-tab": {
    node: <MorphTabDemo />,
    src: "morph-tab/default.tsx",
  },
  "morph-tab-gap": {
    node: <MorphTabGapDemo />,
    src: "morph-tab/gap.tsx",
  },
  "relight-image": {
    node: <RelightImageDemo />,
    src: "relight-image/default.tsx",
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
  slider: { node: <SliderDemo />, src: "slider/default.tsx" },
  "slider-two": { node: <SliderTwoDemo />, src: "slider/two-slider.tsx" },
  "slider-steps": { node: <SliderStepsDemo />, src: "slider/steps.tsx" },
  "slider-rigid": { node: <SliderRigidDemo />, src: "slider/rigid.tsx" },
  tab: { node: <TabDemo />, src: "tab/default.tsx" },
} as const;

export type DemoName = keyof typeof demos;

export async function ComponentPreview({
  name,
  names,
}: {
  name?: DemoName;
  names?: DemoName[];
}) {
  const selectedNames = names ?? (name ? [name] : []);

  if (selectedNames.length === 0) {
    throw new Error("ComponentPreview requires a name or names.");
  }

  const previews = await Promise.all(
    selectedNames.map(async (selectedName) => {
      const demo = demos[selectedName];
      const code = await readFile(
        path.join(process.cwd(), DEMO_DIR, demo.src),
        "utf8",
      );

      return { code, demo };
    }),
  );

  return (
    <PreviewPanel
      codes={previews.map((preview) => preview.code)}
      labels={previews.map((preview) =>
        "label" in preview.demo ? preview.demo.label : "Preview",
      )}
    >
      {previews.map((preview, index) => (
        <Fragment key={selectedNames[index]}>{preview.demo.node}</Fragment>
      ))}
    </PreviewPanel>
  );
}
