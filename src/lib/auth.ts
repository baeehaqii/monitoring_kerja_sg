import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import type { MenuPermission } from "@/types/next-auth";

async function fetchUserPermissions(customRoleId: string | null | undefined): Promise<MenuPermission[]> {
  if (!customRoleId) return [];
  const perms = await prisma.rolePermission.findMany({
    where: { roleId: customRoleId },
    select: { menu: true, canView: true, canCreate: true, canEdit: true, canDelete: true },
  });
  return perms;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Cek user di DB lokal terlebih dahulu
        const localUser = await prisma.user.findUnique({
          where: { email },
          include: { division: true, customRole: true },
        });

        // Jika user punya password lokal → verifikasi langsung tanpa external API
        if (localUser?.password) {
          const valid = await compare(password, localUser.password);
          if (!valid) return null;
          const permissions = await fetchUserPermissions(localUser.customRoleId);
          return {
            id: localUser.id,
            name: localUser.name,
            email: localUser.email,
            role: localUser.role,
            customRoleName: localUser.customRole?.name ?? null,
            permissions,
            divisionId: localUser.divisionId,
            divisionName: localUser.division?.name ?? null,
          };
        }

        // Fallback: autentikasi via sistem utama Siproper
        const authUrl = process.env.SIPROPER_AUTH_URL;
        if (!authUrl) throw new Error("SIPROPER_AUTH_URL not configured");

        let externalUser: { email: string; firstname: string; username: string } | null = null;
        try {
          const res = await fetch(authUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const json = await res.json();
          if (!res.ok || json?.status !== "success") return null;
          externalUser = json.data?.user ?? null;
        } catch (err) {
          console.error("[auth] external API error:", err);
          return null;
        }

        if (!externalUser) return null;

        // Ambil atau buat user di DB lokal
        let user = localUser;
        if (!user) {
          const displayName = externalUser.firstname || externalUser.username || email.split("@")[0];
          const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
          user = await prisma.user.create({
            data: {
              name: displayName,
              email,
              role: superAdminCount === 0 ? "SUPER_ADMIN" : "MEMBER",
            },
            include: { division: true, customRole: true },
          });
        }

        const permissions = await fetchUserPermissions(user.customRoleId);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          customRoleName: (user as typeof user & { customRole?: { name: string } | null }).customRole?.name ?? null,
          permissions,
          divisionId: user.divisionId,
          divisionName: user.division?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.customRoleName = (user as { customRoleName?: string | null }).customRoleName ?? null;
        token.permissions = (user as { permissions?: MenuPermission[] }).permissions ?? [];
        token.divisionId = (user as { divisionId?: string | null }).divisionId;
        token.divisionName = (user as { divisionName?: string | null }).divisionName;
      } else if (token.id) {
        // Refresh dari DB setiap token refresh agar perubahan role langsung efektif
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true, divisionId: true, customRoleId: true,
            division: { select: { name: true } },
            customRole: { select: { name: true } },
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.customRoleName = dbUser.customRole?.name ?? null;
          token.permissions = await fetchUserPermissions(dbUser.customRoleId);
          token.divisionId = dbUser.divisionId;
          token.divisionName = dbUser.division?.name ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.customRoleName = token.customRoleName as string | null;
        session.user.permissions = (token.permissions as MenuPermission[]) ?? [];
        session.user.divisionId = token.divisionId as string | null;
        session.user.divisionName = token.divisionName as string | null;
      }
      return session;
    },
  },
});
