import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
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
import useGetDashboard from "@/hooks/queries/store/use-get-dashboard";
import useGetOrders from "@/hooks/queries/store/use-get-orders";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/store/",
)({
  component: StoreInsightsPage,
});

function StoreInsightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaceId } = Route.useParams();
  const { data: dashboard, isLoading: isLoadingDashboard } =
    useGetDashboard(workspaceId);
  const { data: orders } = useGetOrders({ workspaceId, limit: 5 });

  const handleViewAllOrders = () => {
    navigate({
      to: "/dashboard/workspace/$workspaceId/store/orders",
      params: { workspaceId },
    });
  };

  if (isLoadingDashboard) {
    return (
      <>
        <PageTitle title={t("store:sidebar.insights")} />
        <WorkspaceLayout
          title={t("store:sidebar.insights")}
          headerActions={
            <Button
              variant="outline"
              size="xs"
              onClick={handleViewAllOrders}
              className="gap-1"
            >
              {t("store:dashboard.viewAllOrders")}
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-3 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-1 h-7 w-16" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </WorkspaceLayout>
      </>
    );
  }

  const metrics = dashboard
    ? [
        {
          label: t("store:dashboard.totalOrders"),
          value: dashboard.totalOrders.toLocaleString(),
          change: dashboard.percentageChange.totalOrders,
        },
        {
          label: t("store:dashboard.totalRevenue"),
          value: `$${dashboard.totalRevenue.toFixed(2)}`,
          change: dashboard.percentageChange.totalRevenue,
        },
        {
          label: t("store:dashboard.averageOrderValue"),
          value: `$${dashboard.averageOrderValue.toFixed(2)}`,
          change: dashboard.percentageChange.averageOrderValue,
        },
        {
          label: t("store:dashboard.productsSold"),
          value: dashboard.productsSold.toLocaleString(),
          change: dashboard.percentageChange.productsSold,
        },
        {
          label: t("store:dashboard.uniqueCustomers"),
          value: dashboard.uniqueCustomers.toLocaleString(),
          change: dashboard.percentageChange.uniqueCustomers,
        },
      ]
    : [];

  return (
    <>
      <PageTitle title={t("store:sidebar.insights")} />
      <WorkspaceLayout
        title={t("store:sidebar.insights")}
        headerActions={
          <Button
            variant="outline"
            size="xs"
            onClick={handleViewAllOrders}
            className="gap-1"
          >
            {t("store:dashboard.viewAllOrders")}
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {metric.change >= 0 ? "+" : ""}
                    {metric.change.toFixed(1)}%{" "}
                    {t("store:dashboard.vsPreviousPeriod")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {dashboard && (
            <p className="text-xs text-muted-foreground">
              {dashboard.period} vs {dashboard.previousPeriod}
            </p>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("store:order.detail")}</h2>
            {orders?.orders && orders.orders.length > 0 ? (
              <Table>
                <TableHeader className="p-4">
                  <TableRow>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.orders.map((order) => (
                    <TableRow key={order.id}>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingCart />
                  </EmptyMedia>
                  <EmptyTitle>{t("store:common.noOrders")}</EmptyTitle>
                  <EmptyDescription>
                    {t("store:common.noOrdersDescription")}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </div>
      </WorkspaceLayout>
    </>
  );
}
