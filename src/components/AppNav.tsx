"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/driver", label: "Driver" },
  { href: "/car", label: "Car" },
  { href: "/fuel", label: "Fuel Consumption" },
  { href: "/tires", label: "Tire Wear" },
  { href: "/setup", label: "Car Setup" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 py-3 sm:gap-2">
        <Link
          href="/"
          className="mr-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          GPRO Assistant
        </Link>
        {links.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
