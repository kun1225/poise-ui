"use client";

/** CSS implementation of the fold and its approximate depth-of-field effect. */
import { useEffect, useRef } from "react";

import { DEFAULT_BLUR_CONFIG, type BlurConfig } from "./blur-config";
import { FoldOverlays } from "./fold-overlays";
import { applyFoldPose, foldPose } from "./fold-transform";
import type { DeviceTilt } from "./use-device-tilt";

interface CssFoldProps {
  imageSrc: string;
  tilt: DeviceTilt;
  config?: BlurConfig;
}

export function CssFold({
  imageSrc,
  tilt,
  config = DEFAULT_BLUR_CONFIG,
}: CssFoldProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const blurLayerRef = useRef<HTMLDivElement>(null);
  const darkenRef = useRef<HTMLDivElement>(null);
  const specularRef = useRef<HTMLDivElement>(null);
  const edgeFadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastTime: number | null = null;
    let frame: number;

    function render(time: number) {
      const dt =
        lastTime === null ? 1 / 60 : Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const angle = tilt.tick(dt);

      const panel = panelRef.current;
      if (!panel) {
        frame = requestAnimationFrame(render);
        return;
      }

      const { hingeLeft, tiltDeg, tiltRad } = foldPose(angle);
      applyFoldPose(panel, { hingeLeft, tiltDeg, tiltRad });

      const angleFactor =
        smoothstep(0, config.fullAngle, tiltDeg * 2) ** config.anglePower;
      const sine = Math.sin(tiltRad);

      const blurLayer = blurLayerRef.current;
      if (blurLayer) {
        const blurPx = 24 * angleFactor;
        blurLayer.style.filter = `blur(${blurPx}px)`;
        blurLayer.style.opacity = String(mix(config.edgeBlur, 1, angleFactor));
        blurLayer.style.maskImage = edgeMask(hingeLeft, config.fullDistance);
        blurLayer.style.webkitMaskImage = blurLayer.style.maskImage;
      }

      const darken = darkenRef.current;
      if (darken) {
        darken.style.opacity = String(0.28 * sine);
        darken.style.background = darkGradient(hingeLeft);
      }

      const specular = specularRef.current;
      if (specular) {
        specular.style.opacity = String(0.4 * sine);
        specular.style.background = specularGradient(hingeLeft);
      }

      const edgeFade = edgeFadeRef.current;
      if (edgeFade) {
        edgeFade.style.opacity = String(config.gradientOpacity * angleFactor);
        edgeFade.style.background = edgeFadeGradient(
          hingeLeft,
          config.gradientStart,
          config.gradientEnd,
        );
      }

      frame = requestAnimationFrame(render);
    }

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [tilt, config]);

  return (
    <div className="duo-tilt-stage" style={{ perspective: 1400 }}>
      <div ref={panelRef} className="duo-tilt-panel">
        <img
          src={imageSrc}
          alt=""
          className="duo-tilt-photo"
          draggable={false}
        />
        <div ref={blurLayerRef} className="duo-tilt-photo-layer">
          <img
            src={imageSrc}
            alt=""
            className="duo-tilt-photo"
            draggable={false}
          />
        </div>
        <FoldOverlays
          darkenRef={darkenRef}
          specularRef={specularRef}
          edgeFadeRef={edgeFadeRef}
        />
      </div>
    </div>
  );
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function edgeMask(hingeLeft: boolean, fullDistance: number) {
  const stop = `${fullDistance * 100}%`;
  return hingeLeft
    ? `linear-gradient(to right, transparent 0%, black ${stop})`
    : `linear-gradient(to left, transparent 0%, black ${stop})`;
}

function darkGradient(hingeLeft: boolean) {
  return hingeLeft
    ? "linear-gradient(to right, transparent 0%, black 100%)"
    : "linear-gradient(to left, transparent 0%, black 100%)";
}

function specularGradient(hingeLeft: boolean) {
  const center = "70%";
  return hingeLeft
    ? `linear-gradient(to right, transparent 55%, rgba(255,255,255,0.9) ${center}, transparent 85%)`
    : `linear-gradient(to left, transparent 55%, rgba(255,255,255,0.9) ${center}, transparent 85%)`;
}

function edgeFadeGradient(hingeLeft: boolean, start: number, end: number) {
  const a = `${start * 100}%`;
  const b = `${end * 100}%`;
  return hingeLeft
    ? `linear-gradient(to right, transparent ${a}, black ${b})`
    : `linear-gradient(to left, transparent ${a}, black ${b})`;
}
