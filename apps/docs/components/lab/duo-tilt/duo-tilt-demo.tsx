"use client";

import { useEffect, useRef, useState } from "react";

import { CssFold } from "./css-fold";
import { WebglFold } from "./gl/webgl-fold";
import { useDeviceTilt } from "./use-device-tilt";

import "./duo-tilt.css";

const DEFAULT_IMAGE = "/images/relight-image/example.jpg";

type Renderer = "css" | "webgl";

export function DuoTiltDemo() {
  const tilt = useDeviceTilt();
  const [renderer, setRenderer] = useState<Renderer>("css");
  const [imageSrc, setImageSrc] = useState(DEFAULT_IMAGE);
  const drag = useRef({ active: false, lastX: 0, lastTime: 0, velocity: 0 });
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageSrc(url);
  }

  function handlePointerDown(event: React.PointerEvent) {
    drag.current = {
      active: true,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
    tilt.dragStart();
  }

  function handlePointerMove(event: React.PointerEvent) {
    const { active, lastX, lastTime, velocity } = drag.current;
    if (!active) return;

    const deltaX = event.clientX - lastX;
    const deltaTime = event.timeStamp - lastTime;
    const sampled = deltaTime > 0 ? (deltaX / deltaTime) * 1000 : velocity;

    drag.current = {
      active: true,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: velocity * 0.6 + sampled * 0.4,
    };
    tilt.dragBy(deltaX);
  }

  function handlePointerUp() {
    if (!drag.current.active) return;
    const { velocity } = drag.current;
    drag.current = { active: false, lastX: 0, lastTime: 0, velocity: 0 };
    tilt.dragEnd(velocity);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="flex w-full justify-center py-10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {renderer === "css" ? (
          <CssFold imageSrc={imageSrc} tilt={tilt} />
        ) : (
          <WebglFold imageSrc={imageSrc} tilt={tilt} />
        )}
      </div>

      <p className="text-muted-fg text-sm">
        Drag left/right to fold it - on a phone, tilt instead.
      </p>

      <StatusBanner
        status={tilt.status}
        message={tilt.message}
        onEnable={tilt.enable}
      />

      <div className="flex items-center gap-4 text-sm">
        <div className="border-border flex overflow-hidden rounded-full border">
          <button
            type="button"
            onClick={() => setRenderer("css")}
            className={`px-3 py-1.5 ${renderer === "css" ? "bg-accent text-accent-fg" : "text-muted-fg"}`}
          >
            CSS
          </button>
          <button
            type="button"
            onClick={() => setRenderer("webgl")}
            className={`px-3 py-1.5 ${renderer === "webgl" ? "bg-accent text-accent-fg" : "text-muted-fg"}`}
          >
            WebGL
          </button>
        </div>

        <label className="text-muted-fg hover:text-fg cursor-pointer underline underline-offset-4">
          Use your own photo
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

function StatusBanner({
  status,
  message,
  onEnable,
}: {
  status: ReturnType<typeof useDeviceTilt>["status"];
  message: string;
  onEnable: () => void;
}) {
  if (status === "idle") {
    return (
      <button
        type="button"
        onClick={onEnable}
        className="bg-accent text-accent-fg rounded-full px-4 py-2 text-sm"
      >
        Enable motion
      </button>
    );
  }
  if (status === "requesting" || status === "waiting") {
    return (
      <p className="text-muted-fg text-sm">
        {status === "requesting"
          ? "Requesting motion access..."
          : "Waiting for a reading - tilt your phone."}
      </p>
    );
  }
  if (status === "unavailable") {
    return <p className="text-muted-fg text-sm">{message}</p>;
  }
  return null;
}
