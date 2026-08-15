"use client";

import { useState } from "react";

import { CopyButton } from "@/components/copy-button";

type Target = "react" | "web";

const LABELS: Record<Target, string> = {
  react: "React",
  web: "Web Component",
};

function commandFor(component: string, target: Target) {
  const suffix = target === "web" ? " --target web" : "";
  return `npx poise-ui add ${component}${suffix}`;
}

export function InstallCommand({ component }: { component: string }) {
  const [target, setTarget] = useState<Target>("react");
  const command = commandFor(component, target);

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border">
      <div className="flex gap-1 border-b border-border px-3 py-2">
        {(Object.keys(LABELS) as Target[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTarget(value)}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              target === value ? "bg-muted text-fg" : "text-muted-fg hover:text-fg"
            }`}
          >
            {LABELS[value]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <code className="text-sm">{command}</code>
        <CopyButton value={command} />
      </div>
    </div>
  );
}
