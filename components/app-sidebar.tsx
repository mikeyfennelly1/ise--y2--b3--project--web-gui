"use strict";

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
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Tag } from "lucide-react"
import Link from "next/link"
import createLogger from "@/lib/logger"

const logger = createLogger("AppSidebar")

interface Category {
  id: string | number
  name: string
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/categories`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function AppSidebar() {
  const categories = await getCategories()
  logger.info(`Fetched ${categories.length} categories`)

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
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton asChild tooltip={category.name}>
                    <Link href={`/category/${category.id}`}>
                      <Tag />
                      <span>{category.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
