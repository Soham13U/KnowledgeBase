"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "text-sm transition-colors",
        active
          ? "text-zinc-900 dark:text-zinc-50"
          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-black/40">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Knowledge Base
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink href="/notes" label="Notes" />
          <NavLink href="/insights" label="Insights" />
        </nav>

        <ModeToggle />
      </div>
    </header>
  );
}
