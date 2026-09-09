"use client";

/*
 * Decided from the /proto/morph-tab picker.
 * - Direction: no strip and no fill. Type on the page's own ground, with a
 *   rule that travels and resizes under the active label.
 * - The rule matches the label's width, not a padded box, so the triggers sit
 *   on a gap rather than inside boxes.
 * - Rejected: the "Lift" direction (active tab scales out of a bordered strip)
 *   - too much chrome for page-level navigation.
 * - Rejected: a fixed-width rule that only slides - it reads as a pointer
 *   rather than as an underline belonging to the word.
 */
import { Tabs as Primitive } from "@base-ui/react/tabs";
import { springs } from "@poise-ui/motion";
import { cn } from "@poise-ui/shared";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
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
} from "react";

type TabsRootContextValue = {
  reportActive: (element: HTMLElement, active: boolean) => void;
  ruleStart: MotionValue<number>;
  ruleWidth: MotionValue<number>;
  ruleOpacity: MotionValue<number>;
};

const TabsRootContext = createContext<TabsRootContextValue | null>(null);

function useTabsRoot(part: string) {
  const context = use(TabsRootContext);
  if (!context) {
    throw new Error(`<${part}> must be rendered inside <Tabs>.`);
  }
  return context;
}

/** Horizontal only - the rule is an underline, and has no vertical reading. */
export type TabsProps = Omit<Primitive.Root.Props, "render" | "orientation">;

/**
 * Base UI can name the active tab but not place it among its siblings, so the
 * active tab reports its own element here and the rule measures against it.
 * The rule stays a set of motion values so it can travel without re-rendering
 * the labels underneath it.
 */
function Tabs({ className, ...props }: TabsProps) {
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const ruleStart = useMotionValue(0);
  const ruleWidth = useMotionValue(0);
  // Hidden until the first measurement, so it never flashes at zero width in
  // the top left corner.
  const ruleOpacity = useMotionValue(0);
  const placed = useRef(false);
  const reduced = useReducedMotion() ?? false;

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

    const settle = (sprung: boolean) => {
      const start = element.offsetLeft;
      const width = element.offsetWidth;
      if (sprung) {
        animate(ruleStart, start, springs.snappy);
        animate(ruleWidth, width, springs.snappy);
        return;
      }
      ruleStart.set(start);
      ruleWidth.set(width);
    };

    settle(placed.current && !reduced);
    placed.current = true;
    ruleOpacity.set(1);

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
  }, [activeElement, reduced, ruleStart, ruleWidth, ruleOpacity]);

  const context = useMemo(
    () => ({ reportActive, ruleStart, ruleWidth, ruleOpacity }),
    [reportActive, ruleStart, ruleWidth, ruleOpacity],
  );

  return (
    <TabsRootContext value={context}>
      <Primitive.Root
        data-slot="tabs"
        orientation="horizontal"
        className={cn("isolate flex flex-col gap-5", className)}
        {...props}
      />
    </TabsRootContext>
  );
}

export type TabsListProps = Omit<Primitive.List.Props, "render"> & {
  children?: ReactNode;
};

function TabsList({ className, children, ...props }: TabsListProps) {
  const { ruleStart, ruleWidth, ruleOpacity } = useTabsRoot("TabsList");

  return (
    <Primitive.List
      data-slot="tabs-list"
      className={cn(
        "border-border relative flex w-fit gap-7 border-b pb-3",
        className,
      )}
      {...props}
    >
      {children}
      {/* Sits on the border rather than above it, so the two read as one line. */}
      <motion.span
        aria-hidden="true"
        data-slot="tabs-rule"
        className="bg-fg pointer-events-none absolute -bottom-px left-0 h-0.5 rounded-full"
        style={{ x: ruleStart, width: ruleWidth, opacity: ruleOpacity }}
      />
    </Primitive.List>
  );
}

/**
 * No horizontal padding: the rule measures the trigger, so the trigger has to
 * be the word. The row's spacing lives on the list's `gap` instead.
 */
const tabsTrigger = cn(
  "text-muted-fg relative flex h-11 cursor-pointer items-center text-[15px] leading-none font-medium tracking-tight whitespace-nowrap",
  "not-data-active:hover:text-fg",
  "data-active:text-fg",
  "focus-visible:outline-ring rounded-xs outline-2 outline-transparent focus-visible:outline-offset-4",
  "data-disabled:text-muted-fg/50 data-disabled:pointer-events-none",
  "duration-base ease-standard transition-colors",
);

export type TabsTriggerProps = Omit<Primitive.Tab.Props, "render">;

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <Primitive.Tab
      data-slot="tabs-trigger"
      className={cn(tabsTrigger, className)}
      {...props}
      render={(renderProps, state) => (
        <TabSurface {...renderProps} active={state.active} />
      )}
    />
  );
}

type TabSurfaceProps = ComponentProps<"button"> & {
  active: boolean;
  ref?: Ref<HTMLButtonElement>;
};

function TabSurface({ active, ref, ...props }: TabSurfaceProps) {
  const { reportActive } = useTabsRoot("TabsTrigger");
  const elementRef = useRef<HTMLButtonElement>(null);

  // Base UI's composite list re-registers the item whenever the ref detaches,
  // so the callback has to keep its identity across renders.
  const forwarded = useRef<Ref<HTMLButtonElement> | undefined>(ref);
  forwarded.current = ref;
  const setRef = useCallback((element: HTMLButtonElement | null) => {
    elementRef.current = element;
    const next = forwarded.current;
    if (typeof next === "function") next(element);
    else if (next) next.current = element;
  }, []);

  // Layout, not passive: the report has to land before paint, or the rule
  // would start moving a frame late.
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!active || !element) return;
    reportActive(element, true);
    return () => reportActive(element, false);
  }, [active, reportActive]);

  return <button {...props} ref={setRef} />;
}

export type TabsPanelProps = Omit<Primitive.Panel.Props, "render">;

function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <Primitive.Panel
      data-slot="tabs-panel"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsPanel, TabsTrigger };
