"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Subscription, Currency } from "@/types/database";
import { CATEGORIES, CURRENCIES } from "@/lib/constants";
import { formatKRW, formatCurrency, getDaysUntilPayment, formatDDay, formatBillingDay } from "@/lib/utils";
import { deleteSubscription } from "@/actions/subscriptions";

interface SubscriptionCardProps {
  subscription: Subscription;
  exchangeRates: Record<string, number>;
}

export function SubscriptionCard({
  subscription,
  exchangeRates,
}: SubscriptionCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const category = CATEGORIES[subscription.category as keyof typeof CATEGORIES];
  const daysUntil = getDaysUntilPayment(subscription.billing_day);

  const amountKRW =
    subscription.currency === "KRW"
      ? subscription.amount
      : subscription.amount * (exchangeRates[subscription.currency] || 1);

  const handleDelete = async () => {
    if (!confirm(`"${subscription.service_name}" 구독을 삭제하시겠습니까?`)) {
      return;
    }

    setDeleting(true);
    const result = await deleteSubscription(subscription.id);

    if (!result.success) {
      alert(result.error || "삭제에 실패했습니다.");
      setDeleting(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 relative">
      {/* Menu Button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-zinc-400" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg py-1">
              <Link
                href={`/subscriptions/${subscription.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Pencil className="w-4 h-4" />
                수정
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <Link href={`/subscriptions/${subscription.id}`} className="block">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: category?.color || "#888" }}
          >
            {subscription.service_name.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {subscription.service_name}
            </h3>
            <p className="text-sm text-zinc-500">{category?.label || subscription.category}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">금액</span>
            <div className="text-right">
              {subscription.currency !== "KRW" && (
                <span className="text-sm text-zinc-400 mr-1">
                  {formatCurrency(subscription.amount, subscription.currency as Currency)}
                </span>
              )}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatKRW(amountKRW)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">결제일</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {formatBillingDay(subscription.billing_day)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">다음 결제</span>
            <span
              className={`text-sm font-medium ${
                daysUntil <= 3
                  ? "text-red-500"
                  : daysUntil <= 7
                    ? "text-amber-500"
                    : "text-emerald-600"
              }`}
            >
              {formatDDay(daysUntil)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
