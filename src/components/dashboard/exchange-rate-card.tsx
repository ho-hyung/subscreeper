"use client";

import { useState } from "react";
import { RefreshCw, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Currency } from "@/types/database";
import { CURRENCIES } from "@/lib/constants";
import { updateExchangeRates } from "@/actions/exchange-rate";

interface ExchangeRateCardProps {
  rates: Record<Currency, number>;
  updatedAt: string;
  isStale: boolean;
}

export function ExchangeRateCard({
  rates,
  updatedAt,
  isStale,
}: ExchangeRateCardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [currentRates, setCurrentRates] = useState(rates);
  const [lastUpdated, setLastUpdated] = useState(updatedAt);

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await updateExchangeRates();

    if (result.success && result.rates) {
      setCurrentRates(result.rates);
      setLastUpdated(new Date().toISOString());
    }

    setRefreshing(false);
  };

  const timeAgo = formatDistanceToNow(new Date(lastUpdated), {
    addSuffix: true,
    locale: ko,
  });

  const currencies: Currency[] = ["USD", "JPY", "EUR"];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            실시간 환율
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          title="환율 새로고침"
        >
          <RefreshCw
            className={`w-4 h-4 text-zinc-500 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-3">
        {currencies.map((currency) => (
          <div
            key={currency}
            className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                {CURRENCIES[currency].symbol}
              </span>
              <span className="text-sm text-zinc-500">
                {CURRENCIES[currency].label}
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                ₩{currentRates[currency]?.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 ml-1">
                / 1{CURRENCIES[currency].symbol}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mt-3 text-xs text-zinc-400">
        <Clock className="w-3 h-3" />
        <span>{timeAgo} 업데이트</span>
        {isStale && (
          <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded">
            갱신 필요
          </span>
        )}
      </div>
    </div>
  );
}
