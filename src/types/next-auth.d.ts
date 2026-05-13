import "next-auth";

export type MenuPermission = {
  menu: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

declare module "next-auth" {
  interface User {
    role?: string;
    customRoleName?: string | null;
    permissions?: MenuPermission[];
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
      customRoleName: string | null;
      permissions: MenuPermission[];
      divisionId: string | null;
      divisionName: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    customRoleName?: string | null;
    permissions?: MenuPermission[];
    divisionId?: string | null;
    divisionName?: string | null;
  }
}
