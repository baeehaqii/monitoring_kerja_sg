import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    divisionId?: string | null;
    divisionName?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      divisionId: string | null;
      divisionName: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    divisionId?: string | null;
    divisionName?: string | null;
  }
}
