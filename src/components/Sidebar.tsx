"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/nav-links";
import { SidebarTooltip } from "@/components/SidebarTooltip";

const STORAGE_KEY = "sidebar-collapsed";

function readCollapsed(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return null;
  } catch {
    return null;
  }
}

function writeCollapsed(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export function Sidebar() {
  // Default: expanded (false = not collapsed).
  // Lazy initializer reads localStorage; fallback = expanded.
  const [collapsed, setCollapsed] = useState(() => readCollapsed() ?? false);
  const pathname = usePathname();

  // Enable transition after first paint to prevent flash on hydration.
  // Uses ref callback + rAF to avoid setState inside useEffect.
  const hasEnabledTransition = useRef(false);
  const enableTransition = useCallback((node: HTMLElement | null) => {
    if (node && !hasEnabledTransition.current) {
      hasEnabledTransition.current = true;
      requestAnimationFrame(() => {
        node.style.transitionDuration = "200ms";
      });
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(next);
      return next;
    });
  }, []);

  return (
    <aside
      ref={enableTransition}
      data-testid="sidebar"
      aria-label="Main navigation"
      className={`flex h-screen flex-col border-r border-zinc-200 bg-white transition-[width] ease-in-out dark:border-zinc-800 dark:bg-zinc-950 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ minWidth: collapsed ? "4rem" : "15rem" }}
    >
      {/* Header: logo + toggle */}
      <div className="flex h-14 items-center border-b border-zinc-200 px-3 dark:border-zinc-800">
        <Link
          href="/"
          className={`overflow-hidden whitespace-nowrap text-sm font-semibold text-zinc-900 transition-all duration-200 dark:text-zinc-50 ${
            collapsed ? "w-0 opacity-0" : "mr-auto w-auto opacity-100"
          }`}
          tabIndex={collapsed ? -1 : 0}
          aria-hidden={collapsed}
        >
          GPRO Assistant
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          {collapsed ? (
            <Menu size={18} aria-hidden="true" />
          ) : (
            <X size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <SidebarTooltip key={href} label={label} collapsed={collapsed}>
              <Link
                href={href}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "border-l-2 border-zinc-900 bg-zinc-100 font-medium text-zinc-900 dark:border-zinc-50 dark:bg-zinc-800 dark:text-zinc-50"
                    : "border-l-2 border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} className="shrink-0" aria-hidden="true" />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  }`}
                  aria-hidden={collapsed}
                >
                  {label}
                </span>
              </Link>
            </SidebarTooltip>
          );
        })}
      </nav>
    </aside>
  );
}
