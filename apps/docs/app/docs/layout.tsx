import type { ReactNode } from "react";

import { DocsSidebar } from "@/components/docs-sidebar";
import { source } from "@/lib/source";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
      <aside className="sticky top-24 hidden h-fit w-56 shrink-0 lg:block">
        <DocsSidebar tree={source.pageTree} />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
