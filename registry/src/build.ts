import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { items } from "./items.ts";
import {
  itemId,
  registryIndexSchema,
  registryItemSchema,
  type RegistryIndex,
  type RegistryItem,
} from "./schema.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "registry/dist/r");
const HOMEPAGE = "https://poise-ui.dev";

/**
 * Stage 1 of the two-stage import rewrite: workspace specifiers become the
 * canonical `@/` form that the registry ships. The CLI performs stage 2,
 * rewriting `@/` to whatever aliases the consumer configured.
 */
const CANONICAL_IMPORTS: Record<string, string> = {
  "@poise-ui/shared": "@/lib/utils",
  "@poise-ui/motion": "@/lib/motion",
};

function toCanonicalImports(source: string) {
  return Object.entries(CANONICAL_IMPORTS).reduce(
    (acc, [from, to]) =>
      acc.replaceAll(`"${from}"`, `"${to}"`).replaceAll(`'${from}'`, `'${to}'`),
    source,
  );
}

async function buildItem(source: (typeof items)[number]): Promise<RegistryItem> {
  const files = await Promise.all(
    source.files.map(async (file) => ({
      path: file.path,
      type: file.type,
      content: toCanonicalImports(
        await readFile(path.join(ROOT, file.src), "utf8"),
      ),
    })),
  );

  return registryItemSchema.parse({
    $schema: `${HOMEPAGE}/schema/registry-item.json`,
    name: source.name,
    type: source.type,
    target: source.target,
    description: source.description,
    dependencies: source.dependencies ?? [],
    registryDependencies: source.registryDependencies ?? [],
    files,
  });
}

async function main() {
  await rm(OUT, { recursive: true, force: true });

  const built = await Promise.all(items.map(buildItem));

  await Promise.all(
    built.map(async (item) => {
      const dir = path.join(OUT, item.target);
      await mkdir(dir, { recursive: true });
      await writeFile(
        path.join(dir, `${item.name}.json`),
        `${JSON.stringify(item, null, 2)}\n`,
      );
    }),
  );

  const index: RegistryIndex = registryIndexSchema.parse({
    name: "poise-ui",
    homepage: HOMEPAGE,
    items: built.map((item) => ({
      id: itemId(item.target, item.name),
      name: item.name,
      target: item.target,
      description: item.description,
    })),
  });

  await writeFile(
    path.join(OUT, "index.json"),
    `${JSON.stringify(index, null, 2)}\n`,
  );

  console.info(`Built ${built.length} registry items to ${path.relative(ROOT, OUT)}`);
}

try {
  await main();
} catch (error) {
  console.error("Registry build failed:", error);
  process.exitCode = 1;
}
