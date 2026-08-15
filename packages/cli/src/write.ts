import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { confirm, isCancel } from "@clack/prompts";
import type { RegistryFileType, RegistryItem } from "@poise-ui/registry/schema";

import type { Config } from "./config.ts";

const DIRECTORY_FOR: Record<RegistryFileType, keyof Config["paths"]> = {
  "registry:ui": "ui",
  "registry:lib": "lib",
  "registry:style": "styles",
};

/**
 * Stage 2 of the import rewrite. The registry ships canonical `@/` specifiers;
 * here they become whatever aliases the consumer configured at init.
 */
function applyAliases(content: string, config: Config) {
  return content
    .replaceAll("@/components/ui", config.aliases.ui)
    .replaceAll("@/lib", config.aliases.lib);
}

export async function writeItemFiles(
  cwd: string,
  config: Config,
  item: RegistryItem,
  overwrite: boolean,
): Promise<string[]> {
  const written: string[] = [];

  for (const file of item.files) {
    const relative = path.join(
      config.paths[DIRECTORY_FOR[file.type]],
      path.basename(file.path),
    );
    const absolute = path.join(cwd, relative);
    const content = applyAliases(file.content, config);

    // Shared items are pulled in by both targets. Re-writing identical bytes
    // is a no-op, so never make the user answer for it.
    const unchanged =
      existsSync(absolute) && (await readFile(absolute, "utf8")) === content;

    if (existsSync(absolute) && !unchanged && !overwrite) {
      const proceed = await confirm({
        message: `${relative} already exists. Overwrite?`,
        initialValue: false,
      });
      if (isCancel(proceed) || !proceed) continue;
    }

    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, content);
    written.push(relative);
  }

  return written;
}
