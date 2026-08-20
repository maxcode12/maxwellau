import type { Metadata } from "next";
import { requireUser } from "@/modules/auth/guards";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Maxwell AU Admin" },
  robots: { index: false, follow: false },
};

/** Every admin page renders inside this guard — no session, no render. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return <AdminShell user={user}>{children}</AdminShell>;
}
