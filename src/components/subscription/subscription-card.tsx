"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2, Pause, Play } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Subscription, Currency } from "@/types/database";
import { CATEGORIES } from "@/lib/constants";
import { formatKRW, formatCurrency, getDaysUntilPayment, formatDDay, formatBillingDay } from "@/lib/utils";
import { deleteSubscription, toggleSubscription } from "@/actions/subscriptions";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface SubscriptionCardProps {
  subscription: Subscription;
  exchangeRates: Record<string, number>;
}

export function SubscriptionCard({
  subscription,
  exchangeRates,
}: SubscriptionCardProps) {
  const router = useRouter();
  const toast = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const category = CATEGORIES[subscription.category as keyof typeof CATEGORIES];
  const daysUntil = getDaysUntilPayment(subscription.billing_day);

  const amountKRW =
    subscription.currency === "KRW"
      ? subscription.amount
      : subscription.amount * (exchangeRates[subscription.currency] || 1);

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const result = await deleteSubscription(subscription.id);

    if (!result.success) {
      toast.error(result.error || "삭제에 실패했습니다.");
      setDeleting(false);
      setShowDeleteModal(false);
      return;
    }

    toast.success(`${subscription.service_name} 구독이 삭제되었습니다.`);
    setShowDeleteModal(false);
    router.refresh();
  };

  const handleToggle = async () => {
    setShowMenu(false);
    setToggling(true);
    const newStatus = !subscription.is_active;
    const result = await toggleSubscription(subscription.id, newStatus);

    if (!result.success) {
      toast.error(result.error || "상태 변경에 실패했습니다.");
      setToggling(false);
      return;
    }

    toast.success(
      newStatus
        ? `${subscription.service_name} 구독이 활성화되었습니다.`
        : `${subscription.service_name} 구독이 일시정지되었습니다.`
    );
    setToggling(false);
    router.refresh();
  };

  return (
    <>
      <div className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 relative ${!subscription.is_active ? "opacity-60" : ""}`}>
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
                  onClick={handleToggle}
                  disabled={toggling}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  {subscription.is_active ? (
                    <>
                      <Pause className="w-4 h-4" />
                      일시정지
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      활성화
                    </>
                  )}
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
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
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {subscription.service_name}
                </h3>
                {!subscription.is_active && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded">
                    일시정지
                  </span>
                )}
              </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="구독 삭제"
        message={`"${subscription.service_name}" 구독을 삭제하시겠습니까? 삭제된 구독은 복구할 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
