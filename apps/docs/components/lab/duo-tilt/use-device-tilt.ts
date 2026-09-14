"use client";

/** Shared motion input for the CSS and WebGL renderers. */
import { useCallback, useEffect, useRef, useState } from "react";

import { springAt, springStep } from "./spring";
import {
  clampFold,
  DEGREES_PER_PIXEL,
  FOLD_SPRING,
  LERP_DRAG,
  rubberBand,
  THROW_SECONDS,
} from "./tilt-motion";

export type TiltStatus =
  "idle" | "requesting" | "waiting" | "active" | "unavailable";

export interface DeviceTilt {
  status: TiltStatus;
  message: string;
  /** Call from a user gesture to request iOS motion access. */
  enable: () => void;
  /** Desktop drag fallback. */
  dragStart: () => void;
  /** Horizontal pointer movement in CSS pixels. */
  dragBy: (deltaPx: number) => void;
  /** Release with pointer velocity in pixels per second. */
  dragEnd: (velocityPxPerSecond: number) => void;
  /** Advance smoothing and return the current angle from -180 to 180 degrees. */
  tick: (dtSeconds: number) => number;
}

const READING_TIMEOUT_MS = 4000;

/** Convert device motion into a fold angle. */
function sampleGravityAngle(
  event: DeviceMotionEvent,
  sign: number,
): number | null {
  const withGravity = event.accelerationIncludingGravity;
  const userOnly = event.acceleration;
  if (!withGravity || !userOnly) return null;

  const values = [
    withGravity.x,
    withGravity.y,
    withGravity.z,
    userOnly.x,
    userOnly.y,
    userOnly.z,
  ];
  if (!values.every((v): v is number => Number.isFinite(v))) return null;

  const gx = sign * (withGravity.x! - userOnly.x!);
  const gy = sign * (withGravity.y! - userOnly.y!);
  const gz = sign * (withGravity.z! - userOnly.z!);
  if (Math.hypot(gx, gy, gz) < 0.5) return null;

  const horizontalMag = Math.hypot(gx, gy);
  const tiltFromVertical = (Math.atan2(horizontalMag, -gz) * 180) / Math.PI;
  const facingDown = tiltFromVertical > 120.00001;
  if (facingDown || horizontalMag < 1e-5) return 0;

  const capped = Math.min(120, tiltFromVertical);
  const horizontal = (capped * gx) / horizontalMag;
  return horizontal === 0 ? 0 : Math.max(-180, Math.min(180, -2 * horizontal));
}

export function useDeviceTilt(): DeviceTilt {
  const [status, setStatus] = useState<TiltStatus>("idle");
  const [message, setMessage] = useState("");

  const targetAngle = useRef(0);
  const pose = useRef(springAt(0));
  const draggingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const grantedRef = useRef(false);
  const gotReadingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startListeningRef = useRef<() => void>(() => {});

  useEffect(() => {
    const sign = /Android/i.test(navigator.userAgent) ? -1 : 1;

    function handleMotion(event: DeviceMotionEvent) {
      const angle = sampleGravityAngle(event, sign);
      if (angle === null) return;
      gotReadingRef.current = true;
      clearTimer();
      setStatus("active");
      if (draggingRef.current) return;
      targetAngle.current = angle;
    }

    function startListening() {
      window.addEventListener("devicemotion", handleMotion);
      clearTimer();
      if (!gotReadingRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (!gotReadingRef.current) {
            setStatus("unavailable");
            setMessage("No motion data. Try dragging instead.");
          }
        }, READING_TIMEOUT_MS);
      }
    }
    startListeningRef.current = startListening;

    function stopListening() {
      window.removeEventListener("devicemotion", handleMotion);
      clearTimer();
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopListening();
      } else if (grantedRef.current) {
        startListening();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stopListening();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearTimer]);

  const enable = useCallback(() => {
    if (grantedRef.current) return;

    async function requestAccess() {
      if (!window.isSecureContext || !window.DeviceMotionEvent) {
        setStatus("unavailable");
        setMessage("Motion sensors aren't available. Try dragging instead.");
        return;
      }

      setStatus("requesting");
      const requestPermission = (
        window.DeviceMotionEvent as unknown as {
          requestPermission?: () => Promise<"granted" | "denied">;
        }
      ).requestPermission;

      try {
        if (typeof requestPermission === "function") {
          const result = await requestPermission();
          if (result !== "granted") {
            setStatus("unavailable");
            setMessage("Motion access denied. Try dragging instead.");
            return;
          }
        }
        grantedRef.current = true;
        setStatus("waiting");
        startListeningRef.current();
      } catch {
        setStatus("unavailable");
        setMessage("Couldn't read motion sensors. Try dragging instead.");
      }
    }

    void requestAccess();
  }, []);

  const dragStart = useCallback(() => {
    draggingRef.current = true;
    targetAngle.current = pose.current.value;
  }, []);

  const dragBy = useCallback((deltaPx: number) => {
    if (!draggingRef.current) return;
    targetAngle.current = rubberBand(
      targetAngle.current + deltaPx * DEGREES_PER_PIXEL,
    );
  }, []);

  const dragEnd = useCallback((velocityPxPerSecond: number) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const thrown =
      targetAngle.current +
      velocityPxPerSecond * THROW_SECONDS * DEGREES_PER_PIXEL;
    targetAngle.current = clampFold(rubberBand(thrown));
  }, []);

  const tick = useCallback((dtSeconds: number) => {
    if (draggingRef.current) {
      const k = 1 - Math.pow(1 - LERP_DRAG, dtSeconds * 60);
      const next =
        pose.current.value + (targetAngle.current - pose.current.value) * k;
      pose.current = { value: clampFold(next), velocity: 0, moving: true };
      return pose.current.value;
    }
    pose.current = springStep(
      pose.current,
      targetAngle.current,
      dtSeconds,
      FOLD_SPRING,
    );
    return pose.current.value;
  }, []);

  return { status, message, enable, dragStart, dragBy, dragEnd, tick };
}
