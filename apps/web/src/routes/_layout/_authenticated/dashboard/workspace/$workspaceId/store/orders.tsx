import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Package, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import CreateOrderModal from "@/components/shared/modals/create-order-modal";
import EditOrderModal from "@/components/shared/modals/edit-order-modal";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDeleteOrder from "@/hooks/mutations/store/use-delete-order";
import useGetOrders from "@/hooks/queries/store/use-get-orders";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/store/orders",
)({
  component: StoreOrdersPage,
  validateSearch: (search: Record<string, unknown>) => ({
    customer: (search.customer as string) || undefined,
  }),
});

function StoreOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaceId } = Route.useParams();
  const { customer } = Route.useSearch();
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);
  const { data, isLoading } = useGetOrders({
    workspaceId,
    limit: 50,
    customerId: customer,
  });
  const { mutateAsync: deleteOrder } = useDeleteOrder();
  const { canCreateOrders, canUpdateOrders, canDeleteOrders } =
    useWorkspacePermission();

  const handleCreateOrder = () => {
    setIsCreateOrderOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder({
        id: orderToDelete.id,
        workspaceId,
      });
      toast.success(t("store:order.deleteSuccess"));
      setOrderToDelete(null);
    } catch {
      toast.error(t("store:order.deleteError"));
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title={t("store:sidebar.orders")} />
        <WorkspaceLayout
          title={t("store:sidebar.orders")}
          headerActions={
            canCreateOrders() ? (
              <Button
                variant="outline"
                size="xs"
                onClick={handleCreateOrder}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                {t("store:order.create")}
              </Button>
            ) : undefined
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-medium">
                  {t("store:order.orderNumber")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:order.status")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:order.total")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:order.customer")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:order.date")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  <span className="sr-only">{t("common:actions.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </WorkspaceLayout>
      </>
    );
  }

  if (!data?.orders || data.orders.length === 0) {
    return (
      <>
        <PageTitle title={t("store:sidebar.orders")} />
        <WorkspaceLayout
          title={t("store:sidebar.orders")}
          headerActions={
            canCreateOrders() ? (
              <Button
                variant="outline"
                size="xs"
                onClick={handleCreateOrder}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                {t("store:order.create")}
              </Button>
            ) : undefined
          }
        >
          <Empty className="min-h-[60vh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>{t("store:common.noOrders")}</EmptyTitle>
              <EmptyDescription>
                {t("store:common.noOrdersDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {canCreateOrders() ? (
                <Button onClick={handleCreateOrder}>
                  <Plus />
                  {t("store:order.create")}
                </Button>
              ) : null}
            </EmptyContent>
          </Empty>
        </WorkspaceLayout>

        <CreateOrderModal
          open={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("store:sidebar.orders")} />
      <WorkspaceLayout
        title={t("store:sidebar.orders")}
        headerActions={
          canCreateOrders() ? (
            <Button
              variant="outline"
              size="xs"
              onClick={handleCreateOrder}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              {t("store:order.create")}
            </Button>
          ) : undefined
        }
      >
        {customer ? (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              {t("store:order.filteredByCustomer")}
              <button
                type="button"
                onClick={() =>
                  navigate({
                    search: {},
                    replace: true,
                  })
                }
                className="ml-1 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          </div>
        ) : null}
        <Table>
          <TableHeader className="p-4">
            <TableRow>
              <TableHead className="text-foreground font-medium">
                {t("store:order.orderNumber")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:order.status")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:order.total")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:order.customer")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:order.date")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                <span className="sr-only">{t("common:actions.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="py-3 font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="secondary">{order.orderStatus}</Badge>
                </TableCell>
                <TableCell className="py-3">
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {order.customerName ?? "—"}
                </TableCell>
                <TableCell className="py-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-1">
                    {canUpdateOrders() ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditOrderId(order.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {canDeleteOrders() ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setOrderToDelete({
                            id: order.id,
                            orderNumber: order.orderNumber,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </WorkspaceLayout>

      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={() => setOrderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("store:order.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("store:order.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>
              <Button variant="outline" size="sm">
                {t("common:actions.cancel")}
              </Button>
            </AlertDialogClose>
            <AlertDialogClose onClick={handleDeleteOrder}>
              <Button variant="destructive" size="sm">
                {t("store:order.deleteAction")}
              </Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateOrderModal
        open={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
      />

      {editOrderId && (
        <EditOrderModal
          open
          onClose={() => setEditOrderId(null)}
          orderId={editOrderId}
        />
      )}
    </>
  );
}
