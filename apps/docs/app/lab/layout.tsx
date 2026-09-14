import type { ReactNode } from "react";

/**
 * Deliberately outside content/docs and its Preview/Installation/Usage rule
 * (apps/docs/AGENTS.md) - lab pages are experiments, not documented
 * components, and don't get a sidebar.
 */
export default function LabLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>;
}
