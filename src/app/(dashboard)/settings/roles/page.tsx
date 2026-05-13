import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { RolesClient } from "@/components/RolesClient";

export default async function RolesPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "SUPER_ADMIN") redirect("/");

  const roles = await prisma.role.findMany({
    include: {
      permissions: { orderBy: { menu: "asc" } },
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <Header
        title="Manajemen Role"
        subtitle="Kelola role dan hak akses menu untuk setiap pengguna"
      />
      <RolesClient roles={JSON.parse(JSON.stringify(roles))} />
    </div>
  );
}
