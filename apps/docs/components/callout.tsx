import type { ReactNode } from "react";

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-fg">
      {children}
    </div>
  );
}
