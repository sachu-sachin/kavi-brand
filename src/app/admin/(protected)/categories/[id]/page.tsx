import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryForm } from "../_components/category-form";
import { updateCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit category</h1>
        <Button
          render={<Link href="/admin/categories" />}
          nativeButton={false}
          variant="outline"
        >
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm
            action={updateCategory.bind(null, category.id)}
            defaultName={category.name}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
