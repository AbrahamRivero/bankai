import { Check, CreditCard, Plus, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import useUpdateOrder from "@/hooks/mutations/store/use-update-order";
import useGetOrder from "@/hooks/queries/store/use-get-order";
import useGetProducts from "@/hooks/queries/store/use-get-products";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import useGetWorkspaceUsers from "@/hooks/queries/workspace-users/use-get-workspace-users";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

type OrderItemInput = {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
};

type EditOrderModalProps = {
  open: boolean;
  onClose: () => void;
  orderId: string;
};

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "completed"
  | "cancelled";
type PaymentMethod = "card" | "usd" | "euro" | "cup";

function EditOrderModal({ open, onClose, orderId }: EditOrderModalProps) {
  const { t } = useTranslation();
  const { data: workspace } = useActiveWorkspace();
  const workspaceId = workspace?.id ?? "";
  const { data: order, isLoading: orderLoading } = useGetOrder(orderId);
  const { data: productsData } = useGetProducts({ workspaceId, limit: 200 });
  const { data: members } = useGetWorkspaceUsers({ workspaceId });
  const { mutateAsync: updateOrderMutation, isPending } = useUpdateOrder();
  const { canUpdateOrders } = useWorkspacePermission();
  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [shipping, setShipping] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const products = productsData?.products ?? [];
  const customers =
    members
      ?.filter((m) => m.role === "viewer")
      .map((m) => ({
        id: m.userId,
        name: m.user?.name ?? m.user?.email ?? "Unknown",
      })) ?? [];

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingValue = Number.parseFloat(shipping) || 0;
  const discountValue = Number.parseFloat(discount) || 0;
  const total = Math.max(0, subtotal + shippingValue - discountValue);

  const handleClose = () => {
    setShippingAddress("");
    setCity("");
    setProvince("");
    setPhone("");
    setOrderStatus("pending");
    setPaymentMethod("card");
    setItems([]);
    setShipping("0");
    setDiscount("0");
    setNotes("");
    setSelectedCustomerId("");
    setInitialized(false);
    setStatusOpen(false);
    setPaymentOpen(false);
    onClose();
  };

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const qty = Number.parseInt(selectedQuantity, 10) || 1;
    const existing = items.findIndex((i) => i.productId === selectedProductId);
    if (existing >= 0) {
      const updated = [...items];
      updated[existing].quantity += qty;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productTitle: product.title,
          quantity: qty,
          price: product.price,
        },
      ]);
    }
    setSelectedProductId("");
    setSelectedQuantity("1");
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    try {
      await updateOrderMutation({
        id: orderId,
        workspaceId,
        orderStatus,
        paymentMethod,
        shipping: shippingValue,
        discount: discountValue,
        subtotal,
        total,
        notes: notes.trim() || undefined,
        phone: phone.trim() || undefined,
        shippingAddress: shippingAddress.trim() || undefined,
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        customerId: selectedCustomerId || undefined,
        orderItems: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
      });
      toast.success(t("store:modals.editOrder.successToast"));
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("store:modals.editOrder.errorToast"),
      );
    }
  };

  if (order && !initialized) {
    setShippingAddress(order.shippingAddress ?? "");
    setCity(order.city ?? "");
    setProvince(order.province ?? "");
    setPhone(order.phone ?? "");
    setOrderStatus(order.orderStatus as OrderStatus);
    setPaymentMethod((order.paymentMethod ?? "card") as PaymentMethod);
    setShipping(String(order.shipping ?? 0));
    setDiscount(String(order.discount ?? 0));
    setNotes(order.notes ?? "");
    setSelectedCustomerId(order.customerId ?? "");
    const orderItems = (order as any).orderItems ?? [];
    const productMap = new Map(products.map((p) => [p.id, p]));
    setItems(
      orderItems.map(
        (item: {
          productId: string;
          quantity: number;
          size?: string;
          price?: number;
        }) => {
          const product = productMap.get(item.productId);
          return {
            productId: item.productId,
            productTitle: product?.title ?? "",
            quantity: item.quantity,
            price: product?.price ?? 0,
          };
        },
      ),
    );
    setInitialized(true);
  }

  if (orderLoading) {
    return null;
  }

  const statusOptions: { value: OrderStatus; labelKey: string }[] = [
    { value: "pending", labelKey: "store:modals.editOrder.statusPending" },
    { value: "confirmed", labelKey: "store:modals.editOrder.statusConfirmed" },
    { value: "shipped", labelKey: "store:modals.editOrder.statusShipped" },
    { value: "completed", labelKey: "store:modals.editOrder.statusCompleted" },
    { value: "cancelled", labelKey: "store:modals.editOrder.statusCancelled" },
  ];

  const paymentOptions: { value: PaymentMethod; labelKey: string }[] = [
    { value: "card", labelKey: "store:modals.editOrder.paymentCard" },
    { value: "usd", labelKey: "store:modals.editOrder.paymentUsd" },
    { value: "euro", labelKey: "store:modals.editOrder.paymentEuro" },
    { value: "cup", labelKey: "store:modals.editOrder.paymentCup" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle asChild>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="text-muted-foreground font-semibold tracking-wider text-sm">
                  {workspace?.name?.toUpperCase() || "STORE"}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="text-foreground font-medium text-sm">
                  {t("store:modals.editOrder.title", {
                    orderNumber: order?.orderNumber ?? "",
                  })}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("store:modals.editOrder.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 space-y-6"
        >
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6 px-6">
            <div>
              <Input
                unstyled
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder={t(
                  "store:modals.editOrder.shippingAddressPlaceholder",
                )}
                className="w-full **:data-[slot=input]:h-auto **:data-[slot=input]:px-0 **:data-[slot=input]:py-3 **:data-[slot=input]:text-lg **:data-[slot=input]:leading-tight **:data-[slot=input]:font-semibold **:data-[slot=input]:tracking-tight **:data-[slot=input]:text-foreground **:data-[slot=input]:placeholder:text-muted-foreground **:data-[slot=input]:outline-none"
              />
              <div className="flex gap-3 mt-3">
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("store:modals.editOrder.cityPlaceholder")}
                  className="flex-1"
                />
                <Input
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder={t("store:modals.editOrder.provincePlaceholder")}
                  className="flex-1"
                />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("store:modals.editOrder.phonePlaceholder")}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Select
                value={selectedCustomerId}
                onValueChange={(value) => setSelectedCustomerId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  {selectedCustomerId ? (
                    <span className="flex-1 truncate">
                      {customers.find((c) => c.id === selectedCustomerId)
                        ?.name ?? t("store:modals.editOrder.unknownCustomer")}
                    </span>
                  ) : (
                    <SelectValue
                      placeholder={t("store:modals.editOrder.selectCustomer")}
                    />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  {customers.length === 0 && (
                    <SelectItem value="__none" disabled>
                      {t("store:modals.editOrder.noCustomers")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-2">
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
                          ?.title ?? t("store:modals.editOrder.unknownProduct")}
                      </span>
                    ) : (
                      <SelectValue
                        placeholder={t("store:modals.editOrder.selectProduct")}
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} — ${p.price.toFixed(2)}
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
                  onClick={handleAddItem}
                  disabled={!selectedProductId}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {items.length > 0 ? (
                <div className="space-y-1 mt-2">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">
                          {item.productTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="ml-2 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-6 w-6"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  {t("store:modals.editOrder.noItems")}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {t("store:modals.editOrder.subtotal")}
                </span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {t("store:modals.editOrder.shippingLabel")}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className="h-8 w-24 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {t("store:modals.editOrder.discountLabel")}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="h-8 w-24 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-sm font-semibold">
                {t("store:modals.editOrder.total")}
              </span>
              <span className="text-lg font-bold">${total.toFixed(2)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 py-2">
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                      orderStatus !== "pending"
                        ? "bg-accent/30 text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                    <span>
                      {statusOptions.find((s) => s.value === orderStatus)
                        ? t(
                            statusOptions.find((s) => s.value === orderStatus)
                              ?.labelKey ??
                              "store:modals.editOrder.statusLabel",
                          )
                        : t("store:modals.editOrder.statusLabel")}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <div className="space-y-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
                        onClick={() => {
                          setOrderStatus(option.value);
                          setStatusOpen(false);
                        }}
                      >
                        <span className="text-sm">{t(option.labelKey)}</span>
                        {orderStatus === option.value && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={paymentOpen} onOpenChange={setPaymentOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
                      paymentMethod !== "card"
                        ? "bg-accent/30 text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>
                      {paymentOptions.find((p) => p.value === paymentMethod)
                        ? t(
                            paymentOptions.find(
                              (p) => p.value === paymentMethod,
                            )?.labelKey ??
                              "store:modals.editOrder.paymentLabel",
                          )
                        : t("store:modals.editOrder.paymentLabel")}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <div className="space-y-1">
                    {paymentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
                        onClick={() => {
                          setPaymentMethod(option.value);
                          setPaymentOpen(false);
                        }}
                      >
                        <span className="text-sm">{t(option.labelKey)}</span>
                        {paymentMethod === option.value && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("store:modals.editOrder.notesPlaceholder")}
              rows={2}
            />
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
              disabled={items.length === 0 || !canUpdateOrders() || isPending}
              size="sm"
              className="disabled:opacity-50"
            >
              {isPending
                ? t("store:modals.editOrder.saving")
                : t("store:modals.editOrder.saveButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditOrderModal;
