"use client";

import { CopyButton } from "@/components/copy-button";
import {
  Children,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type PreviewPanelProps = {
  children: ReactNode;
  codes: string[];
  labels: string[];
};

export function PreviewPanel({ children, codes, labels }: PreviewPanelProps) {
  const previews = Children.toArray(children);
  const tabsId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const hasTabs = previews.length > 1;
  const code = codes[activeTab] ?? "";

  function selectTab(index: number) {
    setActiveTab(index);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let nextTab: number | undefined;

    if (event.key === "ArrowRight") {
      nextTab = (activeTab + 1) % previews.length;
    } else if (event.key === "ArrowLeft") {
      nextTab = (activeTab - 1 + previews.length) % previews.length;
    } else if (event.key === "Home") {
      nextTab = 0;
    } else if (event.key === "End") {
      nextTab = previews.length - 1;
    }

    if (nextTab !== undefined) {
      event.preventDefault();
      selectTab(nextTab);
    }
  }

  return (
    <div className="border-border my-6 overflow-hidden rounded-lg border">
      <div className="border-border flex items-center justify-between border-b px-3 py-2">
        {hasTabs ? (
          <div role="tablist" aria-label="Component implementation">
            {labels.map((label, index) => (
              <button
                key={label}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`${tabsId}-tab-${index}`}
                type="button"
                role="tab"
                aria-controls={`${tabsId}-panel`}
                aria-selected={activeTab === index}
                tabIndex={activeTab === index ? 0 : -1}
                onClick={() => setActiveTab(index)}
                onKeyDown={handleTabKeyDown}
                className="text-muted-fg hover:text-fg aria-selected:bg-muted aria-selected:text-fg rounded-sm px-3 py-1.5 text-sm transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => setShowCode((previous) => !previous)}
          className="text-muted-fg hover:text-fg rounded-sm px-3 py-1.5 text-sm transition-colors"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
      </div>

      <div
        id={`${tabsId}-panel`}
        role={hasTabs ? "tabpanel" : undefined}
        aria-labelledby={hasTabs ? `${tabsId}-tab-${activeTab}` : undefined}
        className="flex min-h-40 items-center justify-center p-10"
      >
        {previews[activeTab]}
      </div>

      {showCode ? (
        <div className="border-border relative border-t">
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
