"use client";

import { Slider as Primitive } from "@base-ui/react/slider";
import { springs } from "@poise-ui/motion";
import { cn } from "@poise-ui/shared";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import * as React from "react";

const GLIDE = "duration-base ease-standard";

const mergeRefs =
  <T,>(local: React.RefObject<T | null>, forwarded: React.Ref<T> | undefined) =>
  (element: T | null) => {
    local.current = element;
    if (typeof forwarded === "function") forwarded(element);
    else if (forwarded) forwarded.current = element;
  };

const tickStyle = (steps: number): React.CSSProperties => ({
  backgroundImage: [
    // Cover the first 2px
    `linear-gradient(to right, var(--color-bg) 0 2px, transparent 2px)`,
    // Cover the last 2px
    `linear-gradient(to left, var(--color-bg) 0 2px, transparent 2px)`,
    `repeating-linear-gradient(to right, var(--color-border) 0 1px, transparent 1px calc(100% / ${steps} * 5))`,
    `repeating-linear-gradient(to right, var(--color-border) 0 1px, transparent 1px calc(100% / ${steps} * 5 / 3))`,
  ].join(","),
  backgroundSize: "100% 100%, 100% 100%, 100% 0.8rem, 100% 0.6rem",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});

export type SliderProps<Value extends SliderInputValue = SliderInputValue> =
  Omit<Primitive.Root.Props<Value>, "orientation" | "thumbAlignment"> & {
    elasticCap?: number;
    elastic?: boolean;
  };

function Slider<Value extends SliderInputValue = SliderInputValue>({
  className,
  defaultValue,
  elastic = true,
  elasticCap = 0.25,
  children,
  max = 100,
  min = 0,
  onValueChange,
  step = 1,
  value,
  ...props
}: SliderProps<Value>) {
  const limitedValue = limitSliderValue(value);
  const limitedDefaultValue = limitSliderValue(defaultValue);
  const thumbs = Array.isArray(limitedValue)
    ? limitedValue.length
    : Array.isArray(limitedDefaultValue)
      ? limitedDefaultValue.length
      : 1;

  const steps = Math.round((max - min) / step);
  const scale = steps > 0 ? tickStyle(steps) : undefined;

  return (
    <Primitive.Root<Value>
      data-slot="slider"
      className={cn("w-full", className)}
      defaultValue={limitedDefaultValue}
      value={limitedValue}
      min={min}
      max={max}
      step={step}
      onValueChange={onValueChange}
      thumbAlignment="center"
      {...props}
    >
      <Primitive.Control
        render={(controlProps, state) => (
          <SliderCard
            {...controlProps}
            elastic={elastic}
            elasticCap={elasticCap}
            state={state}
          >
            <Primitive.Track
              data-slot="slider-track"
              className="absolute top-0.5 left-0.5 h-[calc(100%-2px)] w-[calc(100%-4px)]"
              style={scale}
            >
              <Primitive.Indicator
                data-slot="slider-indicator"
                className={cn(
                  "bg-muted rounded-sm",
                  `${GLIDE} transition-[inset-inline-start,width]`,
                )}
              />
            </Primitive.Track>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-between gap-4 px-3 text-sm">
              {children}
            </div>

            {Array.from({ length: thumbs }, (_, index) => (
              <Primitive.Thumb
                data-slot="slider-thumb"
                key={index}
                index={index}
                className={cn(
                  "grid size-(--poise-slider-thumb) items-center justify-center focus-visible:outline-hidden",
                  "data-dragging:[&>span]:scale-y-100",
                  `${GLIDE} transition-[inset-inline-start]`,
                )}
              >
                <span
                  aria-hidden="true"
                  className="bg-fg/70 duration-slow ease-out-back h-6 w-1 scale-y-[0.6] rounded-full transition-transform"
                />
              </Primitive.Thumb>
            ))}
          </SliderCard>
        )}
      />
    </Primitive.Root>
  );
}

type SliderCardProps = React.ComponentProps<"div"> & {
  elastic: boolean;
  elasticCap: number;
  state: Primitive.Root.State;
};

function SliderCard({
  children,
  className,
  elastic,
  elasticCap,
  ref,
  state,
  ...props
}: SliderCardProps) {
  const boundRef = React.useRef<SliderBound>(null);
  const pressedThumbIndexRef = React.useRef<number | null>(null);
  const { start, end, controlRef } = useRubberBand(
    elastic,
    boundRef,
    elasticCap,
  );

  const { max, min, values } = state;

  React.useLayoutEffect(() => {
    boundRef.current = getSliderBound(
      values,
      pressedThumbIndexRef.current,
      min,
      max,
    );
  }, [max, min, values]);

  const handlePointerDownCapture = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    props.onPointerDownCapture?.(event);
    if (event.defaultPrevented) return;

    const thumbs = event.currentTarget.querySelectorAll<HTMLElement>(
      '[data-slot="slider-thumb"]',
    );
    const pressedThumb =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-slot="slider-thumb"]')
        : null;

    let pressedIndex = pressedThumb ? Number(pressedThumb.dataset.index) : null;

    if (pressedIndex === null) {
      let closestDistance = Infinity;

      thumbs.forEach((thumb, index) => {
        const rect = thumb.getBoundingClientRect();
        const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));

        if (distance <= closestDistance) {
          closestDistance = distance;
          pressedIndex = index;
        }
      });
    }

    pressedThumbIndexRef.current = pressedIndex;
    boundRef.current = getSliderBound(values, pressedIndex, min, max);
  };

  const insetStart = useTransform(start, (given) => `${-given}px`);
  const insetEnd = useTransform(end, (given) => `${-given}px`);

  return (
    <div
      {...props}
      ref={mergeRefs(controlRef, ref)}
      onPointerDownCapture={handlePointerDownCapture}
      className={cn(
        "relative h-10 w-full cursor-grab touch-none select-none active:cursor-grabbing",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
    >
      <motion.div
        data-slot="slider-card"
        style={{ left: insetStart, right: insetEnd }}
        transition={springs.bouncy}
        className={cn(
          "border-border bg-bg absolute inset-0 overflow-hidden rounded-md border",
          "[--poise-slider-thumb:3.25rem]",
          "has-focus-visible:outline-ring outline-2 outline-offset-2 outline-transparent",
          "duration-fast ease-standard transition-[outline-color]",
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

function SliderLabel({ className, ...props }: Primitive.Label.Props) {
  return (
    <Primitive.Label
      data-slot="slider-label"
      className={cn("text-muted-fg min-w-0 truncate", className)}
      {...props}
    />
  );
}

function SliderValue({ className, ...props }: Primitive.Value.Props) {
  return (
    <Primitive.Value
      data-slot="slider-value"
      className={cn("text-fg shrink-0 font-medium tabular-nums", className)}
      {...props}
    />
  );
}

export { Slider, SliderLabel, SliderValue, type SliderInputValue };

type SliderInputValue = number | readonly [number] | readonly [number, number];

function limitSliderValue<Value extends SliderInputValue | undefined>(
  value: Value,
): Value {
  if (!Array.isArray(value) || value.length <= 2) return value;
  return value.slice(0, 2) as unknown as Value;
}

type SliderBound = "start" | "end" | null;

function getSliderBound(
  values: readonly number[],
  thumbIndex: number | null,
  min: number,
  max: number,
): SliderBound {
  if (thumbIndex === null) return null;

  const held = values[thumbIndex];
  if (held === undefined) return null;
  if (held <= min) return "start";
  if (held >= max) return "end";
  return null;
}

function resist(over: number, width: number, cap = 0.25): number {
  if (!(over > 0) || !(width > 0) || !(cap > 0)) return 0;

  const limit = cap * width;
  return limit * (1 - 1 / (over / limit + 1));
}

type RubberBand = {
  readonly start: MotionValue<number>;
  readonly end: MotionValue<number>;
  /** Goes on the control, which is what the stretch is measured against. */
  readonly controlRef: React.RefObject<HTMLDivElement | null>;
};

function useRubberBand(
  enabled: boolean,
  boundRef: React.RefObject<SliderBound>,
  cap = 0.25,
): RubberBand {
  const start = useMotionValue(0);
  const end = useMotionValue(0);
  const controlRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const control = controlRef.current;
    if (!control || !enabled || reduced) return;

    /** Read once per drag. The control never stretches, so this stays true. */
    let width = 0;
    /** Where the pointer was when the thumb arrived at the end it is on. */
    let anchor: number | null = null;
    let bound: SliderBound = null;

    const onMove = (event: PointerEvent) => {
      const side = boundRef.current;

      if (side !== bound) {
        bound = side;
        anchor = event.clientX;
      }

      if (!side || anchor === null) {
        start.set(0);
        end.set(0);
        return;
      }

      const over =
        side === "start" ? anchor - event.clientX : event.clientX - anchor;
      const given = resist(over, width, cap);

      start.set(side === "start" ? given : 0);
      end.set(side === "end" ? given : 0);
    };

    const onRelease = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      animate(start, 0, springs.bouncy);
      animate(end, 0, springs.bouncy);
    };

    const onPress = () => {
      width = control.getBoundingClientRect().width;
      anchor = null;
      bound = null;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onRelease);
      window.addEventListener("pointercancel", onRelease);
    };

    control.addEventListener("pointerdown", onPress);

    return () => {
      control.removeEventListener("pointerdown", onPress);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      start.set(0);
      end.set(0);
    };
  }, [boundRef, cap, enabled, end, reduced, start]);

  return { start, end, controlRef };
}
