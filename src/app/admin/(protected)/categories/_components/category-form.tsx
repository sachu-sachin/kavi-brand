"use client";

import { useActionState } from "react";
import type { CategoryFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Action = (
  prev: CategoryFormState,
  formData: FormData,
) => Promise<CategoryFormState>;

export function CategoryForm({
  action,
  defaultName = "",
  submitLabel,
}: {
  action: Action;
  defaultName?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<
    CategoryFormState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex-1 space-y-2">
        <Label htmlFor="name">Category name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          placeholder="e.g. Spices & Masalas"
          required
        />
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
