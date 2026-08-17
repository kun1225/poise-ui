// @ts-nocheck
import * as __fd_glob_5 from "../content/docs/components/select.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/components/morph-accordion.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/components/accordion.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/components/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "components/meta.json": __fd_glob_1, }, {"index.mdx": __fd_glob_2, "components/accordion.mdx": __fd_glob_3, "components/morph-accordion.mdx": __fd_glob_4, "components/select.mdx": __fd_glob_5, });