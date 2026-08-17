import { Callout } from "@/components/callout";
import { ComponentPreview } from "@/components/component-preview";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  Callout,
  ComponentPreview,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
