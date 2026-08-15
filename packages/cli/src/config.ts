import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

export const CONFIG_FILE = "poise.json";

/** `shared` is never a project default; it is only reachable as a dependency. */
export const projectTargetSchema = z.enum(["react", "web"]);
export type ProjectTarget = z.infer<typeof projectTargetSchema>;

export const configSchema = z.object({
  $schema: z.string().optional(),
  registry: z.string(),
  target: projectTargetSchema,
  /** Import specifiers written into the emitted source. */
  aliases: z.object({
    ui: z.string(),
    lib: z.string(),
  }),
  /** Directories on disk, relative to the project root. */
  paths: z.object({
    ui: z.string(),
    lib: z.string(),
    styles: z.string(),
  }),
  /** What has been installed, so `diff` and `update` are possible later. */
  components: z
    .record(z.string(), z.object({ files: z.array(z.string()) }))
    .default({}),
});
export type Config = z.infer<typeof configSchema>;

export function configPath(cwd: string) {
  return path.join(cwd, CONFIG_FILE);
}

export function hasConfig(cwd: string) {
  return existsSync(configPath(cwd));
}

export async function loadConfig(cwd: string): Promise<Config> {
  const file = configPath(cwd);
  if (!existsSync(file)) {
    throw new Error(`No ${CONFIG_FILE} found. Run "poise-ui init" first.`);
  }

  try {
    return configSchema.parse(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${CONFIG_FILE} could not be read: ${detail}`);
  }
}

export async function saveConfig(cwd: string, config: Config) {
  await writeFile(configPath(cwd), `${JSON.stringify(config, null, 2)}\n`);
}
