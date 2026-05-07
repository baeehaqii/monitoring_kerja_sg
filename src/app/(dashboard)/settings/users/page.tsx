import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { UsersClient } from "@/components/UsersClient";
import { siproperFetch } from "@/lib/siproper-api";

type SiproperProyek = {
  id: number;
  nama_proyek: string;
  unit_bisnis: { unit_bisnis: string } | null;
  lgl_area: { area: string | null } | null;
};

function mapClusterType(unitBisnis: string): "GRAHA" | "GRIYA" | "SGM" {
  const u = unitBisnis.toLowerCase();
  if (u.includes("sapphire") && u.includes("graha")) return "GRAHA";
  if (u.includes("sapphire") && u.includes("griya")) return "GRIYA";
  return "SGM";
}

async function syncSiproperProjects(): Promise<void> {
  try {
    const res = await siproperFetch<{ data?: SiproperProyek[] } | SiproperProyek[]>("/api/proyek");
    const list: SiproperProyek[] = Array.isArray(res)
      ? res
      : ((res as { data?: SiproperProyek[] }).data ?? []);

    for (const p of list) {
      const unitBisnis = p.unit_bisnis?.unit_bisnis ?? "Lainnya";
      const area = p.lgl_area?.area ?? "";
      const clusterType = mapClusterType(unitBisnis);

      await prisma.project.upsert({
        where: { siproperProyekId: p.id },
        update: {
          name: p.nama_proyek,
          cluster: area,
          clusterType,
          unitBisnis,
        },
        create: {
          name: p.nama_proyek,
          cluster: area,
          clusterType,
          unitBisnis,
          siproperProyekId: p.id,
        },
      });
    }
  } catch {
    // Jika Siproper tidak tersedia, lanjutkan dengan data lokal
  }
}

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "SUPER_ADMIN") redirect("/");

  // Sync Siproper projects ke local DB (background, tidak blokir render)
  await syncSiproperProjects();

  const [users, divisions, projects] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        divisionId: true, whatsappNumber: true, createdAt: true,
        division: { select: { name: true } },
        userProjects: {
          select: {
            projectId: true,
            project: {
              select: {
                id: true, name: true, cluster: true,
                unitBisnis: true, siproperProyekId: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({
      where: { siproperProyekId: { not: null } },
      orderBy: [{ unitBisnis: "asc" }, { cluster: "asc" }, { name: "asc" }],
      select: {
        id: true, name: true, cluster: true,
        clusterType: true, unitBisnis: true, siproperProyekId: true,
      },
    }),
  ]);

  return (
    <div>
      <Header title="Manajemen Pengguna" subtitle="Kelola akun dan akses pengguna" />
      <UsersClient
        users={JSON.parse(JSON.stringify(users))}
        divisions={JSON.parse(JSON.stringify(divisions))}
        projects={JSON.parse(JSON.stringify(projects))}
        isSuperAdmin={session.user.role === "SUPER_ADMIN"}
      />
    </div>
  );
}
