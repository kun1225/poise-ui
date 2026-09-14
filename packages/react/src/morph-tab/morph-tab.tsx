"use client";

import { Tabs as Primitive } from "@base-ui/react/tabs";
import { eases, springs } from "@poise-ui/motion";
import { cn } from "@poise-ui/shared";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from "motion/react";
import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";

/** Not `--radius-md`: `@theme inline` names resolve to nothing at runtime. */
const HIGHLIGHT_RADIUS = "var(--poise-radius-md)";

const ICON_SIZE = 16;
const ICON_GAP = 6;
const LABEL_SHIFT = (ICON_SIZE + ICON_GAP) / 2;

const ICON_MOTION = {
  ...springs.snappy,
  opacity: eases.standard,
  filter: eases.standard,
} as const;
const NO_MOTION = { duration: 0 } as const;

/** Whether every tab shows its icon, or only the active one. */
export type MorphTabsIcons = "active" | "all";
/** Which side of the label the icon sits on. */
export type MorphTabsIconPosition = "start" | "end";

type MorphOrientation = NonNullable<Primitive.Root.Props["orientation"]>;

type MorphRootContextValue = {
  gap: number;
  orientation: MorphOrientation;
  activeElement: HTMLElement | null;
  reportActive: (element: HTMLElement, active: boolean) => void;
  highlightStart: MotionValue<number>;
  highlightSize: MotionValue<number>;
  icons: MorphTabsIcons;
  iconPosition: MorphTabsIconPosition;
};

const MorphRootContext = createContext<MorphRootContextValue | null>(null);

function useMorphRoot(part: string) {
  const context = use(MorphRootContext);
  if (!context) {
    throw new Error(`<${part}> must be rendered inside <MorphTabs>.`);
  }
  return context;
}

const clamp = (value: number, max: number) =>
  Math.min(Math.max(value, 0), Math.max(max, 0));

export type MorphTabsProps = Omit<Primitive.Root.Props, "render"> & {
  /** Pixels a neighbouring tab moves clear of the active one. */
  gap?: number;
  icons?: MorphTabsIcons;
  iconPosition?: MorphTabsIconPosition;
};

/**
 * Base UI can name the active tab but not place it among its siblings, so the
 * active tab reports its own element here and the rest measure against it.
 * The highlight stays a pair of motion values so tabs can clip against it per
 * frame without re-rendering.
 */
function MorphTabs({
  className,
  orientation = "horizontal",
  gap = 12,
  icons = "active",
  iconPosition = "start",
  ...props
}: MorphTabsProps) {
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const highlightStart = useMotionValue(0);
  const highlightSize = useMotionValue(0);
  const placed = useRef(false);

  // Switching tabs deactivates one and activates another in the same commit,
  // so a tab may only clear the slot it still holds.
  const reportActive = useCallback((element: HTMLElement, active: boolean) => {
    setActiveElement((current) => {
      if (active) return current === element ? current : element;
      return current === element ? null : current;
    });
  }, []);

  useLayoutEffect(() => {
    const element = activeElement;
    if (!element) return;

    // Offsets rather than a rect: the tab that just became active may still be
    // carrying the transform that pushed it aside, and the highlight is aimed
    // at where it comes to rest.
    const settle = (sprung: boolean) => {
      const vertical = orientation === "vertical";
      const start = vertical ? element.offsetTop : element.offsetLeft;
      const size = vertical ? element.offsetHeight : element.offsetWidth;

      if (sprung) {
        animate(highlightStart, start, springs.snappy);
        animate(highlightSize, size, springs.snappy);
        return;
      }
      highlightStart.set(start);
      highlightSize.set(size);
    };

    settle(placed.current);
    placed.current = true;

    // A ResizeObserver reports once on observe, and that call is the
    // measurement just taken - letting it through would cut the slide short.
    let observed = false;
    const observer = new ResizeObserver(() => {
      if (!observed) {
        observed = true;
        return;
      }
      settle(false);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeElement, orientation, highlightStart, highlightSize]);

  const context = useMemo(
    () => ({
      gap,
      orientation,
      activeElement,
      reportActive,
      highlightStart,
      highlightSize,
      icons,
      iconPosition,
    }),
    [
      gap,
      orientation,
      activeElement,
      reportActive,
      highlightStart,
      highlightSize,
      icons,
      iconPosition,
    ],
  );

  return (
    <MorphRootContext value={context}>
      <Primitive.Root
        data-slot="morph-tabs"
        data-orientation={orientation}
        orientation={orientation}
        className={cn(
          "group/morph-tabs isolate flex flex-col gap-2 data-[orientation=vertical]:flex-row",
          className,
        )}
        {...props}
      />
    </MorphRootContext>
  );
}

export type MorphTabsListProps = Omit<Primitive.List.Props, "render">;

function MorphTabsList({ className, ...props }: MorphTabsListProps) {
  return (
    <Primitive.List
      data-slot="morph-tabs-list"
      className={cn(
        "relative flex w-fit group-data-[orientation=vertical]/morph-tabs:flex-col",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Every border is present at every moment and only its colour changes, so none
 * of this shifts layout by the width of a border.
 */
const morphTabTrigger = cn(
  "bg-bg text-fg relative z-0 flex h-10 cursor-pointer items-center justify-center gap-1.5 px-4 text-sm font-medium whitespace-nowrap",
  "border border-transparent",
  "group-data-[orientation=horizontal]/morph-tabs:border-y-border group-data-[orientation=horizontal]/morph-tabs:border-l-border",
  "group-data-[orientation=horizontal]/morph-tabs:first:rounded-l-md",
  "group-data-[orientation=horizontal]/morph-tabs:last:border-r-border group-data-[orientation=horizontal]/morph-tabs:last:rounded-r-md",
  "group-data-[orientation=vertical]/morph-tabs:border-x-border group-data-[orientation=vertical]/morph-tabs:border-t-border",
  "group-data-[orientation=vertical]/morph-tabs:first:rounded-t-md",
  "group-data-[orientation=vertical]/morph-tabs:last:border-b-border group-data-[orientation=vertical]/morph-tabs:last:rounded-b-md",
  "not-data-active:hover:bg-accent/10 not-data-active:hover:text-accent",
  "data-active:border-border data-active:z-1 data-active:rounded-md",
  "group-data-[orientation=horizontal]/morph-tabs:[&:has(+[data-active])]:border-r-border group-data-[orientation=horizontal]/morph-tabs:[&:has(+[data-active])]:rounded-r-md",
  "group-data-[orientation=horizontal]/morph-tabs:[[data-active]+&]:rounded-l-md",
  "group-data-[orientation=vertical]/morph-tabs:[&:has(+[data-active])]:border-b-border group-data-[orientation=vertical]/morph-tabs:[&:has(+[data-active])]:rounded-b-md",
  "group-data-[orientation=vertical]/morph-tabs:[[data-active]+&]:rounded-t-md",
  "focus-visible:outline-ring outline-2 -outline-offset-1 outline-transparent focus-visible:relative focus-visible:z-1 focus-visible:outline-offset-2",
  "data-disabled:text-muted-fg data-disabled:pointer-events-none",
  "duration-base ease-standard transition-[border-color,border-radius,background-color,color]",
);

export type MorphTabsTriggerProps = Omit<Primitive.Tab.Props, "render"> & {
  /** Decorative - the label names the tab. */
  icon?: ReactNode;
};

function MorphTabsTrigger({
  className,
  icon,
  ...props
}: MorphTabsTriggerProps) {
  return (
    <Primitive.Tab
      data-slot="morph-tabs-trigger"
      className={cn(morphTabTrigger, className)}
      {...props}
      render={(renderProps, state) => (
        <MorphTabSurface {...renderProps} active={state.active} icon={icon} />
      )}
    />
  );
}

/**
 * `onAnimationStart` and the drag handlers mean something else on a `motion`
 * element. Base UI never passes them, so assert past the overlap.
 */
const asMotionProps = (props: ComponentProps<"button">) =>
  props as HTMLMotionProps<"button">;

const mergeRefs =
  <T,>(local: RefObject<T | null>, forwarded: Ref<T> | undefined) =>
  (element: T | null) => {
    local.current = element;
    if (typeof forwarded === "function") forwarded(element);
    else if (forwarded) forwarded.current = element;
  };

type MorphTabSurfaceProps = ComponentProps<"button"> & {
  active: boolean;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

type MorphTabContentProps = {
  icon?: ReactNode;
  shown: boolean;
  position: MorphTabsIconPosition;
  reduced: boolean;
  children?: ReactNode;
};

function MorphTabContent({
  icon,
  shown,
  position,
  reduced,
  children,
}: MorphTabContentProps) {
  if (!icon) return <>{children}</>;

  const transition = reduced ? NO_MOTION : ICON_MOTION;
  const iconNode = (
    <motion.span
      aria-hidden="true"
      data-slot="morph-tabs-trigger-icon"
      className="flex shrink-0 origin-center items-center justify-center"
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
      animate={
        shown
          ? { opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }
          : {
              opacity: 0,
              scale: 0.5,
              filter: "blur(2px)",
              x: position === "start" ? LABEL_SHIFT : -LABEL_SHIFT,
            }
      }
      // Renders the target on the server and on mount, so a hidden icon is
      // never painted sharp for a frame before hydration reaches it.
      initial={false}
      transition={transition}
    >
      {icon}
    </motion.span>
  );

  return (
    <motion.span
      data-slot="morph-tabs-trigger-content"
      className="flex items-center"
      style={{ gap: ICON_GAP }}
      animate={{
        x: shown ? 0 : position === "start" ? -LABEL_SHIFT : LABEL_SHIFT,
      }}
      initial={false}
      transition={transition}
    >
      {position === "start" && iconNode}
      {children}
      {position === "end" && iconNode}
    </motion.span>
  );
}

/**
 * The label is drawn twice so the highlight can clip the accent copy to a
 * rectangle: a colour swap would flip a whole label at once, where a clip lets
 * the fill's edge cut the letters as it passes.
 *
 * The gap is a transform, so the tab you clicked stays put under the pointer
 * and only its neighbours move - outside the list's own box, so leave room
 * around it.
 */
function MorphTabSurface({
  active,
  icon,
  ref,
  children,
  ...props
}: MorphTabSurfaceProps) {
  const {
    gap,
    orientation,
    activeElement,
    reportActive,
    highlightStart,
    highlightSize,
    icons,
    iconPosition,
  } = useMorphRoot("MorphTabsTrigger");
  const reduced = useReducedMotion() ?? false;
  const elementRef = useRef<HTMLButtonElement>(null);
  const vertical = orientation === "vertical";
  const shift = useMotionValue(0);

  // The clip runs on frames of its own, and would otherwise read whichever
  // render built it.
  const activeRef = useRef(active);
  useLayoutEffect(() => {
    activeRef.current = active;
  });

  // Layout, not passive: the report has to land before paint, or a neighbour
  // would start moving a frame after the tab it is moving away from.
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!active || !element) return;
    reportActive(element, true);
    return () => reportActive(element, false);
  }, [active, reportActive]);

  const push =
    active || !activeElement || !elementRef.current
      ? 0
      : activeElement.compareDocumentPosition(elementRef.current) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ? 1
        : -1;

  // A motion value rather than an `animate` target because the clip reads it
  // back: the highlight travels in list coordinates, so a tab mid-slide has to
  // subtract how far it has itself moved.
  useLayoutEffect(() => {
    animate(shift, push * gap, springs.bouncy);
  }, [push, gap, shift]);

  const clipPath = useTransform(
    [highlightStart, highlightSize, shift],
    (latest: number[]) => {
      const [start = 0, size = 0, offset = 0] = latest;
      const element = elementRef.current;

      // Nothing measured yet - on the server, and before the first layout.
      // Lighting the active tab whole is what the measurement will confirm.
      if (!element || size === 0) {
        return activeRef.current
          ? `inset(0 round ${HIGHLIGHT_RADIUS})`
          : "inset(0 100% 0 0)";
      }

      // `clip-path` resolves against the untransformed box, so the tab's own
      // translate is added by hand rather than measured in.
      const own = (vertical ? element.offsetTop : element.offsetLeft) + offset;
      const extent = vertical ? element.offsetHeight : element.offsetWidth;
      const near = clamp(start - own, extent);
      const far = clamp(own + extent - (start + size), extent);

      return vertical
        ? `inset(${near}px 0 ${far}px 0 round ${HIGHLIGHT_RADIUS})`
        : `inset(0 ${far}px 0 ${near}px round ${HIGHLIGHT_RADIUS})`;
    },
  );

  const content = (
    <MorphTabContent
      icon={icon}
      shown={icons === "all" || active}
      position={iconPosition}
      reduced={reduced}
    >
      {children}
    </MorphTabContent>
  );

  return (
    <motion.button
      {...asMotionProps(props)}
      ref={mergeRefs(elementRef, ref)}
      style={vertical ? { y: shift } : { x: shift }}
    >
      {content}
      <motion.span
        aria-hidden="true"
        data-slot="morph-tabs-highlight"
        className="bg-accent text-accent-fg pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 px-3"
        style={{ clipPath }}
      >
        {content}
      </motion.span>
    </motion.button>
  );
}

export type MorphTabsPanelProps = Omit<Primitive.Panel.Props, "render">;

function MorphTabsPanel({ className, ...props }: MorphTabsPanelProps) {
  return (
    <Primitive.Panel
      data-slot="morph-tabs-panel"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { MorphTabs, MorphTabsList, MorphTabsTrigger, MorphTabsPanel };
