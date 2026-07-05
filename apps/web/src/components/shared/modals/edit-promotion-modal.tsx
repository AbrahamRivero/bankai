import { CalendarIcon, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useUpdatePromotion from "@/hooks/mutations/store/use-update-promotion";
import useGetProducts from "@/hooks/queries/store/use-get-products";
import useGetPromotionProducts from "@/hooks/queries/store/use-get-promotion-products";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { cn } from "@/lib/cn";
import { formatDateMedium } from "@/lib/format";
import { toast } from "@/lib/toast";

type EditPromotionModalProps = {
  open: boolean;
  onClose: () => void;
  promotion: {
    id: string;
    title: string;
    code: string;
    type: string;
    value: number;
    description: string | null;
    startDate: string;
    endDate: string;
    maxUses: number | null;
    currentUses: number;
  };
};

function EditPromotionModal({
  open,
  onClose,
  promotion,
}: EditPromotionModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(promotion.title);
  const [code, setCode] = useState(promotion.code);
  const [type, setType] = useState<"percentage" | "free_shipping" | "bogo">(
    promotion.type as "percentage" | "free_shipping" | "bogo",
  );
  const [value, setValue] = useState(String(promotion.value));
  const [description, setDescription] = useState(promotion.description ?? "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    promotion.startDate ? new Date(promotion.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    promotion.endDate ? new Date(promotion.endDate) : undefined,
  );
  const [maxUses, setMaxUses] = useState(
    promotion.maxUses ? String(promotion.maxUses) : "",
  );
  const { data: workspace } = useActiveWorkspace();
  const workspaceId = workspace?.id ?? "";
  const { mutateAsync: updatePromotionMutation, isPending } =
    useUpdatePromotion();
  const { canUpdatePromotions } = useWorkspacePermission();
  const { data: promotionProducts = [] } = useGetPromotionProducts(
    promotion.id,
    open,
  );
  const { data: productsData } = useGetProducts({ workspaceId, limit: 200 });
  const products = productsData?.products ?? [];
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [applicableProducts, setApplicableProducts] =
    useState<{ productId: string; quantity: number }[]>(promotionProducts);

  useEffect(() => {
    setApplicableProducts(promotionProducts);
  }, [promotionProducts]);

  const handleClose = () => {
    setApplicableProducts([]);
    setSelectedProductId("");
    setSelectedQuantity("1");
    onClose();
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const qty = Number.parseInt(selectedQuantity, 10) || 1;
    const existing = applicableProducts.findIndex(
      (i) => i.productId === selectedProductId,
    );
    if (existing >= 0) {
      const updated = [...applicableProducts];
      updated[existing].quantity += qty;
      setApplicableProducts(updated);
    } else {
      setApplicableProducts([
        ...applicableProducts,
        { productId: selectedProductId, quantity: qty },
      ]);
    }
    setSelectedProductId("");
    setSelectedQuantity("1");
  };

  const handleRemoveProduct = (productId: string) => {
    setApplicableProducts(
      applicableProducts.filter((i) => i.productId !== productId),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !code.trim() ||
      !value.trim() ||
      !startDate ||
      !endDate
    )
      return;

    try {
      await updatePromotionMutation({
        id: promotion.id,
        workspaceId,
        title: title.trim(),
        code: code.trim().toUpperCase(),
        type,
        value: Number.parseFloat(value),
        description: description.trim() || undefined,
        startDate: startDate ? startDate.toISOString() : "",
        endDate: endDate ? endDate.toISOString() : "",
        maxUses: maxUses ? Number.parseInt(maxUses, 10) : undefined,
        applicableProductIds:
          applicableProducts.length > 0 ? applicableProducts : undefined,
      });
      toast.success(t("store:modals.editPromotion.successToast"));
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("store:modals.editPromotion.errorToast"),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="px-3 pt-4 pb-1 gap-1.5 shrink-0">
          <DialogTitle className="sr-only">
            {t("store:modals.editPromotion.title")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("store:modals.editPromotion.description")}
          </DialogDescription>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {t("store:modals.editPromotion.title")}
            </span>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 space-y-6"
        >
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6 px-6">
            <div>
              <Label htmlFor="edit-promo-title">
                {t("store:modals.editPromotion.titleLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-promo-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("store:modals.editPromotion.titlePlaceholder")}
                autoFocus
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-promo-code">
                {t("store:promotions.code")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-promo-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t("store:modals.editPromotion.codePlaceholder")}
                required
                className="mt-1 font-mono uppercase"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="edit-promo-type">
                  {t("store:promotions.type")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={type}
                  onValueChange={(value) =>
                    value && setType(value as typeof type)
                  }
                >
                  <SelectTrigger id="edit-promo-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      {t("store:modals.editPromotion.typePercentage")}
                    </SelectItem>
                    <SelectItem value="free_shipping">
                      {t("store:modals.editPromotion.typeFreeShipping")}
                    </SelectItem>
                    <SelectItem value="bogo">
                      {t("store:modals.editPromotion.typeBogo")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="edit-promo-value">
                  {t("store:promotions.value")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-promo-value"
                  type="number"
                  step={type === "percentage" ? "1" : "0.01"}
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === "percentage" ? "10" : "5.00"}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>
                  {t("store:modals.editPromotion.startDateLabel")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "mt-1 flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                        startDate
                          ? "bg-accent/30 text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>
                        {startDate
                          ? formatDateMedium(startDate)
                          : t("store:modals.editPromotion.startDateLabel")}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      className="w-full bg-popover"
                    />
                    {startDate && (
                      <div className="p-2 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setStartDate(undefined)}
                        >
                          {t("store:modals.editPromotion.clearStartDate")}
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Label>
                  {t("store:modals.editPromotion.endDateLabel")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "mt-1 flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                        endDate
                          ? "bg-accent/30 text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>
                        {endDate
                          ? formatDateMedium(endDate)
                          : t("store:modals.editPromotion.endDateLabel")}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      className="w-full bg-popover"
                    />
                    {endDate && (
                      <div className="p-2 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setEndDate(undefined)}
                        >
                          {t("store:modals.editPromotion.clearEndDate")}
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-promo-description">
                {t("store:product.description")}
              </Label>
              <Input
                id="edit-promo-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  "store:modals.editPromotion.descriptionPlaceholder",
                )}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-promo-max-uses">
                {t("store:modals.editPromotion.usageLimit")}
              </Label>
              <Input
                id="edit-promo-max-uses"
                type="number"
                min="0"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder={t(
                  "store:modals.editPromotion.usageLimitPlaceholder",
                )}
                className="mt-1"
              />
            </div>

            <div>
              <Label>
                {t("store:modals.editPromotion.applicableProductsLabel")}
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Select
                  value={selectedProductId}
                  onValueChange={(value) =>
                    value && setSelectedProductId(value)
                  }
                >
                  <SelectTrigger className="flex-1">
                    {selectedProductId ? (
                      <span className="flex-1 truncate">
                        {products.find((p) => p.id === selectedProductId)
                          ?.title ??
                          t("store:modals.createOrder.unknownProduct")}
                      </span>
                    ) : (
                      <SelectValue
                        placeholder={t(
                          "store:modals.createOrder.selectProduct",
                        )}
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                  className="w-20 text-center"
                  placeholder="1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={handleAddProduct}
                  disabled={!selectedProductId}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {applicableProducts.length > 0 ? (
                <div className="space-y-1 mt-2">
                  {applicableProducts.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId,
                    );
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {product?.title ??
                              t("store:modals.createOrder.unknownProduct")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × $
                            {product?.price.toFixed(2) ?? "0.00"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-6 w-6"
                          onClick={() => handleRemoveProduct(item.productId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  {t("store:modals.createOrder.noItems")}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border bg-background px-6 py-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent"
            >
              {t("common:actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                !title.trim() ||
                !code.trim() ||
                !value.trim() ||
                !startDate ||
                !endDate ||
                !canUpdatePromotions() ||
                isPending
              }
              size="sm"
              className="disabled:opacity-50"
            >
              {isPending
                ? t("store:modals.editPromotion.saving")
                : t("store:modals.editPromotion.saveButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditPromotionModal;
