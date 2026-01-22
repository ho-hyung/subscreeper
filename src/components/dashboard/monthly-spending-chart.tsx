"use client";

import { useMemo } from "react";
import { formatKRW } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { Subscription, Currency } from "@/types/database";

interface MonthlySpendingChartProps {
  subscriptions: Subscription[];
  exchangeRates: Record<string, number>;
}

export function MonthlySpendingChart({ subscriptions, exchangeRates }: MonthlySpendingChartProps) {
  const monthlyData = useMemo(() => {
    const today = new Date();
    const months: { month: string; shortMonth: string; amount: number }[] = [];

    // 다음 6개월 예상 지출 계산
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = targetDate.toLocaleDateString("ko-KR", { month: "long" });
      const shortMonth = targetDate.toLocaleDateString("ko-KR", { month: "short" });

      let monthTotal = 0;

      subscriptions.forEach((sub) => {
        const amountKRW =
          sub.currency === "KRW"
            ? sub.amount
            : sub.amount * (exchangeRates[sub.currency] || 1);

        if (sub.billing_cycle === "MONTHLY") {
          // 월간 구독은 매월 포함
          monthTotal += amountKRW;
        } else if (sub.billing_cycle === "YEARLY") {
          // 연간 구독은 결제월에만 포함
          // billing_day를 결제월로 가정 (1-12)
          // 여기서는 간단하게 모든 연간 구독을 12로 나눠서 월 평균으로 표시
          monthTotal += amountKRW / 12;
        }
      });

      months.push({
        month: monthName,
        shortMonth: shortMonth.replace("월", ""),
        amount: monthTotal,
      });
    }

    return months;
  }, [subscriptions, exchangeRates]);

  const maxAmount = useMemo(() => {
    return Math.max(...monthlyData.map((m) => m.amount), 1);
  }, [monthlyData]);

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            월별 예상 지출
          </h3>
        </div>
        <EmptyState type="no-data" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          월별 예상 지출
        </h3>
        <span className="text-xs text-zinc-500">다음 6개월</span>
      </div>

      {/* 바 차트 */}
      <div className="space-y-3">
        {monthlyData.map((item, index) => {
          const percentage = (item.amount / maxAmount) * 100;
          const isCurrentMonth = index === 0;

          return (
            <div key={index} className="flex items-center gap-3">
              {/* 월 라벨 */}
              <div className="w-8 text-right">
                <span
                  className={`text-sm ${
                    isCurrentMonth
                      ? "font-semibold text-emerald-600"
                      : "text-zinc-500"
                  }`}
                >
                  {item.shortMonth}
                </span>
              </div>

              {/* 바 */}
              <div className="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all duration-500 ${
                    isCurrentMonth
                      ? "bg-emerald-500"
                      : "bg-emerald-400/70"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
                {/* 금액 표시 */}
                <div className="absolute inset-0 flex items-center px-3">
                  <span
                    className={`text-sm font-medium ${
                      percentage > 40
                        ? "text-white"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {formatKRW(item.amount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 평균 표시 */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-sm text-zinc-500">월 평균</span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {formatKRW(
            monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length
          )}
        </span>
      </div>
    </div>
  );
}
