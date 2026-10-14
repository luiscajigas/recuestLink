"use client";

import { CirclePlus, HeartPulse, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/emergencias", label: "Emergencias", icon: ListChecks },
  { href: "/emergencias/nueva", label: "Nueva emergencia", icon: CirclePlus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-blue-950 text-white md:min-h-screen md:w-64 md:shrink-0">
      <div className="flex items-center gap-2 px-5 py-4 md:py-6">
        <HeartPulse className="h-7 w-7 text-red-500" aria-hidden />
        <span className="text-xl font-semibold">RescueLink</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? "bg-white/15" : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
