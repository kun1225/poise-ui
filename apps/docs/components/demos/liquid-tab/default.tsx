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

      <LiquidTabsPanel value="overview">
        The pill stretches across the gap when it travels, then pulls back
        together.
      </LiquidTabsPanel>
      <LiquidTabsPanel value="analytics">
        Its two edges move at different speeds, so it always reads as
        travelling rather than appearing.
      </LiquidTabsPanel>
      <LiquidTabsPanel value="settings">
        Only the pill moves - the panel below is plain text.
      </LiquidTabsPanel>
    </LiquidTabs>
  );
}
