"use client";

import { useEffect, useRef } from "react";

import { DEFAULT_BLUR_CONFIG, type BlurConfig } from "../blur-config";
import { applyFoldPose, foldPose } from "../fold-transform";
import type { DeviceTilt } from "../use-device-tilt";
import { DuoTiltRenderer } from "./renderer";

interface WebglFoldProps {
  imageSrc: string;
  tilt: DeviceTilt;
  config?: BlurConfig;
}

export function WebglFold({
  imageSrc,
  tilt,
  config = DEFAULT_BLUR_CONFIG,
}: WebglFoldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<DuoTiltRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new DuoTiltRenderer(canvas);
    rendererRef.current = renderer;
    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    void rendererRef.current?.setImage(imageSrc);
  }, [imageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;

    let lastTime: number | null = null;
    let frame: number;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    function render(time: number) {
      const dt =
        lastTime === null ? 1 / 60 : Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const angle = tilt.tick(dt);

      renderer!.resize(canvas!.clientWidth, canvas!.clientHeight, pixelRatio);
      renderer!.draw(angle, config);
      applyFoldPose(canvas!, foldPose(angle));

      frame = requestAnimationFrame(render);
    }

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [tilt, config]);

  return (
    <div className="duo-tilt-stage" style={{ perspective: 1400 }}>
      <canvas ref={canvasRef} className="duo-tilt-canvas" />
    </div>
  );
}
