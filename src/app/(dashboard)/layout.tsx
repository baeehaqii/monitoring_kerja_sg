import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebarWrapper } from "@/components/layout/MobileSidebarWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sidebarProps = {
    userRole: session.user.role,
    userName: session.user.name ?? undefined,
    userDivision: session.user.divisionName,
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-muted">
      <div className="hidden lg:flex">
        <Sidebar {...sidebarProps} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden bg-pattern">
        <div className="lg:hidden flex items-center gap-3 px-4 h-[60px] bg-white border-b border-border shrink-0">
          <MobileSidebarWrapper {...sidebarProps} />
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-6 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <p className="font-semibold text-sm text-foreground truncate">Sapphire Grup</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
