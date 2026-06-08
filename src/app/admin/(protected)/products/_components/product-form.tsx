"use client";

import { useActionState, useRef, useState } from "react";
import { Trash2, Plus, Upload, X, ImageIcon } from "lucide-react";
import type { ProductFormState } from "../actions";
import { UnitType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

export type VariantRow = {
  id?: string;
  sku: string;
  unitValue: string;
  unitType: string;
  price: string;
  salePrice: string;
  stock: string;
};

export type ProductDefaults = {
  name: string;
  description: string;
  brand: string;
  image: string;
  categoryId: string;
  featured: boolean;
  active: boolean;
};

type Category = { id: string; name: string };

type Action = (
  prev: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>;

const emptyVariant: VariantRow = {
  sku: "",
  unitValue: "",
  unitType: "G",
  price: "",
  salePrice: "",
  stock: "",
};

const unitTypes = Object.values(UnitType);

export function ProductForm({
  categories,
  action,
  submitLabel,
  defaults,
  defaultVariants,
}: {
  categories: Category[];
  action: Action;
  submitLabel: string;
  defaults?: ProductDefaults;
  defaultVariants?: VariantRow[];
}) {
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});
  const [variants, setVariants] = useState<VariantRow[]>(
    defaultVariants?.length ? defaultVariants : [{ ...emptyVariant }],
  );

  const [image, setImage] = useState(defaults?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { filename?: string; error?: string };
      if (!res.ok || !json.filename) {
        setUploadError(json.error ?? "Upload failed.");
      } else {
        setImage(json.filename);
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const imageSrc = image
    ? /^https?:\/\//i.test(image) || image.startsWith("/")
      ? image
      : `/products/${image}`
    : null;

  const updateVariant = (
    index: number,
    key: keyof VariantRow,
    value: string,
  ) =>
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    );

  const addVariant = () =>
    setVariants((prev) => [...prev, { ...emptyVariant }]);

  const removeVariant = (index: number) =>
    setVariants((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={defaults?.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={defaults?.categoryId ?? ""}
                className={selectClass}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={defaults?.description}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={defaults?.brand ?? "Kavi"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Product image</Label>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageSrc}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
                {image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setImage("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                id="image"
                name="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="sambar-powder.webp"
              />
              {uploadError && (
                <p className="text-xs text-destructive">{uploadError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload an image (JPG, PNG, WEBP — up to 4 MB), or enter the
                filename of an image already in <code>/public/products/</code>.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={defaults?.featured}
                className="h-4 w-4"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={defaults?.active ?? true}
                className="h-4 w-4"
              />
              Active
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Variants</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-4 w-4" /> Add variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.map((v, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-12"
            >
              <div className="space-y-1 sm:col-span-3">
                <Label className="text-xs">SKU</Label>
                <Input
                  value={v.sku}
                  onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Unit value</Label>
                <Input
                  type="number"
                  min={1}
                  value={v.unitValue}
                  onChange={(e) =>
                    updateVariant(i, "unitValue", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Unit</Label>
                <select
                  value={v.unitType}
                  onChange={(e) => updateVariant(i, "unitType", e.target.value)}
                  className={selectClass}
                >
                  {unitTypes.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Sale (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={v.salePrice}
                  onChange={(e) =>
                    updateVariant(i, "salePrice", e.target.value)
                  }
                />
              </div>
              <div className="flex items-end gap-2 sm:col-span-1">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) => updateVariant(i, "stock", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-end sm:col-span-12">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-destructive",
                    variants.length === 1 && "pointer-events-none opacity-40",
                  )}
                  onClick={() => removeVariant(i)}
                >
                  <Trash2 className="h-4 w-4" /> Remove variant
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
