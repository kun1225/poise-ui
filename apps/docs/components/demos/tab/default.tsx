import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@poise-ui/react/tab";

export function TabDemo() {
  return (
    <Tabs defaultValue="overview" className="my-6 max-w-85">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsPanel value="overview">
        The rule sits on the border and slides under the active label.
      </TabsPanel>
      <TabsPanel value="analytics">
        Switching tabs measures the new label and resizes the rule to match.
      </TabsPanel>
      <TabsPanel value="settings">
        Only the rule moves - the panel below is plain text.
      </TabsPanel>
    </Tabs>
  );
}
