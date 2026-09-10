import {
  LiquidTabs,
  LiquidTabsList,
  LiquidTabsPanel,
  LiquidTabsTrigger,
} from "@poise-ui/react/liquid-tab";

export function LiquidTabDemo() {
  return (
    <LiquidTabs defaultValue="overview" className="my-6 max-w-85">
      <LiquidTabsList>
        <LiquidTabsTrigger value="overview">Overview</LiquidTabsTrigger>
        <LiquidTabsTrigger value="analytics">Analytics</LiquidTabsTrigger>
        <LiquidTabsTrigger value="settings">Settings</LiquidTabsTrigger>
      </LiquidTabsList>

      <LiquidTabsPanel value="overview"></LiquidTabsPanel>
      <LiquidTabsPanel value="analytics"></LiquidTabsPanel>
      <LiquidTabsPanel value="settings"></LiquidTabsPanel>
    </LiquidTabs>
  );
}
