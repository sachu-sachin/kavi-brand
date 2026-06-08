import { Truck, BadgePercent, Sparkles, Leaf } from "lucide-react";
import { getBanners } from "@/lib/banners";

const ICONS = [BadgePercent, Truck, Leaf, Sparkles];

export async function AnnouncementBar() {
  const items = (await getBanners("ANNOUNCEMENT")).filter((b) => b.title);
  if (items.length === 0) return null;

  // Duplicate the list so the marquee loops seamlessly (animation shifts 50%).
  const loop = [...items, ...items];

  return (
    <div className="kavi-marquee overflow-hidden bg-brand-red text-white">
      <div className="kavi-marquee-track py-2">
        {loop.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <span
              key={`${item.id}-${i}`}
              className="mx-6 inline-flex items-center gap-2 text-xs font-medium tracking-wide"
            >
              <Icon className="h-3.5 w-3.5 text-brand-gold" />
              {item.title}
            </span>
          );
        })}
      </div>
    </div>
  );
}
