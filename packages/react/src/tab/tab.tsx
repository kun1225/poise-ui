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
import { eases, springs } from "@poise-ui/motion";
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

/**
 * The icon slot holds its space while hidden, so a tab never changes width.
 * The rule measures the trigger box, and a width change mid-travel reaches it
 * as a resize - which snaps it, cutting the slide short.
 */
const ICON_SIZE = 16;
const ICON_GAP = 6;
/** Half the slot, so the label alone still reads centred without the icon. */
const LABEL_SHIFT = (ICON_SIZE + ICON_GAP) / 2;

const ICON_MOTION = {
  ...springs.snappy,
  opacity: eases.standard,
  filter: eases.standard,
} as const;
const NO_MOTION = { duration: 0 } as const;

/** Whether every tab shows its icon, or only the active one. */
export type TabsIcons = "active" | "all";
/** Which side of the label the icon sits on. */
export type TabsIconPosition = "start" | "end";

type TabsRootContextValue = {
  reportActive: (element: HTMLElement, active: boolean) => void;
  ruleStart: MotionValue<number>;
  ruleWidth: MotionValue<number>;
  icons: TabsIcons;
  iconPosition: TabsIconPosition;
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
export type TabsProps = Omit<Primitive.Root.Props, "render" | "orientation"> & {
  icons?: TabsIcons;
  iconPosition?: TabsIconPosition;
};

/**
 * Base UI can name the active tab but not place it among its siblings, so the
 * active tab reports its own element here and the rule measures against it.
 * The rule stays a set of motion values so it can travel without re-rendering
 * the labels underneath it.
 */
function Tabs({
  className,
  icons = "active",
  iconPosition = "start",
  ...props
}: TabsProps) {
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const ruleStart = useMotionValue(0);
  const ruleWidth = useMotionValue(0);
  const placed = useRef(false);
  // The same fact as `placed`, but as state: it both hides the rule until the
  // first measurement - so it never flashes at zero width in the top left
  // corner - and tells the active trigger to draw the stand-in until then.
  const [rulePlaced, setRulePlaced] = useState(false);
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
    setRulePlaced(true);

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
  }, [activeElement, reduced, ruleStart, ruleWidth]);

  const context = useMemo(
    () => ({
      reportActive,
      ruleStart,
      ruleWidth,
      icons,
      iconPosition,
    }),
    [reportActive, ruleStart, ruleWidth, icons, iconPosition],
  );

  return (
    <TabsRootContext value={context}>
      <Primitive.Root
        data-slot="tabs"
        // The rule is placed from a measurement, so it cannot exist until the
        // client has laid out. Until then the active trigger draws the rule
        // itself in CSS - see `tabsTrigger`.
        data-rule={rulePlaced ? undefined : "pending"}
        orientation="horizontal"
        className={cn("group/tabs isolate flex flex-col gap-5", className)}
        {...props}
      />
    </TabsRootContext>
  );
}

export type TabsListProps = Omit<Primitive.List.Props, "render"> & {
  children?: ReactNode;
};

function TabsList({ className, children, ...props }: TabsListProps) {
  const { ruleStart, ruleWidth } = useTabsRoot("TabsList");

  return (
    <Primitive.List
      data-slot="tabs-list"
      className={cn(
        "border-border relative flex w-fit border-b pb-1",
        className,
      )}
      {...props}
    >
      {children}
      {/* Sits on the border rather than above it, so the two read as one line. */}
      <motion.span
        aria-hidden="true"
        data-slot="tabs-rule"
        className={cn(
          "bg-fg pointer-events-none absolute -bottom-px left-0 h-0.5 rounded-full",
          "group-data-[rule=pending]/tabs:opacity-0",
        )}
        style={{ x: ruleStart, width: ruleWidth }}
      />
    </Primitive.List>
  );
}

/**
 * The stand-in rule, for the frames before the real one is measured. It sits
 * 5px under the trigger - the list's `pb-1` plus its 1px border - which is
 * where the travelling rule comes to rest, at the same height and radius, so
 * the handover is not visible.
 * It reads `data-active` rather than any prop, so it follows Base UI whether
 * the root is controlled, uncontrolled, or left to its default.
 */
const tabsStandIn = cn(
  "after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-[5px] after:h-0.5 after:rounded-full",
  "group-data-[rule=pending]/tabs:data-active:after:bg-fg",
);

/**
 * No horizontal padding: the rule measures the trigger, so the trigger has to
 * be the word. The row's spacing lives on the list's `gap` instead.
 */
const tabsTrigger = cn(
  "text-muted-fg relative flex h-8 cursor-pointer items-center px-4 text-[15px] leading-none font-medium tracking-tight whitespace-nowrap",
  tabsStandIn,
  "not-data-active:hover:text-fg",
  "data-active:text-fg",
  "focus-visible:outline-ring rounded-xs outline-2 outline-transparent focus-visible:outline-offset-4",
  "data-disabled:text-muted-fg/50 data-disabled:pointer-events-none",
  "duration-base ease-standard transition-colors",
  "before:duration-base before:ease-standard before:absolute before:inset-0 before:-z-10 before:rounded-md before:transition-colors",
  "not-data-active:hover:before:bg-muted",
);

export type TabsTriggerProps = Omit<Primitive.Tab.Props, "render"> & {
  /** Decorative - the label names the tab. */
  icon?: ReactNode;
};

function TabsTrigger({ className, icon, ...props }: TabsTriggerProps) {
  return (
    <Primitive.Tab
      data-slot="tabs-trigger"
      className={cn(tabsTrigger, className)}
      {...props}
      render={(renderProps, state) => (
        <TabSurface {...renderProps} active={state.active} icon={icon} />
      )}
    />
  );
}

type TabSurfaceProps = ComponentProps<"button"> & {
  active: boolean;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

type TabContentProps = {
  icon?: ReactNode;
  shown: boolean;
  position: TabsIconPosition;
  reduced: boolean;
  children?: ReactNode;
};

/**
 * The icon only ever scales, fades and blurs, and the label only translates -
 * nothing here touches layout, so the tab box stays the size it was measured
 * at.
 */
function TabContent({
  icon,
  shown,
  position,
  reduced,
  children,
}: TabContentProps) {
  if (!icon) return <>{children}</>;

  const transition = reduced ? NO_MOTION : ICON_MOTION;
  const iconNode = (
    <motion.span
      aria-hidden="true"
      data-slot="tabs-trigger-icon"
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
      data-slot="tabs-trigger-content"
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

function TabSurface({
  active,
  icon,
  ref,
  children,
  ...props
}: TabSurfaceProps) {
  const { reportActive, icons, iconPosition } = useTabsRoot("TabsTrigger");
  const reduced = useReducedMotion() ?? false;
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

  return (
    <button {...props} ref={setRef}>
      <TabContent
        icon={icon}
        shown={icons === "all" || active}
        position={iconPosition}
        reduced={reduced}
      >
        {children}
      </TabContent>
    </button>
  );
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
