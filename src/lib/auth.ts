import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";

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

        // Autentikasi via sistem utama Siproper
        const authUrl = process.env.SIPROPER_AUTH_URL;
        if (!authUrl) throw new Error("SIPROPER_AUTH_URL not configured");

        let externalUser: { email: string; firstname: string; username: string } | null = null;
        try {
          const res = await fetch(authUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
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
        let user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { division: true },
        });

        if (!user) {
          const displayName = externalUser.firstname || externalUser.username || (credentials.email as string).split("@")[0];
          // Jika belum ada SUPER_ADMIN sama sekali, jadikan user pertama sebagai SUPER_ADMIN
          const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
          user = await prisma.user.create({
            data: {
              name: displayName,
              email: credentials.email as string,
              role: superAdminCount === 0 ? "SUPER_ADMIN" : "MEMBER",
            },
            include: { division: true },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
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
        token.divisionId = (user as { divisionId?: string | null }).divisionId;
        token.divisionName = (user as { divisionName?: string | null }).divisionName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.divisionId = token.divisionId as string | null;
        session.user.divisionName = token.divisionName as string | null;
      }
      return session;
    },
  },
});
