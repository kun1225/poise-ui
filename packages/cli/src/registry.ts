import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  itemId,
  parseItemId,
  registryIndexSchema,
  registryItemSchema,
  type RegistryIndex,
  type RegistryItem,
  type RegistryTarget,
} from "@poise-ui/registry/schema";

const isRemote = (registry: string) => /^https?:\/\//.test(registry);

async function readRaw(registry: string, relative: string) {
  if (isRemote(registry)) {
    const url = `${registry.replace(/\/+$/, "")}/${relative}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Could not fetch ${url} (HTTP ${response.status}).`);
    }
    return response.text();
  }

  const file = path.resolve(registry, relative);
  try {
    return await readFile(file, "utf8");
  } catch {
    throw new Error(`Could not read ${file}.`);
  }
}

async function fetchItem(
  registry: string,
  target: RegistryTarget,
  name: string,
): Promise<RegistryItem> {
  const raw = await readRaw(registry, `${target}/${name}.json`);
  const parsed = registryItemSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(
      `Registry item "${itemId(target, name)}" is malformed: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}

export async function fetchIndex(registry: string): Promise<RegistryIndex> {
  return registryIndexSchema.parse(
    JSON.parse(await readRaw(registry, "index.json")),
  );
}

/**
 * Depth-first resolution of registryDependencies. Dependencies are ordered
 * before their dependents, and the visited set doubles as a cycle guard.
 */
export async function resolveItems(
  registry: string,
  ids: string[],
  defaultTarget: RegistryTarget,
): Promise<RegistryItem[]> {
  const seen = new Set<string>();
  const resolved: RegistryItem[] = [];

  const visit = async (id: string) => {
    const { target, name } = parseItemId(id, defaultTarget);
    const key = itemId(target, name);
    if (seen.has(key)) return;
    seen.add(key);

    const item = await fetchItem(registry, target, name);
    for (const dependency of item.registryDependencies) {
      await visit(dependency);
    }
    resolved.push(item);
  };

  for (const id of ids) {
    await visit(id);
  }
  return resolved;
}
