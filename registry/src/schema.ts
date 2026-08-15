import { z } from "zod";

/**
 * `shared` items are target-agnostic (utils, motion vocabulary, tokens).
 * `react` and `web` are the two implementation targets.
 */
export const registryTargetSchema = z.enum(["react", "web", "shared"]);
export type RegistryTarget = z.infer<typeof registryTargetSchema>;

/** Determines which configured directory the CLI writes the file into. */
export const registryFileTypeSchema = z.enum([
  "registry:ui",
  "registry:lib",
  "registry:style",
]);
export type RegistryFileType = z.infer<typeof registryFileTypeSchema>;

export const registryFileSchema = z.object({
  /** Full shadcn-style path, e.g. "components/ui/button.tsx". */
  path: z.string(),
  type: registryFileTypeSchema,
  content: z.string(),
});

export const registryItemSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  /** Item-level type, kept for shadcn CLI compatibility. */
  type: registryFileTypeSchema,
  /** Poise extension: shadcn has no concept of multiple implementations. */
  target: registryTargetSchema,
  description: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  /** Fully-qualified ids, e.g. "shared/lib-motion". */
  registryDependencies: z.array(z.string()).default([]),
  files: z.array(registryFileSchema).min(1),
});
export type RegistryItem = z.infer<typeof registryItemSchema>;

export const registryIndexSchema = z.object({
  name: z.string(),
  homepage: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      target: registryTargetSchema,
      description: z.string().optional(),
    }),
  ),
});
export type RegistryIndex = z.infer<typeof registryIndexSchema>;

export function itemId(target: RegistryTarget, name: string) {
  return `${target}/${name}`;
}

/** Accepts "react/button" or a bare "button" resolved against a default target. */
export function parseItemId(input: string, defaultTarget: RegistryTarget) {
  const slash = input.indexOf("/");
  if (slash === -1) return { target: defaultTarget, name: input };

  const target = registryTargetSchema.safeParse(input.slice(0, slash));
  if (!target.success) {
    throw new Error(
      `Unknown target in "${input}". Expected react, web or shared.`,
    );
  }
  return { target: target.data, name: input.slice(slash + 1) };
}
