"use client";

type ClientDateProps = {
  date: Date;
  className?: string;
  fallback?: React.ReactNode;
};

export function ClientDate({ date, className, fallback }: ClientDateProps) {
  if (!date) return <>{fallback}</>;
  return <span className={className}>{date.toLocaleString()}</span>;
}
