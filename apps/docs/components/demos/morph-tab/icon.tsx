import {
  MorphTabs,
  MorphTabsList,
  MorphTabsPanel,
  MorphTabsTrigger,
} from "@poise-ui/react/morph-tab";

const svg = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const GridIcon = () => (
  <svg {...svg}>
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);

const ChartIcon = () => (
  <svg {...svg}>
    <path d="M3 13V9M8 13V3M13 13V6" />
  </svg>
);

const SlidersIcon = () => (
  <svg {...svg}>
    <path d="M2 5h12M2 11h12" />
    <circle cx="6" cy="5" r="1.75" fill="currentColor" stroke="none" />
    <circle cx="10" cy="11" r="1.75" fill="currentColor" stroke="none" />
  </svg>
);

export function MorphTabIconDemo() {
  return (
    <MorphTabs defaultValue="overview" className="my-6 max-w-85">
      <MorphTabsList>
        <MorphTabsTrigger value="overview" icon={<GridIcon />}>
          Overview
        </MorphTabsTrigger>
        <MorphTabsTrigger value="analytics" icon={<ChartIcon />}>
          Analytics
        </MorphTabsTrigger>
        <MorphTabsTrigger value="settings" icon={<SlidersIcon />}>
          Settings
        </MorphTabsTrigger>
      </MorphTabsList>

      <MorphTabsPanel value="overview"></MorphTabsPanel>
      <MorphTabsPanel value="analytics"></MorphTabsPanel>
      <MorphTabsPanel value="settings"></MorphTabsPanel>
    </MorphTabs>
  );
}
