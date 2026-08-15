import type { MDXComponents } from "mdx/types";

import { Callout } from "@/components/callout";
import { ComponentPreview } from "@/components/component-preview";
import { InstallCommand } from "@/components/install-command";

export const mdxComponents: MDXComponents = {
  Callout,
  ComponentPreview,
  InstallCommand,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
