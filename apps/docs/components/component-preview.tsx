import { readFile } from "node:fs/promises";
import path from "node:path";

import { PreviewTabs } from "@/components/preview-tabs";

/** Statically scoped so Turbopack traces only this folder, not the project. */
const DEMO_DIR = "components/demos";

export async function ComponentPreview({ name }: { name: DemoName }) {
  const demo = demos[name];

  const [react, web] = await Promise.all(
    [demo.react.src, demo.web.src].map((src) =>
      readFile(path.join(process.cwd(), DEMO_DIR, src), "utf8"),
    ),
  );

  return (
    <PreviewTabs
      react={demo.react.node}
      web={demo.web.node}
      code={{ react: react ?? "", web: web ?? "" }}
    />
  );
}
