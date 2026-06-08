"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/cart-provider";
import { placeOrder } from "./actions";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const empty = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const { items, totalPrice, clear, hydrated } = useCart();
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  if (!hydrated) {
    return <div className="mx-auto max-w-md px-6 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add some products before checking out.
        </p>
        <Button
          className="mt-6 bg-brand-red text-white hover:bg-brand-red/90"
          render={<Link href="/products" />}
          nativeButton={false}
        >
          Shop products
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Could not load the payment gateway. Check your connection.");
      setLoading(false);
      return;
    }

    const result = await placeOrder({
      customer: { name: form.name, email: form.email, phone: form.phone },
      address: {
        line1: form.line1,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: result.keyId,
      amount: Math.round(result.amount * 100),
      currency: "INR",
      name: "Kavi Foods",
      description: `Order ${result.orderId.slice(0, 8)}`,
      order_id: result.razorpayOrderId,
      prefill: result.prefill,
      theme: { color: "#8B0000" },
      handler: () => {
        clear();
        router.push(`/checkout/success?orderId=${result.orderId}`);
      },
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.open();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h2 className="font-semibold">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={set("name")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={set("phone")} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="line1">Address</Label>
                <Input id="line1" value={form.line1} onChange={set("line1")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={set("city")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={form.state} onChange={set("state")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={set("pincode")}
                  required
                />
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-brand-red text-white hover:bg-brand-red/90 lg:w-auto"
          >
            {loading ? "Processing…" : `Pay ${formatINR(totalPrice)}`}
          </Button>
          <p className="text-xs text-muted-foreground">
            Secure payment via Razorpay (UPI, cards, net banking).
          </p>
        </form>

        <aside className="h-fit rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-2 text-sm">
                <span>
                  {i.productName}{" "}
                  <span className="text-muted-foreground">
                    ({i.unitLabel}) × {i.qty}
                  </span>
                </span>
                <span className="font-medium">{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatINR(totalPrice)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
