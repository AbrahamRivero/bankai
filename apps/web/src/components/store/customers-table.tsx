import { useNavigate } from "@tanstack/react-router";
import {
  Ban,
  EllipsisIcon,
  ExternalLinkIcon,
  Shield,
  ShieldCheck,
  TrashIcon,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WorkspaceMember } from "@/fetchers/workspace-user/get-workspace-members";
import useBanWorkspaceUser from "@/hooks/mutations/workspace-user/use-ban-workspace-user";
import useDeleteWorkspaceUser from "@/hooks/mutations/workspace-user/use-delete-workspace-user";
import useUnbanWorkspaceUser from "@/hooks/mutations/workspace-user/use-unban-workspace-user";
import useUpdateWorkspaceUserRole from "@/hooks/mutations/workspace-user/use-update-workspace-user-role";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { cn } from "@/lib/cn";
import { formatDateMedium } from "@/lib/format";
import { toast } from "@/lib/toast";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../ui/menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Props = {
  workspaceId: string;
  users: WorkspaceMember[];
};

const AVATAR_TONES = [
  "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
] as const;

function toneFor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

function initials(value: string | null | undefined): string {
  if (!value) return "?";
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function CustomersTable({ workspaceId, users }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customerToDelete, setCustomerToDelete] =
    useState<WorkspaceMember | null>(null);
  const [customerToBan, setCustomerToBan] = useState<WorkspaceMember | null>(
    null,
  );
  const [customerToUnban, setCustomerToUnban] =
    useState<WorkspaceMember | null>(null);
  const [customerToPromote, setCustomerToPromote] =
    useState<WorkspaceMember | null>(null);
  const [promoteRole, setPromoteRole] = useState<string>("");

  const { mutateAsync: deleteWorkspaceUser, isPending: isDeleting } =
    useDeleteWorkspaceUser();
  const { mutateAsync: banUser, isPending: isBanning } = useBanWorkspaceUser();
  const { mutateAsync: unbanUser, isPending: isUnbanning } =
    useUnbanWorkspaceUser();
  const { mutateAsync: updateRole, isPending: isPromoting } =
    useUpdateWorkspaceUserRole();
  const { canRemoveMembers, canDeleteWorkspace } = useWorkspacePermission();
  const canRemove = Boolean(canRemoveMembers());

  const customers = users.filter((m) => m.role === "viewer");

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      await deleteWorkspaceUser({
        workspaceId,
        userId: customerToDelete.email,
      });
      toast.success(t("store:customers.removeSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("store:customers.removeError"),
      );
    } finally {
      setCustomerToDelete(null);
    }
  };

  const handleBanCustomer = async () => {
    if (!customerToBan) return;
    try {
      await banUser({ userId: customerToBan.id });
      toast.success(t("store:customers.banSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("store:customers.banError"),
      );
    } finally {
      setCustomerToBan(null);
    }
  };

  const handleUnbanCustomer = async () => {
    if (!customerToUnban) return;
    try {
      await unbanUser({ userId: customerToUnban.id });
      toast.success(t("store:customers.unbanSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("store:customers.unbanError"),
      );
    } finally {
      setCustomerToUnban(null);
    }
  };

  const handlePromoteCustomer = async () => {
    if (!customerToPromote || !promoteRole) return;
    try {
      await updateRole({
        workspaceId,
        memberId: customerToPromote.memberId,
        role: promoteRole,
      });
      toast.success(t("store:customers.promoteSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("store:customers.promoteError"),
      );
    } finally {
      setCustomerToPromote(null);
      setPromoteRole("");
    }
  };

  const handleViewOrders = (userId: string) => {
    navigate({
      to: "/dashboard/workspace/$workspaceId/store/orders",
      params: { workspaceId },
      search: { customer: userId },
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="ps-6 text-foreground font-medium">
              {t("store:customers.columns.name")}
            </TableHead>
            <TableHead className="text-foreground font-medium">
              {t("store:customers.columns.role")}
            </TableHead>
            <TableHead className="text-foreground font-medium">
              {t("store:customers.columns.status")}
            </TableHead>
            <TableHead className="text-foreground font-medium">
              {t("store:customers.columns.joined")}
            </TableHead>
            <TableHead className="w-px pe-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const tone = toneFor(customer.email);
            const isBanned = Boolean(customer.banned);
            return (
              <TableRow key={customer.email}>
                <TableCell className="ps-6 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className={cn("size-8", tone)}>
                      <AvatarImage
                        src={customer.image ?? ""}
                        alt={customer.name ?? ""}
                      />
                      <AvatarFallback className="bg-transparent text-[11px] font-medium">
                        {initials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{customer.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="secondary" className="capitalize">
                    {t("store:customers.viewerBadge")}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  {isBanned ? (
                    <Badge variant="destructive" className="gap-1">
                      <Ban className="size-3" />
                      {t("store:customers.bannedBadge")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="size-3" />
                      {t("store:customers.activeBadge")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground tabular-nums">
                  {customer.createdAt
                    ? formatDateMedium(customer.createdAt)
                    : "—"}
                </TableCell>
                <TableCell className="pe-6 py-3 text-right">
                  {canRemove ? (
                    <Menu>
                      <MenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                          />
                        }
                      >
                        <EllipsisIcon className="size-4" />
                      </MenuTrigger>
                      <MenuPopup align="end">
                        <MenuItem onClick={() => handleViewOrders(customer.id)}>
                          <ExternalLinkIcon className="size-4" />
                          {t("store:customers.viewOrders")}
                        </MenuItem>
                        {canDeleteWorkspace() ? (
                          <>
                            <MenuItem
                              onClick={() => {
                                setCustomerToPromote(customer);
                                setPromoteRole("member");
                              }}
                            >
                              <UserPlus className="size-4" />
                              {t("store:customers.promoteToMember")}
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setCustomerToPromote(customer);
                                setPromoteRole("admin");
                              }}
                            >
                              <Shield className="size-4" />
                              {t("store:customers.promoteToAdmin")}
                            </MenuItem>
                            {isBanned ? (
                              <MenuItem
                                onClick={() => setCustomerToUnban(customer)}
                              >
                                <ShieldCheck className="size-4" />
                                {t("store:customers.unbanCustomer")}
                              </MenuItem>
                            ) : (
                              <MenuItem
                                onClick={() => setCustomerToBan(customer)}
                              >
                                <Ban className="size-4" />
                                {t("store:customers.banCustomer")}
                              </MenuItem>
                            )}
                            <MenuItem
                              onClick={() => setCustomerToDelete(customer)}
                            >
                              <TrashIcon className="size-4" />
                              {t("store:customers.removeCustomer")}
                            </MenuItem>
                          </>
                        ) : null}
                      </MenuPopup>
                    </Menu>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}

          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <p className="text-sm font-medium text-foreground">
                    {t("store:customers.emptyTitle")}
                  </p>
                  <p className="text-xs">
                    {t("store:customers.emptyDescription")}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("store:customers.removeDialogTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("store:customers.removeDialogDescription", {
                name: customerToDelete?.name || customerToDelete?.email || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose disabled={isDeleting}>
              <Button variant="outline" size="sm" disabled={isDeleting}>
                {t("common:actions.cancel")}
              </Button>
            </AlertDialogClose>
            <AlertDialogClose
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
            >
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <TrashIcon className="mr-2 size-4" />
                {t("store:customers.removeCustomer")}
              </Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!customerToBan}
        onOpenChange={(open) => !open && setCustomerToBan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("store:customers.banDialogTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("store:customers.banDialogDescription", {
                name: customerToBan?.name || customerToBan?.email || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose disabled={isBanning}>
              <Button variant="outline" size="sm" disabled={isBanning}>
                {t("common:actions.cancel")}
              </Button>
            </AlertDialogClose>
            <AlertDialogClose onClick={handleBanCustomer} disabled={isBanning}>
              <Button variant="destructive" size="sm" disabled={isBanning}>
                <Ban className="mr-2 size-4" />
                {t("store:customers.banCustomer")}
              </Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!customerToUnban}
        onOpenChange={(open) => !open && setCustomerToUnban(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("store:customers.unbanDialogTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("store:customers.unbanDialogDescription", {
                name: customerToUnban?.name || customerToUnban?.email || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose disabled={isUnbanning}>
              <Button variant="outline" size="sm" disabled={isUnbanning}>
                {t("common:actions.cancel")}
              </Button>
            </AlertDialogClose>
            <AlertDialogClose
              onClick={handleUnbanCustomer}
              disabled={isUnbanning}
            >
              <Button size="sm" disabled={isUnbanning}>
                <ShieldCheck className="mr-2 size-4" />
                {t("store:customers.unbanCustomer")}
              </Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!customerToPromote}
        onOpenChange={(open) => !open && setCustomerToPromote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("store:customers.promoteDialogTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("store:customers.promoteDialogDescription", {
                name: customerToPromote?.name || customerToPromote?.email || "",
                role: promoteRole === "admin" ? "Admin" : "Member",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose disabled={isPromoting}>
              <Button variant="outline" size="sm" disabled={isPromoting}>
                {t("common:actions.cancel")}
              </Button>
            </AlertDialogClose>
            <AlertDialogClose
              onClick={handlePromoteCustomer}
              disabled={isPromoting}
            >
              <Button size="sm" disabled={isPromoting}>
                <ShieldCheck className="mr-2 size-4" />
                {promoteRole === "admin"
                  ? t("store:customers.promoteToAdmin")
                  : t("store:customers.promoteToMember")}
              </Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CustomersTable;
