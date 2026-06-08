import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/confirm-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBanner } from "./actions";

export const dynamic = "force-dynamic";

const PLACEMENT_LABEL: Record<string, string> = {
  HERO: "Hero carousel",
  ANNOUNCEMENT: "Announcement bar",
  PROMO: "Promo banners",
  FESTIVE: "Festive poster",
};

const PLACEMENT_ORDER = ["HERO", "ANNOUNCEMENT", "PROMO", "FESTIVE"] as const;

type BannerRow = {
  id: string;
  placement: string;
  title: string | null;
  sortOrder: number;
  active: boolean;
};

type BannerDelegate = {
  findMany: (args: {
    orderBy: Array<Record<string, "asc" | "desc">>;
  }) => Promise<BannerRow[]>;
};

export default async function BannersPage() {
  let banners: BannerRow[] = [];
  let needsMigration = false;

  try {
    const model = (prisma as unknown as { banner?: BannerDelegate }).banner;
    if (!model) {
      needsMigration = true;
    } else {
      banners = await model.findMany({
        orderBy: [
          { placement: "asc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      });
    }
  } catch {
    needsMigration = true;
  }

  const grouped = PLACEMENT_ORDER.map((placement) => ({
    placement,
    items: banners.filter((b) => b.placement === placement),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Banners</h1>
          <p className="text-muted-foreground">
            Manage the home page hero slides, announcement bar, and offer
            banners.
          </p>
        </div>
        {!needsMigration && (
          <Button
            render={<Link href="/admin/banners/new" />}
            nativeButton={false}
          >
            <Plus className="h-4 w-4" /> New banner
          </Button>
        )}
      </div>

      {needsMigration ? (
        <Card>
          <CardHeader>
            <CardTitle>One quick step to finish setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              The <code>Banner</code> table isn&apos;t in your database yet. Run
              the migration once to create it and regenerate the Prisma client:
            </p>
            <pre className="overflow-x-auto rounded-md border bg-muted/40 px-4 py-3 font-mono text-xs">
              npm run db:migrate
            </pre>
            <p className="text-muted-foreground">
              If it asks for a migration name, enter{" "}
              <code>add_banners</code>. Then restart the dev server and reload
              this page. Until then, the storefront shows built-in default
              banners automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Tip: if a section has no active banners, the site falls back to the
            built-in default content, so the home page never looks empty.
          </p>

          {grouped.map(({ placement, items }) => (
            <Card key={placement}>
              <CardHeader>
                <CardTitle>
                  {PLACEMENT_LABEL[placement]} ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No banners here yet — showing default content.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Order</TableHead>
                        <TableHead>Title / message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="text-muted-foreground">
                            {b.sortOrder}
                          </TableCell>
                          <TableCell className="font-medium">
                            {b.title}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                b.active
                                  ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                                  : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                              }
                            >
                              {b.active ? "Active" : "Hidden"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                render={
                                  <Link href={`/admin/banners/${b.id}`} />
                                }
                                nativeButton={false}
                                variant="outline"
                                size="sm"
                              >
                                Edit
                              </Button>
                              <form action={deleteBanner.bind(null, b.id)}>
                                <ConfirmButton
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  message="Delete this banner?"
                                >
                                  Delete
                                </ConfirmButton>
                              </form>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
