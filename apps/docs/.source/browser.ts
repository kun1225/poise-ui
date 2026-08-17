// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "components/accordion.mdx": () => import("../content/docs/components/accordion.mdx?collection=docs"), "components/morph-accordion.mdx": () => import("../content/docs/components/morph-accordion.mdx?collection=docs"), "components/select.mdx": () => import("../content/docs/components/select.mdx?collection=docs"), }),
};
export default browserCollections;