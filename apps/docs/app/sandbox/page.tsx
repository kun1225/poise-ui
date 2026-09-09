import {
  MorphTabs,
  MorphTabsList,
  MorphTabsPanel,
  MorphTabsTrigger,
} from "@poise-ui/react/morph-tab";

export default function SandboxPage() {
  return (
    <div style={{ padding: 64 }}>
      <MorphTabs defaultValue="one" className="max-w-md" gap={16}>
        <MorphTabsList>
          <MorphTabsTrigger value="one">One</MorphTabsTrigger>
          <MorphTabsTrigger value="two">Two</MorphTabsTrigger>
          <MorphTabsTrigger value="three">Three</MorphTabsTrigger>
          <MorphTabsTrigger value="four">Four</MorphTabsTrigger>
        </MorphTabsList>
        <MorphTabsPanel value="one">Panel one</MorphTabsPanel>
        <MorphTabsPanel value="two">Panel two</MorphTabsPanel>
        <MorphTabsPanel value="three">Panel three</MorphTabsPanel>
        <MorphTabsPanel value="four">Panel four</MorphTabsPanel>
      </MorphTabs>
    </div>
  );
}
