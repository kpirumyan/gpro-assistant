import type { ReactNode } from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

type PageShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {children ? (
        <div className="mt-8">
          <Suspense
            fallback={
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
