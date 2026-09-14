"use client";

import type { RefObject } from "react";

/** Visual layers used by the CSS fold renderer. */
export function FoldOverlays({
  darkenRef,
  specularRef,
  edgeFadeRef,
}: {
  darkenRef: RefObject<HTMLDivElement | null>;
  specularRef: RefObject<HTMLDivElement | null>;
  edgeFadeRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div ref={darkenRef} className="duo-tilt-overlay" />
      <div ref={specularRef} className="duo-tilt-overlay" />
      <div ref={edgeFadeRef} className="duo-tilt-overlay" />
    </>
  );
}
