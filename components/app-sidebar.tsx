"use strict";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ChevronRight, LayoutDashboard, Tag } from "lucide-react"
import Link from "next/link"
import createLogger from "@/lib/logger"
import {UUID} from "node:crypto";

const logger = createLogger("AppSidebar")

export type NavItem = {
  title: string
  href?: string
  children?: NavItem[]
}

interface Stream {
  uuid: string
  name: string
  children: Stream[]
  sources: unknown[]
}

async function getStreams(): Promise<Stream[]> {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/reporting/streams`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

function groupToNavItem(stream: Stream): NavItem {
  return {
    title: stream.name,
    href: `/stream/${encodeURIComponent(stream.name)}`,
    children: stream.children.map(groupToNavItem),
  }
}

function NavItemNode({ item }: { item: NavItem }) {
  if (item.children?.length) {
    return (
      <Collapsible asChild defaultOpen={false} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              <Tag />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <NavSubItemNode key={child.title} item={child} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title}>
        <Link href={item.href ?? "#"}>
          <Tag />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavSubItemNode({ item }: { item: NavItem }) {
  if (item.children?.length) {
    return (
      <Collapsible asChild defaultOpen={false} className="group/collapsible">
        <SidebarMenuSubItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton>
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <NavSubItemNode key={child.title} item={child} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuSubItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <Link href={item.href ?? "#"}>
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

export async function AppSidebar() {
  const groups = await getStreams()
  logger.info(`Fetched ${groups.length} groups`)

  const navItems: NavItem[] = groups.map(groupToNavItem)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 border-b flex items-center px-6">
        <div className="flex items-center gap-2 font-semibold overflow-hidden whitespace-nowrap">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="truncate">ise--y2--b3--project</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Subjects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <NavItemNode key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
