import { ImagePlus, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/components/ui/combobox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiUrl } from "@/fetchers/get-api-url";
import useCreateProduct from "@/hooks/mutations/store/use-create-product";
import useGetProducts from "@/hooks/queries/store/use-get-products";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

type CreateProductModalProps = {
  open: boolean;
  onClose: () => void;
};

function CreateProductModal({ open, onClose }: CreateProductModalProps) {
  const { t } = useTranslation();
  const { data: workspace } = useActiveWorkspace();
  const workspaceId = workspace?.id ?? "";
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [gender, setGender] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { data: productsData } = useGetProducts({ workspaceId, limit: 200 });
  const { canCreateProducts } = useWorkspacePermission();

  const products = productsData?.products ?? [];

  const handleClose = () => {
    setTitle("");
    setPrice("");
    setDescription("");
    setStock("");
    setGender("");
    setSizes([]);
    setTags([]);
    setTagInput("");
    setImages([]);
    setIsUploading(false);
    setRelatedProductIds([]);
    setSelectedProductId("");
    onClose();
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    if (!relatedProductIds.includes(selectedProductId)) {
      setRelatedProductIds([...relatedProductIds, selectedProductId]);
    }
    setSelectedProductId("");
  };

  const handleRemoveProduct = (productId: string) => {
    setRelatedProductIds(relatedProductIds.filter((id) => id !== productId));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(getApiUrl("files/products"), {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(t("store:modals.createProduct.imagesUploadError"));
    }

    const data = (await response.json()) as { secureUrl: string };
    return data.secureUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const url = await uploadImage(file);
        setImages((prev) => [...prev, url]);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("store:modals.createProduct.imagesUploadError"),
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) return;

    try {
      await createProduct({
        workspaceId,
        title: title.trim(),
        price: Number.parseFloat(price),
        description: description.trim() || undefined,
        stock: stock ? Number.parseInt(stock, 10) : undefined,
        gender: gender || undefined,
        sizes,
        tags: tags.length > 0 ? tags : undefined,
        images: images.length > 0 ? images : undefined,
        relatedProductIds:
          relatedProductIds.length > 0 ? relatedProductIds : undefined,
      });
      toast.success(t("store:modals.createProduct.successToast"));
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("store:modals.createProduct.errorToast"),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="px-3 pt-4 pb-1 gap-1.5 shrink-0">
          <DialogTitle className="sr-only">
            {t("store:modals.createProduct.title")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("store:modals.createProduct.description")}
          </DialogDescription>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {t("store:modals.createProduct.title")}
            </span>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 space-y-6"
        >
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6 px-6">
            <div>
              <Label htmlFor="product-title">
                {t("store:product.title")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("store:modals.createProduct.titlePlaceholder")}
                autoFocus
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="product-price">
                {t("store:product.price")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="product-description">
                {t("store:product.description")}
              </Label>
              <Textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  "store:modals.createProduct.descriptionPlaceholder",
                )}
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="product-stock">
                  {t("store:product.stock")}
                </Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="product-gender">
                  {t("store:product.gender")}
                </Label>
                <Select
                  value={gender}
                  onValueChange={(value) => value && setGender(value)}
                >
                  <SelectTrigger id="product-gender" className="mt-1">
                    <SelectValue
                      placeholder={t(
                        "store:modals.createProduct.genderPlaceholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">
                      {t("store:modals.createProduct.genderMen")}
                    </SelectItem>
                    <SelectItem value="women">
                      {t("store:modals.createProduct.genderWomen")}
                    </SelectItem>
                    <SelectItem value="kid">
                      {t("store:modals.createProduct.genderKid")}
                    </SelectItem>
                    <SelectItem value="unisex">
                      {t("store:modals.createProduct.genderUnisex")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t("store:modals.createProduct.sizesLabel")}</Label>
              <div className="mt-1">
                <Combobox
                  multiple
                  value={sizes}
                  onValueChange={(values) => setSizes(values as string[])}
                >
                  <ComboboxChips>
                    <ComboboxChipsInput
                      placeholder={t(
                        "store:modals.createProduct.sizesPlaceholder",
                      )}
                    />
                  </ComboboxChips>
                  <ComboboxPopup>
                    <ComboboxList>
                      {SIZES.map((size) => (
                        <ComboboxItem key={size} value={size}>
                          {size}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxPopup>
                </Combobox>
              </div>
            </div>

            <div>
              <Label>{t("store:modals.createProduct.tagsLabel")}</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder={t("store:modals.createProduct.tagsPlaceholder")}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>{t("store:modals.createProduct.imagesLabel")}</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {images.map((url) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-2 -right-2 hidden group-hover:flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="text-xs text-muted-foreground">
                      {t("store:modals.createProduct.imagesUploading")}
                    </span>
                  ) : (
                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <Label>
                {t("store:modals.createProduct.relatedProductsLabel")}
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
                          t("store:modals.createProduct.unknownProduct")}
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
              {relatedProductIds.length > 0 ? (
                <div className="space-y-1 mt-2">
                  {relatedProductIds.map((productId) => {
                    const product = products.find((p) => p.id === productId);
                    return (
                      <div
                        key={productId}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <p className="truncate font-medium">
                          {product?.title ??
                            t("store:modals.createProduct.unknownProduct")}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-6 w-6"
                          onClick={() => handleRemoveProduct(productId)}
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
                !price.trim() ||
                !canCreateProducts() ||
                isPending
              }
              size="sm"
              className="disabled:opacity-50"
            >
              {isPending
                ? t("store:modals.createProduct.creating")
                : t("store:modals.createProduct.createButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProductModal;
