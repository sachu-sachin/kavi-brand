"use client";

import { useActionState, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import type { BannerFormState } from "../actions";
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

const PLACEMENTS = [
  { value: "HERO", label: "Hero carousel slide" },
  { value: "ANNOUNCEMENT", label: "Announcement bar message" },
  { value: "PROMO", label: "Promo banner card" },
  { value: "FESTIVE", label: "Festive offer poster" },
] as const;

export type BannerDefaults = {
  placement: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  showOverlay: boolean;
  active: boolean;
};

type Action = (
  prev: BannerFormState,
  formData: FormData,
) => Promise<BannerFormState>;

function previewSrc(image: string): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  return `/banners/${image}`;
}

export function BannerForm({
  action,
  submitLabel,
  defaults,
}: {
  action: Action;
  submitLabel: string;
  defaults?: BannerDefaults;
}) {
  const [state, formAction, pending] = useActionState<
    BannerFormState,
    FormData
  >(action, {});
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
      const res = await fetch("/api/admin/banners/upload", {
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

  const src = previewSrc(image);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Banner content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="placement">Placement</Label>
              <select
                id="placement"
                name="placement"
                defaultValue={defaults?.placement ?? "HERO"}
                className={selectClass}
                required
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Where this banner shows on the home page.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={defaults?.sortOrder ?? 0}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers show first.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title / message</Label>
            <Input
              id="title"
              name="title"
              defaultValue={defaults?.title}
              placeholder="e.g. Up to 20% off masalas & oils"
              required
            />
            <p className="text-xs text-muted-foreground">
              For announcement messages, this is the scrolling text.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eyebrow">Eyebrow (small label)</Label>
              <Input
                id="eyebrow"
                name="eyebrow"
                defaultValue={defaults?.eyebrow}
                placeholder="e.g. Limited time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                name="subtitle"
                rows={2}
                defaultValue={defaults?.subtitle}
                placeholder="Short supporting line"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ctaLabel">Button label</Label>
              <Input
                id="ctaLabel"
                name="ctaLabel"
                defaultValue={defaults?.ctaLabel}
                placeholder="e.g. Shop the sale"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaHref">Button link</Label>
              <Input
                id="ctaHref"
                name="ctaHref"
                defaultValue={defaults?.ctaHref}
                placeholder="/products"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={defaults?.active ?? true}
                className="h-4 w-4"
              />
              Active (visible on the site)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="showOverlay"
                defaultChecked={defaults?.showOverlay ?? false}
                className="h-4 w-4"
              />
              Show text overlay on the image (hero banners)
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* image value submitted with the form */}
          <input type="hidden" name="image" value={image} />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-28 w-44 items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt="Banner preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload image"}
                </Button>
                {image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setImage("")}
                  >
                    <X className="h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP or AVIF — up to 4 MB. Optional for announcement
                messages.
              </p>
              {uploadError && (
                <p className="text-xs text-destructive">{uploadError}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageManual">Or paste an image URL / filename</Label>
            <Input
              id="imageManual"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://… or hero-festive.webp"
            />
          </div>
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending || uploading}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
