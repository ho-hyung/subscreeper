import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Subscription, Currency } from "@/types/database";
import { CATEGORIES, CURRENCIES } from "@/lib/constants";
import { formatKRW, formatDDay } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface UpcomingPayment {
  subscription: Subscription;
  daysUntil: number;
  amountKRW: number;
}

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[];
}

export function UpcomingPayments({ payments }: UpcomingPaymentsProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            다가오는 결제
          </h2>
        </div>
        <EmptyState
          type="no-payments"
          action={{ label: "구독 추가하기", href: "/subscriptions/new" }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          다가오는 결제
        </h2>
        <Link
          href="/subscriptions"
          className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          전체 보기
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {payments.map(({ subscription, daysUntil, amountKRW }) => {
          const category =
            CATEGORIES[subscription.category as keyof typeof CATEGORIES];
          const currency = subscription.currency as Currency;

          return (
            <li key={subscription.id} className="p-4">
              <Link
                href={`/subscriptions/${subscription.id}`}
                className="flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 -m-2 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: category?.color || "#888" }}
                  >
                    {subscription.service_name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {subscription.service_name}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {category?.label || subscription.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {currency !== "KRW" && (
                      <span className="text-zinc-400 text-sm mr-1">
                        {CURRENCIES[currency]?.symbol}
                        {subscription.amount}
                      </span>
                    )}
                    {formatKRW(amountKRW)}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      daysUntil <= 3
                        ? "text-red-500"
                        : daysUntil <= 7
                          ? "text-amber-500"
                          : "text-zinc-500"
                    }`}
                  >
                    {formatDDay(daysUntil)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
