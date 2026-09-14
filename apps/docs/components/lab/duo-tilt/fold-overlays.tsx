"use client";

import type { RefObject } from "react";

/**
 * Three absolutely-positioned layers stacked over the photo, each driven
 * imperatively (opacity + gradient direction) by CssFold's own render loop -
 * no re-render per frame. Split out only because CssFold was getting crowded.
 */
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
