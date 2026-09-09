import {
  MorphTabs,
  MorphTabsList,
  MorphTabsPanel,
  MorphTabsTrigger,
} from "@poise-ui/react/morph-tab";

export function MorphTabGapDemo() {
  return (
    <MorphTabs defaultValue="one" className="my-6 max-w-85" gap={28}>
      <MorphTabsList>
        <MorphTabsTrigger value="one">One</MorphTabsTrigger>
        <MorphTabsTrigger value="two">Two</MorphTabsTrigger>
        <MorphTabsTrigger value="three">Three</MorphTabsTrigger>
      </MorphTabsList>

      <MorphTabsPanel value="one">
        A wider gap sends the neighbours further out, so the active tab reads
        as a card of its own.
      </MorphTabsPanel>
      <MorphTabsPanel value="two">
        The tab you clicked stays put - only its neighbours move.
      </MorphTabsPanel>
      <MorphTabsPanel value="three">
        They move outside the list's own box, so leave room around it.
      </MorphTabsPanel>
    </MorphTabs>
  );
}
