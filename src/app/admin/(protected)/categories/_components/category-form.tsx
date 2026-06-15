"use client";

import { useActionState, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import type { CategoryFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Action = (
  prev: CategoryFormState,
  formData: FormData,
) => Promise<CategoryFormState>;

function previewSrc(image: string): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  return `/categories/${image}`;
}

export function CategoryForm({
  action,
  defaultName = "",
  defaultImage = "",
  submitLabel,
}: {
  action: Action;
  defaultName?: string;
  defaultImage?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<
    CategoryFormState,
    FormData
  >(action, {});
  const [image, setImage] = useState(defaultImage);
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
      const res = await fetch("/api/admin/categories/upload", {
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
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="image" value={image} />

      <div className="space-y-2">
        <Label htmlFor="name">Category name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          placeholder="e.g. Spices & Masalas"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Category image</Label>
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt="Category preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
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
              <X className="h-4 w-4" /> Remove
            </Button>
          )}
        </div>
        {uploadError && (
          <p className="text-xs text-destructive">{uploadError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Optional — shows on the home page category cards. JPG, PNG or WEBP, up
          to 4 MB.
        </p>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending || uploading}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
