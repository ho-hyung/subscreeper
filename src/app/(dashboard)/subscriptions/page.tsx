import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllSubscriptions, getExchangeRates } from "@/actions/subscriptions";
import { SubscriptionList } from "@/components/subscriptions/subscription-list";

export default async function SubscriptionsPage() {
  const [subscriptions, exchangeRates] = await Promise.all([
    getAllSubscriptions(),
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

      <SubscriptionList
        subscriptions={subscriptions}
        exchangeRates={exchangeRates}
      />
    </div>
  );
}
