import { defineCommand } from "citty";
import { log } from "@clack/prompts";
import pc from "picocolors";

import { loadConfig } from "../config.ts";
import { fetchIndex } from "../registry.ts";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List everything available in the registry.",
  },
  args: {
    cwd: { type: "string", description: "Project directory" },
    registry: { type: "string", description: "Registry URL or local directory" },
  },
  async run({ args }) {
    const cwd = args.cwd ?? process.cwd();

    try {
      const registry = args.registry ?? (await loadConfig(cwd)).registry;
      const index = await fetchIndex(registry);

      const rows = index.items.map(
        (item) => `  ${pc.cyan(item.id.padEnd(20))} ${pc.dim(item.description ?? "")}`,
      );
      log.message(`${pc.bold(index.name)}\n${rows.join("\n")}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      log.error(detail);
      process.exitCode = 1;
    }
  },
});
