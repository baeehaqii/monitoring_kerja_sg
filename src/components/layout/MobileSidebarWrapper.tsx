"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

interface MobileSidebarWrapperProps {
  userRole?: string;
  userName?: string;
  userDivision?: string | null;
}

export function MobileSidebarWrapper({
  userRole,
  userName,
  userDivision,
}: MobileSidebarWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        className="lg:hidden size-10 flex items-center justify-center rounded-xl ring-1 ring-border hover:ring-primary transition-all duration-200 cursor-pointer bg-white"
      >
        <Menu className="size-5 text-foreground" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          userRole={userRole}
          userName={userName}
          userDivision={userDivision}
          isMobile
          onClose={() => setOpen(false)}
        />
      </div>
    </>
  );
}
