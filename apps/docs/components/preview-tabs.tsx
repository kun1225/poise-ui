"use client";

import { useState, type ReactNode } from "react";

import { CopyButton } from "@/components/copy-button";

type Target = "react" | "web";

const LABELS: Record<Target, string> = {
  react: "React",
  web: "Web Component",
};

export type PreviewTabsProps = {
  react: ReactNode;
  web: ReactNode;
  code: Record<Target, string>;
};

export function PreviewTabs({ react, web, code }: PreviewTabsProps) {
  const [target, setTarget] = useState<Target>("react");
  const [showCode, setShowCode] = useState(false);

  const nodes: Record<Target, ReactNode> = { react, web };

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between gap-4 border-b border-border px-3 py-2">
        <div className="flex gap-1" role="tablist">
          {(Object.keys(LABELS) as Target[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={target === value}
              onClick={() => setTarget(value)}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                target === value
                  ? "bg-muted text-fg"
                  : "text-muted-fg hover:text-fg"
              }`}
            >
              {LABELS[value]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCode((previous) => !previous)}
          className="rounded-sm px-3 py-1.5 text-sm text-muted-fg transition-colors hover:text-fg"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
      </div>

      <div className="flex min-h-40 items-center justify-center p-10">
        {nodes[target]}
      </div>

      {showCode ? (
        <div className="relative border-t border-border">
          <div className="absolute top-3 right-3">
            <CopyButton value={code[target]} />
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code>{code[target]}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}
