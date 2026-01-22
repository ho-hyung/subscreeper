import type { ReactNode } from "react";

interface SummaryCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: string;
}

export function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  subValue,
  subValueColor = "text-zinc-500",
}: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          {subValue && (
            <p className={`text-xs mt-0.5 ${subValueColor}`}>{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}
