import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Star, TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import useGetCustomersInsights from "@/hooks/queries/store/use-get-customers-insights";
import useGetDashboard from "@/hooks/queries/store/use-get-dashboard";
import useGetOrders from "@/hooks/queries/store/use-get-orders";
import useGetProductsInsights from "@/hooks/queries/store/use-get-products-insights";
import useGetPromotionsInsights from "@/hooks/queries/store/use-get-promotions-insights";
import useGetReviewsInsights from "@/hooks/queries/store/use-get-reviews-insights";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/store/",
)({
  component: StoreInsightsPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

const CHART_COLORS = [
  "#3b82f6",
  "#ec4899",
  "#f59e0b",
  "#22c55e",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
];

function MetricCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change?: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="mt-1 text-xs text-muted-foreground">
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}% vs previous period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function LoadingSkeletons({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => i).map((i) => (
        <Card key={`skel-${i}`}>
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-1 h-7 w-16" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function StoreInsightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaceId } = Route.useParams();

  const { data: dashboard, isLoading: isLoadingDashboard } =
    useGetDashboard(workspaceId);
  const { data: productsInsights, isLoading: isLoadingProducts } =
    useGetProductsInsights(workspaceId);
  const { data: promotionsInsights, isLoading: isLoadingPromotions } =
    useGetPromotionsInsights(workspaceId);
  const { data: reviewsInsights, isLoading: isLoadingReviews } =
    useGetReviewsInsights(workspaceId);
  const { data: customersInsights, isLoading: isLoadingCustomers } =
    useGetCustomersInsights(workspaceId);
  const { data: orders } = useGetOrders({ workspaceId, limit: 5 });

  const handleViewAllOrders = () => {
    navigate({
      to: "/dashboard/workspace/$workspaceId/store/orders",
      params: { workspaceId },
    });
  };

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
        <div className="space-y-6 p-4">
          {/* Header Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoadingDashboard
              ? Array.from({ length: 5 }, (_, i) => i).map((i) => (
                  <Card key={`skel-${i}`}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-3 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="mb-1 h-7 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))
              : metrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
          </div>

          {dashboard && (
            <p className="text-xs text-muted-foreground">
              {dashboard.period} vs {dashboard.previousPeriod}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Products Insights */}
            {isLoadingProducts ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <LoadingSkeletons count={4} />
              </div>
            ) : productsInsights ? (
              <SectionCard
                title={t("store:sidebar.products")}
                icon={ShoppingCart}
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.products.totalProducts")}
                    </p>
                    <p className="text-2xl font-bold">
                      {productsInsights.totalProducts}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.products.lowStock")}
                    </p>
                    <p className="text-2xl font-bold text-amber-500">
                      {productsInsights.lowStock}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("store:dashboard.products.lowStockDescription")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.products.outOfStock")}
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {productsInsights.outOfStock}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.products.averagePrice")}
                    </p>
                    <p className="text-2xl font-bold">
                      ${productsInsights.averagePrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {productsInsights.topFavorited.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      {t("store:dashboard.products.topFavorited")}
                    </p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={productsInsights.topFavorited
                            .map((p) => ({
                              name: p.title,
                              favorites: p.favoritesCount,
                            }))
                            .reverse()}
                          layout="vertical"
                          margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                          />
                          <XAxis type="number" />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            width={120}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="favorites"
                            fill="var(--color-primary, #3b82f6)"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {productsInsights.byGender.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      {t("store:dashboard.products.byGender")}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {productsInsights.byGender.map((g) => (
                        <Badge
                          key={g.gender}
                          variant="secondary"
                          className="text-xs"
                        >
                          {g.gender}: {g.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>
            ) : null}

            {/* Orders by Status */}
            {dashboard?.currentOrdersByStatus &&
            dashboard.currentOrdersByStatus.length > 0 ? (
              <SectionCard title={t("store:dashboard.orders.byStatus")}>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboard.currentOrdersByStatus.map((s) => ({
                          name: t(
                            `store:dashboard.orders.${s.status}`,
                            s.status,
                          ),
                          value: s.count,
                          status: s.status,
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {dashboard.currentOrdersByStatus.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={
                              STATUS_COLORS[entry.status] ||
                              CHART_COLORS[
                                dashboard.currentOrdersByStatus.indexOf(entry) %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            ) : null}

            {/* Promotions Insights */}
            {isLoadingPromotions ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <LoadingSkeletons count={4} />
              </div>
            ) : promotionsInsights ? (
              <SectionCard
                title={t("store:sidebar.promotions")}
                icon={TrendingUp}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.promotions.active")}
                    </p>
                    <p className="text-2xl font-bold text-green-500">
                      {promotionsInsights.activePromotions}
                      <span className="text-sm text-muted-foreground font-normal">
                        {" "}
                        / {promotionsInsights.totalPromotions}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.promotions.totalUses")}
                    </p>
                    <p className="text-2xl font-bold">
                      {promotionsInsights.totalUses.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.promotions.expiringSoon")}
                    </p>
                    <p className="text-2xl font-bold text-orange-500">
                      {promotionsInsights.expiringSoon}
                    </p>
                  </div>
                </div>

                {promotionsInsights.byType.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      {t("store:dashboard.promotions.byType")}
                    </p>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={promotionsInsights.byType.map((t) => ({
                            name: t.type,
                            count: t.count,
                          }))}
                          margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            radius={[4, 4, 0, 0]}
                            fill="var(--color-primary, #3b82f6)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </SectionCard>
            ) : null}

            {/* Reviews Insights */}
            {isLoadingReviews ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <LoadingSkeletons count={3} />
              </div>
            ) : reviewsInsights ? (
              <SectionCard title={t("store:sidebar.reviews")} icon={Star}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.reviews.totalReviews")}
                    </p>
                    <p className="text-2xl font-bold">
                      {reviewsInsights.totalReviews}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.reviews.averageRating")}
                    </p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {reviewsInsights.averageRating.toFixed(1)}
                      <span className="text-sm text-muted-foreground font-normal">
                        {" "}
                        / 5
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("store:dashboard.reviews.withoutReviews")}
                    </p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {reviewsInsights.productsWithoutReviews}
                    </p>
                  </div>
                </div>

                {reviewsInsights.ratingDistribution.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      {t("store:dashboard.reviews.ratingDistribution")}
                    </p>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reviewsInsights.ratingDistribution.map((r) => ({
                            name: t("store:dashboard.reviews.stars", {
                              count: r.rating,
                            }),
                            rating: r.rating,
                            count: r.count,
                          }))}
                          margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            radius={[4, 4, 0, 0]}
                            fill="var(--color-yellow-500, #f59e0b)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </SectionCard>
            ) : null}

            <div className="lg:col-span-2">
              {/* Customers Insights */}
              {isLoadingCustomers ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <LoadingSkeletons count={3} />
                </div>
              ) : customersInsights ? (
                <SectionCard title={t("store:sidebar.customers")} icon={Users}>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("store:dashboard.customers.totalCustomers")}
                      </p>
                      <p className="text-2xl font-bold">
                        {customersInsights.totalCustomers}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("store:dashboard.customers.newCustomers")}
                      </p>
                      <p className="text-2xl font-bold">
                        {customersInsights.newCustomers}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("store:dashboard.customers.repeatRate")}
                      </p>
                      <p className="text-2xl font-bold">
                        {customersInsights.totalCustomers > 0
                          ? `${(
                              (customersInsights.repeatCustomers /
                                customersInsights.totalCustomers) *
                                100
                            ).toFixed(1)}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {customersInsights.topBuyers.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          {t("store:dashboard.customers.topBuyers")}
                        </p>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={customersInsights.topBuyers
                                .map((b) => ({
                                  name: b.name,
                                  spent: b.totalSpent,
                                  orders: b.orderCount,
                                }))
                                .reverse()}
                              layout="vertical"
                              margin={{
                                left: 20,
                                right: 20,
                                top: 5,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                              />
                              <XAxis type="number" />
                              <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                width={100}
                              />
                              <Tooltip
                                formatter={(value) => [
                                  `$${Number(value).toFixed(2)}`,
                                  "Total Spent",
                                ]}
                              />
                              <Bar
                                dataKey="spent"
                                fill="var(--color-primary, #3b82f6)"
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {customersInsights.byProvince.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          {t("store:dashboard.customers.byProvince")}
                        </p>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={customersInsights.byProvince
                                .slice(0, 10)
                                .map((p) => ({
                                  name: p.province,
                                  count: p.count,
                                }))}
                              margin={{
                                left: 20,
                                right: 20,
                                top: 5,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                              />
                              <XAxis dataKey="name" />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                                fill="var(--color-primary, #3b82f6)"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              {/* Recent Orders */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {t("store:order.detail")}
                </h2>
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
                            <Badge variant="secondary">
                              {order.orderStatus}
                            </Badge>
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
          </div>
        </div>
      </WorkspaceLayout>
    </>
  );
}

export default StoreInsightsPage;
