"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatKRW } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceIcon } from "@/components/ui/service-icon";
import { CATEGORIES } from "@/lib/constants";
import type { Subscription, Currency } from "@/types/database";

interface PaymentCalendarProps {
  subscriptions: Subscription[];
  exchangeRates: Record<string, number>;
}

interface PaymentItem {
  subscription: Subscription;
  day: number;
  amountKRW: number;
}

export function PaymentCalendar({ subscriptions, exchangeRates }: PaymentCalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const { payments, monthLabel, totalAmount } = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const targetMonth = targetDate.getMonth() + 1; // 1-12
    const targetYear = targetDate.getFullYear();

    const monthLabel = targetDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long"
    });

    const paymentList: PaymentItem[] = [];

    subscriptions.forEach((sub) => {
      if (!sub.is_active) return;

      const amountKRW =
        sub.currency === "KRW"
          ? sub.amount
          : sub.amount * (exchangeRates[sub.currency] || 1);

      if (sub.billing_cycle === "MONTHLY") {
        // 월간 구독: 매월 결제
        paymentList.push({
          subscription: sub,
          day: sub.billing_day,
          amountKRW,
        });
      } else if (sub.billing_cycle === "YEARLY") {
        // 연간 구독: billing_month가 해당 월인 경우만
        if (sub.billing_month === targetMonth) {
          paymentList.push({
            subscription: sub,
            day: sub.billing_day,
            amountKRW,
          });
        }
      }
    });

    // 날짜순 정렬
    paymentList.sort((a, b) => a.day - b.day);

    const totalAmount = paymentList.reduce((sum, p) => sum + p.amountKRW, 0);

    return { payments: paymentList, monthLabel, totalAmount };
  }, [subscriptions, exchangeRates, monthOffset]);

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            결제 캘린더
          </h3>
        </div>
        <EmptyState type="no-data" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      {/* Header with month navigation */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            결제 캘린더
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthOffset((prev) => prev - 1)}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-500" />
            </button>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[100px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={() => setMonthOffset((prev) => prev + 1)}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="다음 달"
            >
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment list */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500 text-sm">이 달에 예정된 결제가 없습니다</p>
          </div>
        ) : (
          payments.map((payment, index) => {
            const category = CATEGORIES[payment.subscription.category as keyof typeof CATEGORIES];
            const isToday = monthOffset === 0 && payment.day === new Date().getDate();
            const isPast = monthOffset === 0 && payment.day < new Date().getDate();

            return (
              <Link
                key={`${payment.subscription.id}-${index}`}
                href={`/subscriptions/${payment.subscription.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                  isPast ? "opacity-50" : ""
                }`}
              >
                {/* 날짜 */}
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                  isToday
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800"
                }`}>
                  <span className={`text-lg font-bold ${
                    isToday ? "text-white" : "text-zinc-900 dark:text-zinc-100"
                  }`}>
                    {payment.day}
                  </span>
                  <span className={`text-xs ${
                    isToday ? "text-emerald-100" : "text-zinc-500"
                  }`}>
                    일
                  </span>
                </div>

                {/* 서비스 정보 */}
                <div className="flex-1 flex items-center gap-3">
                  <ServiceIcon
                    serviceName={payment.subscription.service_name}
                    categoryColor={category?.color || "#888"}
                    size={36}
                  />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {payment.subscription.service_name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {payment.subscription.billing_cycle === "YEARLY" ? "연간 결제" : "월간 결제"}
                    </p>
                  </div>
                </div>

                {/* 금액 */}
                <div className="text-right">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatKRW(payment.amountKRW)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Total */}
      {payments.length > 0 && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 rounded-b-xl">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {monthLabel} 총 결제 예정
          </span>
          <span className="text-lg font-bold text-emerald-600">
            {formatKRW(totalAmount)}
          </span>
        </div>
      )}
    </div>
  );
}
