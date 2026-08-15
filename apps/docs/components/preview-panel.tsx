"use client";

import { useState, type ReactNode } from "react";

import { CopyButton } from "@/components/copy-button";

export type PreviewPanelProps = {
  children: ReactNode;
  code: string;
};

export function PreviewPanel({ children, code }: PreviewPanelProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border">
      <div className="flex justify-end border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={() => setShowCode((previous) => !previous)}
          className="rounded-sm px-3 py-1.5 text-sm text-muted-fg transition-colors hover:text-fg"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
      </div>

      <div className="flex min-h-40 items-center justify-center p-10">
        {children}
      </div>

      {showCode ? (
        <div className="relative border-t border-border">
          <div className="absolute top-3 right-3">
            <CopyButton value={code} />
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}
