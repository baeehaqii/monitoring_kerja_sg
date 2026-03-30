import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { UsersClient } from "@/components/UsersClient";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) redirect("/");

  const [users, divisions] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        divisionId: true, whatsappNumber: true, createdAt: true,
        division: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <Header title="Manajemen Pengguna" subtitle="Kelola akun dan akses pengguna" />
      <UsersClient users={JSON.parse(JSON.stringify(users))} divisions={JSON.parse(JSON.stringify(divisions))} isSuperAdmin={session.user.role === "SUPER_ADMIN"} />
    </div>
  );
}
