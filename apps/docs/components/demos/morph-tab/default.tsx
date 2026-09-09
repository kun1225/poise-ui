import {
  MorphTabs,
  MorphTabsList,
  MorphTabsPanel,
  MorphTabsTrigger,
} from "@poise-ui/react/morph-tab";

export function MorphTabDemo() {
  return (
    <MorphTabs defaultValue="overview" className="my-6 max-w-85">
      <MorphTabsList>
        <MorphTabsTrigger value="overview">Overview</MorphTabsTrigger>
        <MorphTabsTrigger value="analytics">Analytics</MorphTabsTrigger>
        <MorphTabsTrigger value="settings">Settings</MorphTabsTrigger>
      </MorphTabsList>

      <MorphTabsPanel value="overview">
        The active tab detaches from the strip, and its neighbours slide clear
        to make room for it.
      </MorphTabsPanel>
      <MorphTabsPanel value="analytics">
        Switching tabs tears one seam and closes another, so the gap always
        looks like it travelled rather than appeared.
      </MorphTabsPanel>
      <MorphTabsPanel value="settings">
        Only the tabs move - the panel below is a plain card.
      </MorphTabsPanel>
    </MorphTabs>
  );
}
