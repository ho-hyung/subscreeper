import Link from "next/link";
import { Plus, CreditCard, Search } from "lucide-react";
import { getSubscriptions, getExchangeRates } from "@/actions/subscriptions";
import { SubscriptionCard } from "@/components/subscription/subscription-card";

export default async function SubscriptionsPage() {
  const [subscriptions, exchangeRates] = await Promise.all([
    getSubscriptions(),
    getExchangeRates(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          구독 목록
        </h1>
        <Link
          href="/subscriptions/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          구독 추가
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            등록된 구독이 없습니다
          </h2>
          <p className="text-zinc-500 mb-6">
            첫 번째 구독을 추가하고 지출을 관리해보세요
          </p>
          <Link
            href="/subscriptions/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            첫 구독 추가하기
          </Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">
              총 <span className="font-medium text-zinc-900 dark:text-zinc-100">{subscriptions.length}개</span>의 활성 구독
            </p>
          </div>

          {/* Subscription Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                exchangeRates={exchangeRates}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
