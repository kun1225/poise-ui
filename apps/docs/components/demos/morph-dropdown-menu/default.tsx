"use client";

import {
  MorphDropdownMenu,
  MorphDropdownMenuCheckboxItem,
  MorphDropdownMenuContent,
  MorphDropdownMenuGroup,
  MorphDropdownMenuGroupLabel,
  MorphDropdownMenuItem,
  MorphDropdownMenuSeparator,
  MorphDropdownMenuShortcut,
  MorphDropdownMenuSub,
  MorphDropdownMenuSubContent,
  MorphDropdownMenuSubTrigger,
  MorphDropdownMenuTrigger,
} from "@poise-ui/react/morph-dropdown-menu";

export function MorphDropdownMenuDemo() {
  return (
    <MorphDropdownMenu>
      <MorphDropdownMenuTrigger>Open menu</MorphDropdownMenuTrigger>

      <MorphDropdownMenuContent>
        <MorphDropdownMenuGroup>
          <MorphDropdownMenuGroupLabel>Account</MorphDropdownMenuGroupLabel>
          <MorphDropdownMenuItem>
            Profile
            <MorphDropdownMenuShortcut>⌘P</MorphDropdownMenuShortcut>
          </MorphDropdownMenuItem>
          <MorphDropdownMenuItem>
            Settings
            <MorphDropdownMenuShortcut>⌘,</MorphDropdownMenuShortcut>
          </MorphDropdownMenuItem>
        </MorphDropdownMenuGroup>

        <MorphDropdownMenuSeparator />

        <MorphDropdownMenuCheckboxItem defaultChecked>
          Show hidden files
        </MorphDropdownMenuCheckboxItem>

        <MorphDropdownMenuSub>
          <MorphDropdownMenuSubTrigger>Share</MorphDropdownMenuSubTrigger>
          <MorphDropdownMenuSubContent>
            <MorphDropdownMenuItem>Copy link</MorphDropdownMenuItem>
            <MorphDropdownMenuItem>Email</MorphDropdownMenuItem>
            <MorphDropdownMenuItem>Invite people</MorphDropdownMenuItem>
          </MorphDropdownMenuSubContent>
        </MorphDropdownMenuSub>

        <MorphDropdownMenuSeparator />

        <MorphDropdownMenuItem variant="danger">
          Delete project
        </MorphDropdownMenuItem>
      </MorphDropdownMenuContent>
    </MorphDropdownMenu>
  );
}
