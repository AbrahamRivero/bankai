import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";

export function NavStore() {
  const { t } = useTranslation();
  const { data: workspace } = useActiveWorkspace();
  const navigate = useNavigate();

  if (!workspace) return null;

  const navItems = [
    {
      title: t("store:sidebar.insights"),
      url: `/dashboard/workspace/${workspace.id}/store`,
      isActive:
        window.location.pathname ===
        `/dashboard/workspace/${workspace.id}/store`,
    },
    {
      title: t("store:sidebar.products"),
      url: `/dashboard/workspace/${workspace.id}/store/products`,
      isActive:
        window.location.pathname ===
        `/dashboard/workspace/${workspace.id}/store/products`,
    },
    {
      title: t("store:sidebar.orders"),
      url: `/dashboard/workspace/${workspace.id}/store/orders`,
      isActive:
        window.location.pathname ===
        `/dashboard/workspace/${workspace.id}/store/orders`,
    },
    {
      title: t("store:sidebar.promotions"),
      url: `/dashboard/workspace/${workspace.id}/store/promotions`,
      isActive:
        window.location.pathname ===
        `/dashboard/workspace/${workspace.id}/store/promotions`,
    },
    {
      title: t("store:sidebar.customers"),
      url: `/dashboard/workspace/${workspace.id}/store/customers`,
      isActive:
        window.location.pathname ===
        `/dashboard/workspace/${workspace.id}/store/customers`,
    },
  ];

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup className="gap-1 p-2">
        <CollapsibleTrigger
          className="data-panel-open:[&_svg]:rotate-90"
          render={
            <SidebarGroupLabel className="h-7 cursor-pointer justify-between px-0 text-sidebar-accent-foreground" />
          }
        >
          <span className="inline-flex items-center gap-1.5">
            {t("store:sidebar.title")}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/60 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    size="default"
                    className="h-8 ps-3.5 text-sm hover:bg-transparent hover:text-sidebar-accent-foreground active:bg-transparent"
                    onClick={() => navigate({ to: item.url })}
                  >
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsiblePanel>
      </SidebarGroup>
    </Collapsible>
  );
}
