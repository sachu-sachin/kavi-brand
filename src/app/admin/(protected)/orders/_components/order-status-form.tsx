"use client";

import { useActionState } from "react";
import { OrderStatus } from "@/generated/prisma/enums";
import { updateOrderStatus, type OrderStatusState } from "../actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

const statuses = Object.values(OrderStatus);

export function OrderStatusForm({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [state, formAction, pending] = useActionState<
    OrderStatusState,
    FormData
  >(updateOrderStatus.bind(null, orderId), {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="status">Update status</Label>
        <select
          id="status"
          name="status"
          defaultValue={current}
          className={selectClass}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          name="note"
          rows={2}
          placeholder="e.g. Shipped via India Post, tracking 123..."
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-700">{state.success}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Update order"}
      </Button>
    </form>
  );
}
