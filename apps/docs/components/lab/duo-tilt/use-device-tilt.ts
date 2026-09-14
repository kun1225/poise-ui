"use client";

/*
 * Ported from solotilt.com's motion input, minus the parts neither renderer
 * needs (facingDown, the raw gravity vector). Both the CSS and WebGL fold
 * renderers read the same smoothed angle from this one hook.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type TiltStatus =
  "idle" | "requesting" | "waiting" | "active" | "unavailable";

export interface DeviceTilt {
  status: TiltStatus;
  message: string;
  /** Call from a tap/click handler - iOS only grants motion access inside a user gesture. */
  enable: () => void;
  /** Desktop fallback: drag across the page instead of tilting a phone. */
  setManualAngle: (angleDeg: number) => void;
  /**
   * Advances the exponential smoothing filter by `dtSeconds` and returns the
   * current angle, -180 (closed, hinge left) to 180 (closed, hinge right).
   * Call once per render frame from whichever renderer is mounted.
   */
  tick: (dtSeconds: number) => number;
}

const READING_TIMEOUT_MS = 4000;
/** Matches solotilt's smoothing time constant: current += (target-current) * (1-e^-dt*16). */
const SMOOTHING_RATE = 16;

/**
 * Gravity, isolated from user acceleration by subtraction, gives a stable
 * "which way is down" reading even while the phone is being moved. The fold
 * angle is 2x the physical tilt so a comfortable wrist turn fully closes it.
 */
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
  const smoothedAngle = useRef(0);
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
      targetAngle.current = angle;
      setStatus("active");
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

  const setManualAngle = useCallback((angleDeg: number) => {
    targetAngle.current = Math.max(-180, Math.min(180, angleDeg));
  }, []);

  const tick = useCallback((dtSeconds: number) => {
    const current = smoothedAngle.current;
    const target = targetAngle.current;
    const next =
      current +
      (target - current) * (1 - Math.exp(-dtSeconds * SMOOTHING_RATE));
    smoothedAngle.current = Math.abs(target - next) < 0.001 ? target : next;
    return smoothedAngle.current;
  }, []);

  return { status, message, enable, setManualAngle, tick };
}
