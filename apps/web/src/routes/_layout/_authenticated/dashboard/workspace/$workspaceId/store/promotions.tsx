import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import CreatePromotionModal from "@/components/shared/modals/create-promotion-modal";
import EditPromotionModal from "@/components/shared/modals/edit-promotion-modal";
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
import type { PromotionItem } from "@/fetchers/promotions/get-promotions";
import useDeletePromotion from "@/hooks/mutations/store/use-delete-promotion";
import useGetPromotions from "@/hooks/queries/store/use-get-promotions";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

const PAGE_SIZE = 10;

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/store/promotions",
)({
  component: StorePromotionsPage,
});

function StorePromotionsPage() {
  const { t } = useTranslation();
  const { workspaceId } = Route.useParams();
  const [isCreatePromotionOpen, setIsCreatePromotionOpen] = useState(false);
  const [editPromotion, setEditPromotion] = useState<PromotionItem | null>(
    null,
  );
  const [promotionToDelete, setPromotionToDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useGetPromotions(workspaceId, {
    limit: PAGE_SIZE,
    offset,
  });
  const { mutateAsync: deletePromotion } = useDeletePromotion();
  const { canCreatePromotions, canUpdatePromotions, canDeletePromotions } =
    useWorkspacePermission();

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const handlePageChange = (page: number) => {
    setOffset((page - 1) * PAGE_SIZE);
  };

  const handleCreatePromotion = () => {
    setIsCreatePromotionOpen(true);
  };

  const handleDeletePromotion = async () => {
    if (!promotionToDelete) return;
    try {
      await deletePromotion({
        id: promotionToDelete.id,
        workspaceId,
      });
      toast.success(t("store:promotions.deleteSuccess"));
      setPromotionToDelete(null);
    } catch {
      toast.error(t("store:promotions.deleteError"));
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title={t("store:sidebar.promotions")} />
        <WorkspaceLayout
          title={t("store:sidebar.promotions")}
          headerActions={
            canCreatePromotions() ? (
              <Button
                variant="outline"
                size="xs"
                onClick={handleCreatePromotion}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                {t("store:promotions.create")}
              </Button>
            ) : undefined
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-medium">
                  {t("store:promotions.code")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:promotions.type")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:promotions.value")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:promotions.active")}
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  {t("store:promotions.usage")}
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
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-12" />
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

  if (!data?.promotions || data.promotions.length === 0) {
    return (
      <>
        <PageTitle title={t("store:sidebar.promotions")} />
        <WorkspaceLayout
          title={t("store:sidebar.promotions")}
          headerActions={
            canCreatePromotions() ? (
              <Button
                variant="outline"
                size="xs"
                onClick={handleCreatePromotion}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                {t("store:promotions.create")}
              </Button>
            ) : undefined
          }
        >
          <Empty className="min-h-[60vh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Tag />
              </EmptyMedia>
              <EmptyTitle>{t("store:promotions.noPromotions")}</EmptyTitle>
              <EmptyDescription>
                {t("store:common.noPromotionsDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {canCreatePromotions() ? (
                <Button onClick={handleCreatePromotion}>
                  <Plus />
                  {t("store:promotions.create")}
                </Button>
              ) : null}
            </EmptyContent>
          </Empty>
        </WorkspaceLayout>

        <CreatePromotionModal
          open={isCreatePromotionOpen}
          onClose={() => setIsCreatePromotionOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("store:sidebar.promotions")} />
      <WorkspaceLayout
        title={t("store:sidebar.promotions")}
        headerActions={
          canCreatePromotions() ? (
            <Button
              variant="outline"
              size="xs"
              onClick={handleCreatePromotion}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              {t("store:promotions.create")}
            </Button>
          ) : undefined
        }
      >
        <Table>
          <TableHeader className="p-4">
            <TableRow>
              <TableHead className="text-foreground font-medium">
                {t("store:promotions.code")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:promotions.type")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:promotions.value")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:promotions.active")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                {t("store:promotions.usage")}
              </TableHead>
              <TableHead className="text-foreground font-medium">
                <span className="sr-only">{t("common:actions.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.promotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="py-3 font-medium">{promo.code}</TableCell>
                <TableCell className="py-3">{promo.type}</TableCell>
                <TableCell className="py-3">
                  {promo.type === "percentage"
                    ? `${promo.value}%`
                    : `$${promo.value}`}
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant={promo.isActive ? "success" : "secondary"}>
                    {promo.isActive
                      ? t("store:promotions.activeStatus")
                      : t("store:promotions.inactiveStatus")}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  {promo.currentUses}
                  {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-1">
                    {canUpdatePromotions() ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditPromotion(promo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {canDeletePromotions() ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setPromotionToDelete({
                            id: promo.id,
                            code: promo.code,
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
        open={!!promotionToDelete}
        onOpenChange={() => setPromotionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("store:promotions.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("store:promotions.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>
              <Button variant="outline" size="sm">
                {t("common:actions.cancel")}
              </Button>
            </AlertDialogClose>
            <AlertDialogClose onClick={handleDeletePromotion}>
              <Button variant="destructive" size="sm">
                {t("store:promotions.deleteAction")}
              </Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreatePromotionModal
        open={isCreatePromotionOpen}
        onClose={() => setIsCreatePromotionOpen(false)}
      />

      {editPromotion && (
        <EditPromotionModal
          open
          onClose={() => setEditPromotion(null)}
          promotion={editPromotion}
        />
      )}
    </>
  );
}
