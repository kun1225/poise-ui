"use client";

import { cn } from "@poise-ui/shared";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import {
  AgXToneMapping,
  AmbientLight,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGPURenderer,
  type DataTexture,
  type MeshPhongNodeMaterial,
  type Texture,
} from "three/webgpu";

import { createSmoothDepthTexture } from "./relight-image-depth";
import {
  createRelightMaterial,
  defaultRelightImageSettings,
  type RelightImageSettings,
} from "./relight-image-material";

const MAX_PIXEL_RATIO = 2;
const VIEW_HEIGHT = 4;

export type RelightImageProps = Omit<ComponentProps<"div">, "children"> & {
  src: string;
  depthSrc: string;
  alt: string;
  interactive?: boolean;
  settings?: Partial<RelightImageSettings>;
};

function RelightImage({
  src,
  depthSrc,
  alt,
  interactive = true,
  settings,
  className,
  ...props
}: RelightImageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const resolved = { ...defaultRelightImageSettings, ...settings };

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const hostElement = host;
    const canvasElement = canvas;

    let cancelled = false;
    let initialized = false;
    let visible = true;
    let needsRender = true;
    let reportedReady = false;
    let renderer: WebGPURenderer | undefined;
    let map: Texture | undefined;
    let depthMap: Texture | undefined;
    let smoothDepthMap: DataTexture | undefined;
    let material: MeshPhongNodeMaterial | undefined;
    let geometry: PlaneGeometry | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let removePointerListener: (() => void) | undefined;

    setReady(false);

    function dispose() {
      removePointerListener?.();
      removePointerListener = undefined;
      resizeObserver?.disconnect();
      resizeObserver = undefined;
      intersectionObserver?.disconnect();
      intersectionObserver = undefined;
      geometry?.dispose();
      geometry = undefined;
      material?.dispose();
      material = undefined;
      map?.dispose();
      map = undefined;
      depthMap?.dispose();
      depthMap = undefined;
      smoothDepthMap?.dispose();
      smoothDepthMap = undefined;
      if (initialized && renderer) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        renderer = undefined;
        initialized = false;
      }
    }

    async function initialize() {
      const loader = new TextureLoader();

      try {
        map = await loader.loadAsync(src);
        if (cancelled) return dispose();

        depthMap = await loader.loadAsync(depthSrc);
        if (cancelled) return dispose();

        map.colorSpace = SRGBColorSpace;
        smoothDepthMap = createSmoothDepthTexture(
          depthMap.image as CanvasImageSource & {
            width: number;
            height: number;
          },
          resolved.depthSmoothing,
        );

        renderer = new WebGPURenderer({
          canvas: canvasElement,
          alpha: true,
          antialias: true,
        });
        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO),
        );
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = AgXToneMapping;
        await renderer.init();
        initialized = true;
        if (cancelled) return dispose();

        const scene = new Scene();
        const camera = new OrthographicCamera();
        camera.position.set(0, 0, 5);

        const pointLight = new PointLight(
          resolved.lightColor,
          resolved.lightIntensity,
          0,
          1,
        );
        pointLight.position.set(1.2, 0.8, resolved.lightElevation);
        const ambientLight = new AmbientLight(
          "#ffffff",
          resolved.ambientIntensity,
        );
        scene.add(pointLight, ambientLight);

        material = createRelightMaterial({
          map,
          depthMap,
          smoothDepthMap,
          lightPosition: pointLight.position,
          settings: resolved,
        });
        geometry = new PlaneGeometry(1, 1);
        const plane = new Mesh(geometry, material);
        scene.add(plane);

        function resize() {
          if (!renderer) return;

          const width = Math.max(1, hostElement.clientWidth);
          const height = Math.max(1, hostElement.clientHeight);
          const aspect = width / height;
          renderer.setSize(width, height, false);
          camera.top = VIEW_HEIGHT * 0.5;
          camera.bottom = -camera.top;
          camera.right = camera.top * aspect;
          camera.left = -camera.right;
          camera.updateProjectionMatrix();
          plane.scale.set(VIEW_HEIGHT * aspect, VIEW_HEIGHT, 1);
          needsRender = true;
        }

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(hostElement);
        resize();

        if (typeof IntersectionObserver !== "undefined") {
          intersectionObserver = new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? true;
            if (visible) needsRender = true;
          });
          intersectionObserver.observe(hostElement);
        }

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );
        if (interactive) {
          const handlePointerMove = (event: PointerEvent) => {
            if (reducedMotion.matches) return;

            const bounds = hostElement.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            const y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
            pointLight.position.x = x * camera.right;
            pointLight.position.y = y * camera.top;
            needsRender = true;
          };
          hostElement.addEventListener("pointermove", handlePointerMove);
          removePointerListener = () =>
            hostElement.removeEventListener("pointermove", handlePointerMove);
        }

        renderer.setAnimationLoop(() => {
          if (!visible || !needsRender) return;

          needsRender = false;
          renderer?.render(scene, camera);
          if (!reportedReady) {
            reportedReady = true;
            setReady(true);
          }
        });
      } catch (error) {
        if (!cancelled) {
          console.error("RelightImage could not initialize.", error);
        }
        dispose();
      }
    }

    void initialize();

    return () => {
      cancelled = true;
      dispose();
    };
  }, [
    src,
    depthSrc,
    interactive,
    resolved.lightColor,
    resolved.lightIntensity,
    resolved.lightElevation,
    resolved.ambientIntensity,
    resolved.depthSmoothing,
    resolved.depthStrength,
    resolved.normalStrength,
    resolved.detailStrength,
    resolved.shadowStrength,
    resolved.shadowSoftness,
  ]);

  return (
    <div
      ref={hostRef}
      data-slot="relight-image"
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="block size-full object-cover"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 size-full",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export { RelightImage };
