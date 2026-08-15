#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

import pkg from "../package.json" with { type: "json" };
import { addCommand } from "./commands/add.ts";
import { initCommand } from "./commands/init.ts";
import { listCommand } from "./commands/list.ts";

const main = defineCommand({
  meta: {
    name: "poise-ui",
    version: pkg.version,
    description: "Add poise-ui components to your project.",
  },
  subCommands: {
    init: initCommand,
    add: addCommand,
    list: listCommand,
  },
});

runMain(main);
