import type { ReactNode } from "react";

type SidebarTooltipProps = {
  label: string;
  collapsed: boolean;
  children: ReactNode;
};

/**
 * Lightweight CSS tooltip shown only when the sidebar is collapsed.
 * Appears to the right of the icon on hover / focus-visible.
 */
export function SidebarTooltip({
  label,
  collapsed,
  children,
}: SidebarTooltipProps) {
  return (
    <span className="group/tip relative flex items-center">
      {children}
      {collapsed && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-50 opacity-0 shadow-lg transition-all duration-150 group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {label}
        </span>
      )}
    </span>
  );
}
