"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Clipboard write failed:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-sm border border-border bg-bg px-2 py-1 text-xs text-muted-fg transition-colors hover:text-fg"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
