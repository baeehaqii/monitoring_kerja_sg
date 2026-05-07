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

async function fetchSiproperProyek(): Promise<SiproperProyek[]> {
  const endpoints = ["/api/proyek", "/api/projects", "/api/project"];
  for (const ep of endpoints) {
    try {
      const res = await siproperFetch<{ data?: SiproperProyek[] } | SiproperProyek[]>(ep);
      return Array.isArray(res) ? res : ((res as { data?: SiproperProyek[] }).data ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("→ 5")) throw e;
    }
  }
  return [];
}

async function syncSiproperProjects(): Promise<void> {
  try {
    const list = await fetchSiproperProyek();

    for (const p of list) {
      const unitBisnis = p.unit_bisnis?.unit_bisnis ?? "Lainnya";
      const area = p.lgl_area?.area ?? "";
      const clusterType = mapClusterType(unitBisnis);

      // Cek apakah sudah ada by siproperProyekId
      const byId = await prisma.project.findUnique({ where: { siproperProyekId: p.id } });
      if (byId) {
        await prisma.project.update({
          where: { id: byId.id },
          data: { name: p.nama_proyek, cluster: area, clusterType, unitBisnis },
        });
        continue;
      }

      // Cek apakah sudah ada by nama (proyek manual sebelum sync)
      const byName = await prisma.project.findUnique({ where: { name: p.nama_proyek } });
      if (byName) {
        await prisma.project.update({
          where: { id: byName.id },
          data: { siproperProyekId: p.id, cluster: area, clusterType, unitBisnis },
        });
        continue;
      }

      await prisma.project.create({
        data: { name: p.nama_proyek, cluster: area, clusterType, unitBisnis, siproperProyekId: p.id },
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
