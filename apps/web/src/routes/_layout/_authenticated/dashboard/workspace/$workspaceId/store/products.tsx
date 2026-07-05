import { createFileRoute } from "@tanstack/react-router";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import CreateProductModal from "@/components/shared/modals/create-product-modal";
import EditProductModal from "@/components/shared/modals/edit-product-modal";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDeleteProduct from "@/hooks/mutations/store/use-delete-product";
import useGetProducts from "@/hooks/queries/store/use-get-products";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

const PAGE_SIZE = 10;

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/store/products",
)({
  component: StoreProductsPage,
});

function StoreProductsPage() {
  const { t } = useTranslation();
  const { workspaceId } = Route.useParams();
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useGetProducts({
    workspaceId,
    limit: PAGE_SIZE,
    offset,
  });
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { canCreateProducts, canUpdateProducts, canDeleteProducts } =
    useWorkspacePermission();

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const handlePageChange = (page: number) => {
    setOffset((page - 1) * PAGE_SIZE);
  };

  const handleCreateProduct = () => {
    setIsCreateProductOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct({
        id: productToDelete.id,
        workspaceId,
      });
      toast.success(t("store:product.deleteSuccess"));
      setProductToDelete(null);
    } catch {
      toast.error(t("store:product.deleteError"));
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title={t("store:sidebar.products")} />
        <WorkspaceLayout
          title={t("store:sidebar.products")}
          headerActions={
            canCreateProducts() ? (
              <Button
                variant="outline"
                size="xs"
                onClick={handleCreateProduct}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                {t("store:product.create")}
              </Button>
            ) : undefined
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-medium">
                  {t("store:product.image")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:product.title")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:product.price")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:product.stock")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:product.gender")}
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
                    <Skeleton className="h-10 w-10 rounded" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-12" />
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

  if (!data?.products || data.products.length === 0) {
    return (
      <>
        <PageTitle title={t("store:sidebar.products")} />
        <WorkspaceLayout
          title={t("store:sidebar.products")}
          headerActions={
            canCreateProducts() ? (
              <Button
                variant="outline"
                size="xs"
                onClick={handleCreateProduct}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                {t("store:product.create")}
              </Button>
            ) : undefined
          }
        >
          <Empty className="min-h-[60vh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>{t("store:common.noProducts")}</EmptyTitle>
              <EmptyDescription>
                {t("store:common.noProductsDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {canCreateProducts() ? (
                <Button onClick={handleCreateProduct}>
                  <Plus />
                  {t("store:product.create")}
                </Button>
              ) : null}
            </EmptyContent>
          </Empty>
        </WorkspaceLayout>

        <CreateProductModal
          open={isCreateProductOpen}
          onClose={() => setIsCreateProductOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("store:sidebar.products")} />
      <WorkspaceLayout
        title={t("store:sidebar.products")}
        headerActions={
          canCreateProducts() ? (
            <Button
              variant="outline"
              size="xs"
              onClick={handleCreateProduct}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              {t("store:product.create")}
            </Button>
          ) : undefined
        }
      >
        <Table>
          <TableHeader className="p-4">
            <TableRow>
              <TableHead className="text-foreground font-medium">
                {t("store:product.image")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:product.title")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:product.price")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:product.stock")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:product.gender")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                <span className="sr-only">{t("common:actions.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="py-3">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                      <span className="text-xs text-muted-foreground">
                        {t("store:product.noImage")}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3 font-medium">
                  {product.title}
                </TableCell>
                <TableCell className="py-3">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    variant={product.stock > 0 ? "success" : "destructive"}
                  >
                    {product.stock > 0
                      ? t("store:product.inStock", { count: product.stock })
                      : t("store:product.outOfStock")}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">{product.gender}</TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-1">
                    {canUpdateProducts() ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditProductId(product.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {canDeleteProducts() ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setProductToDelete({
                            id: product.id,
                            title: product.title,
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
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </WorkspaceLayout>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("store:product.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("store:product.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>
              <Button variant="outline" size="sm">
                {t("common:actions.cancel")}
              </Button>
            </AlertDialogClose>
            <AlertDialogClose onClick={handleDeleteProduct}>
              <Button variant="destructive" size="sm">
                {t("store:product.deleteAction")}
              </Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateProductModal
        open={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
      />

      {editProductId && (
        <EditProductModal
          open
          onClose={() => setEditProductId(null)}
          productId={editProductId}
        />
      )}
    </>
  );
}
