"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Customers", href: "/customers" },
  { label: "Services", href: "/services" },
  { label: "Bookings", href: "/bookings" },
  { label: "Employees", href: "/employees" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r bg-background h-full">
      <div className="px-6 py-5 border-b">
        <span className="text-base font-semibold tracking-tight">
          Booking System
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
