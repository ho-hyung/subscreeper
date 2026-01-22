"use client";

import { useMemo } from "react";
import { CATEGORIES } from "@/lib/constants";
import { formatKRW } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { SubscriptionCategory } from "@/types/database";

interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryDonutChartProps {
  categories: CategoryData[];
  totalMonthly: number;
}

export function CategoryDonutChart({ categories, totalMonthly }: CategoryDonutChartProps) {
  const chartData = useMemo(() => {
    if (totalMonthly === 0) return [];

    let currentAngle = 0;
    return categories.map((item) => {
      const percentage = (item.amount / totalMonthly) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      const categoryInfo = CATEGORIES[item.category as SubscriptionCategory];

      return {
        ...item,
        percentage,
        startAngle,
        endAngle: currentAngle,
        color: categoryInfo?.color || "#888",
        label: categoryInfo?.label || item.category,
      };
    });
  }, [categories, totalMonthly]);

  // SVG 도넛 차트를 위한 경로 계산
  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);

    const x3 = 50 + innerRadius * Math.cos(endRad);
    const y3 = 50 + innerRadius * Math.sin(endRad);
    const x4 = 50 + innerRadius * Math.cos(startRad);
    const y4 = 50 + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            카테고리별 지출 비율
          </h3>
        </div>
        <EmptyState type="no-data" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        카테고리별 지출 비율
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* 도넛 차트 */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {chartData.map((item, index) => (
              <path
                key={index}
                d={createArcPath(item.startAngle, item.endAngle, 45, 28)}
                fill={item.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </svg>
          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-zinc-500">총 지출</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatKRW(totalMonthly)}
            </span>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex-1 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-zinc-500 ml-2">
                  {formatKRW(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
