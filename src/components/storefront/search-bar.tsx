"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({
  className,
  autoFocus,
  defaultValue = "",
}: {
  className?: string;
  autoFocus?: boolean;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search spices, oils, nuts, dates..."
          className="h-10 w-full rounded-full border bg-background pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        />
      </div>
    </form>
  );
}
