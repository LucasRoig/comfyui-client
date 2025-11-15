"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@lro-ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@lro-ui/sidebar";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router";

type SubItem = {
  title: string;
  url: string;
};

type MainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SubItem[];
};

export function NavMain({ items }: { items: MainItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Group Label</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items?.length ? (
            <CollapsibleItem key={item.title} item={item} />
          ) : (
            <SingleMainItem key={item.title} item={item} />
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function SingleMainItem({ item }: { item: MainItem }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link to={item.url}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CollapsibleItem({ item }: { item: MainItem }) {
  return (
    <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild>
                  <Link to={subItem.url}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
