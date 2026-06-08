"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function StatusPoller({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    let attempts = 0;
    const id = setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 10) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [active, router]);

  return null;
}
