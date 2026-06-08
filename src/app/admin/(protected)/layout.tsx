import { requireSession } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./_components/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar email={session.email} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
