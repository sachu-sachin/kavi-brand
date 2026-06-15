import Link from "next/link";
import { ImageIcon } from "lucide-react";
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
import { CategoryForm } from "./_components/category-form";
import { createCategory, deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

function thumbSrc(image: string | null | undefined): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  return `/categories/${image}`;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-muted-foreground">Organise your product catalogue.</p>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm action={createCategory} submitLabel="Add category" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => {
                  const src = thumbSrc(
                    (c as { image?: string | null }).image,
                  );
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={src}
                              alt={c.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {c.slug}
                      </TableCell>
                      <TableCell className="text-right">
                        {c._count.products}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            render={<Link href={`/admin/categories/${c.id}`} />}
                            nativeButton={false}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <form action={deleteCategory.bind(null, c.id)}>
                            <ConfirmButton
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              message={`Delete category "${c.name}"?`}
                            >
                              Delete
                            </ConfirmButton>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
