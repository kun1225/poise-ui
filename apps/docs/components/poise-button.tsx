"use client";

import { useEffect, useState, type ReactNode } from "react";

const SKELETON_HEIGHT = {
  sm: "h-8",
  md: "h-9",
  lg: "h-11",
} as const;

export type PoiseButtonProps = {
  variant?: "solid" | "soft" | "outline" | "ghost" | "danger";
  size?: keyof typeof SKELETON_HEIGHT;
  disabled?: boolean;
  children?: ReactNode;
};

/**
 * Lit calls customElements.define at import time, which is meaningless on the
 * server. Loading the definition after mount keeps the element out of the SSR
 * pass entirely, so there is never an un-upgraded <poise-button> in the markup.
 */
export function PoiseButton({
  variant = "solid",
  size = "md",
  disabled = false,
  children,
}: PoiseButtonProps) {
  const [defined, setDefined] = useState(false);

  useEffect(() => {
    let active = true;
    import("@poise-ui/web/button")
      .then(() => {
        if (active) setDefined(true);
      })
      .catch((error: unknown) => {
        console.error("Failed to load poise-button:", error);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!defined) {
    return (
      <span
        aria-hidden
        className={`inline-block w-24 rounded-md bg-muted ${SKELETON_HEIGHT[size]}`}
      />
    );
  }

  return (
    <poise-button variant={variant} size={size} disabled={disabled ? "" : undefined}>
      {children}
    </poise-button>
  );
}
