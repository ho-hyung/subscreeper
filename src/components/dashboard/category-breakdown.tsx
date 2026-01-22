import { TrendingUp } from "lucide-react";
import type { SubscriptionCategory } from "@/types/database";
import { CATEGORIES } from "@/lib/constants";
import { formatKRW } from "@/lib/utils";

interface CategoryBreakdownProps {
  categories: Array<{
    category: string;
    amount: number;
  }>;
  totalMonthly: number;
}

export function CategoryBreakdown({
  categories,
  totalMonthly,
}: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            카테고리별 지출
          </h2>
        </div>
        <div className="p-8 text-center text-zinc-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>지출 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          카테고리별 지출
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {categories.map(({ category, amount }) => {
          const percentage = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;
          const categoryInfo =
            CATEGORIES[category as SubscriptionCategory];

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryInfo?.color || "#888" }}
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {categoryInfo?.label || category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500">
                    {percentage.toFixed(1)}%
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {formatKRW(amount)}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: categoryInfo?.color || "#888",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
