import { defineCommand } from "citty";
import { intro, log, outro, spinner } from "@clack/prompts";
import { itemId } from "@poise-ui/registry/schema";
import { addDependency } from "nypm";
import pc from "picocolors";

import {
  loadConfig,
  projectTargetSchema,
  saveConfig,
  type Config,
  type ProjectTarget,
} from "../config.ts";
import { resolveItems } from "../registry.ts";
import { writeItemFiles } from "../write.ts";

export type AddOptions = {
  cwd: string;
  config: Config;
  ids: string[];
  target: ProjectTarget;
  overwrite: boolean;
  install: boolean;
};

/** Shared by `add` and `init`, which installs the token item on setup. */
export async function addItems({
  cwd,
  config,
  ids,
  target,
  overwrite,
  install,
}: AddOptions) {
  const items = await resolveItems(config.registry, ids, target);

  const written: string[] = [];
  const components: Config["components"] = { ...config.components };

  for (const item of items) {
    const files = await writeItemFiles(cwd, config, item, overwrite);
    if (files.length === 0) continue;
    written.push(...files);
    components[itemId(item.target, item.name)] = { files };
  }

  const dependencies = [
    ...new Set(items.flatMap((item) => item.dependencies)),
  ].sort();

  if (install && dependencies.length > 0) {
    const progress = spinner();
    progress.start(`Installing ${dependencies.join(", ")}`);
    try {
      await addDependency(dependencies, { cwd, silent: true });
      progress.stop(`Installed ${dependencies.length} dependencies`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      progress.stop(pc.yellow("Dependency install failed"));
      log.warn(`${detail}\nInstall manually: ${dependencies.join(" ")}`);
    }
  }

  await saveConfig(cwd, { ...config, components });

  return { written, dependencies };
}

export const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add a component to your project.",
  },
  args: {
    component: {
      type: "positional",
      required: true,
      description: 'Component name, e.g. "accordion" or "react/accordion"',
    },
    target: {
      type: "string",
      description: "Override the target for this run (react or web)",
    },
    cwd: { type: "string", description: "Project directory" },
    overwrite: {
      type: "boolean",
      default: false,
      description: "Overwrite existing files without asking",
    },
    install: {
      type: "boolean",
      default: true,
      description: "Install npm dependencies",
    },
  },
  async run({ args }) {
    const cwd = args.cwd ?? process.cwd();

    try {
      const config = await loadConfig(cwd);
      const target = args.target
        ? projectTargetSchema.parse(args.target)
        : config.target;

      const ids = args._.length > 0 ? args._ : [args.component];

      intro(pc.bgBlue(pc.black(" poise-ui add ")));

      const { written, dependencies } = await addItems({
        cwd,
        config,
        ids,
        target,
        overwrite: args.overwrite,
        install: args.install,
      });

      if (written.length === 0) {
        outro(pc.yellow("Nothing written."));
        return;
      }

      log.success(
        `Added ${written.length} file(s):\n${written.map((file) => `  ${pc.dim(file)}`).join("\n")}`,
      );
      if (dependencies.length > 0) {
        log.info(`Dependencies: ${dependencies.join(", ")}`);
      }
      outro(pc.green("Done."));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      log.error(detail);
      process.exitCode = 1;
    }
  },
});
