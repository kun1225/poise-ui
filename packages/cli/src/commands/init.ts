import { defineCommand } from "citty";
import { cancel, intro, isCancel, log, outro, select, text } from "@clack/prompts";
import pc from "picocolors";

import {
  CONFIG_FILE,
  configSchema,
  hasConfig,
  projectTargetSchema,
  saveConfig,
  type Config,
  type ProjectTarget,
} from "../config.ts";
import { addItems } from "./add.ts";

const DEFAULT_REGISTRY = "https://poise-ui.dev/r";

const PATH_DEFAULTS = {
  target: "react",
  ui: "src/components/ui",
  lib: "src/lib",
  styles: "src/styles",
  aliasUi: "@/components/ui",
  aliasLib: "@/lib",
} as const;

async function prompt<T>(value: Promise<T | symbol>): Promise<T> {
  const result = await value;
  if (isCancel(result)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return result;
}

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description: `Create ${CONFIG_FILE} and install the design tokens.`,
  },
  args: {
    cwd: { type: "string", description: "Project directory" },
    registry: {
      type: "string",
      description: "Registry URL or local directory",
    },
    target: {
      type: "string",
      description: "react or web (skips the target prompt)",
    },
    yes: {
      type: "boolean",
      alias: "y",
      default: false,
      description: "Accept every default without prompting",
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
      intro(pc.bgBlue(pc.black(" poise-ui init ")));

      if (hasConfig(cwd) && !args.yes) {
        const proceed = await prompt(
          select({
            message: `${CONFIG_FILE} already exists. Overwrite it?`,
            options: [
              { value: false, label: "No, keep it" },
              { value: true, label: "Yes, start over" },
            ],
          }),
        );
        if (!proceed) {
          outro("Kept existing config.");
          return;
        }
      }

      /** With --yes every prompt resolves to its default, so init runs in CI. */
      const askText = async (message: string, initialValue: string) =>
        args.yes ? initialValue : prompt(text({ message, initialValue }));

      const target: ProjectTarget = args.target
        ? projectTargetSchema.parse(args.target)
        : args.yes
          ? PATH_DEFAULTS.target
          : await prompt(
              select<ProjectTarget>({
                message: "Which target is this project?",
                options: [
                  { value: "react", label: "React", hint: "Base UI + Motion" },
                  {
                    value: "web",
                    label: "Web Components",
                    hint: "Custom elements + Tailwind",
                  },
                ],
              }),
            );

      const uiPath = await askText(
        "Where should components be written?",
        PATH_DEFAULTS.ui,
      );
      const libPath = await askText(
        "Where should shared utilities be written?",
        PATH_DEFAULTS.lib,
      );
      const stylesPath = await askText(
        "Where should stylesheets be written?",
        PATH_DEFAULTS.styles,
      );
      const uiAlias = await askText(
        "Import alias for components",
        PATH_DEFAULTS.aliasUi,
      );
      const libAlias = await askText(
        "Import alias for utilities",
        PATH_DEFAULTS.aliasLib,
      );

      const config: Config = configSchema.parse({
        $schema: "https://poise-ui.dev/schema/config.json",
        registry: args.registry ?? DEFAULT_REGISTRY,
        target,
        aliases: { ui: uiAlias, lib: libAlias },
        paths: { ui: uiPath, lib: libPath, styles: stylesPath },
        components: {},
      });

      await saveConfig(cwd, config);
      log.success(`Wrote ${CONFIG_FILE}`);

      const { written } = await addItems({
        cwd,
        config,
        ids: ["shared/tokens"],
        target,
        overwrite: true,
        install: args.install,
      });

      if (written[0]) {
        log.info(
          `Tokens written to ${pc.dim(written[0])} — import it from your global stylesheet.`,
        );
      }
      outro(pc.green(`Ready. Try: poise-ui add accordion`));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      log.error(detail);
      process.exitCode = 1;
    }
  },
});
