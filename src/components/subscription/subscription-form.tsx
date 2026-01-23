"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type {
  Subscription,
  CreateSubscriptionInput,
  SubscriptionCategory,
  BillingCycle,
  Currency,
} from "@/types/database";
import { CATEGORIES, CURRENCIES, POPULAR_SERVICES } from "@/lib/constants";
import { createSubscription, updateSubscription } from "@/actions/subscriptions";
import { useToast } from "@/components/ui/toast";

interface SubscriptionFormProps {
  subscription?: Subscription;
}

export function SubscriptionForm({ subscription }: SubscriptionFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEditing = !!subscription;

  const [serviceName, setServiceName] = useState(subscription?.service_name || "");
  const [amount, setAmount] = useState(subscription?.amount?.toString() || "");
  const [currency, setCurrency] = useState<Currency>(
    (subscription?.currency as Currency) || "KRW"
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    (subscription?.billing_cycle as BillingCycle) || "MONTHLY"
  );
  const [billingDay, setBillingDay] = useState(
    subscription?.billing_day?.toString() || "1"
  );
  const [billingMonth, setBillingMonth] = useState(
    subscription?.billing_month?.toString() || "1"
  );
  const [category, setCategory] = useState<SubscriptionCategory>(
    (subscription?.category as SubscriptionCategory) || "OTHER"
  );
  const [memo, setMemo] = useState(subscription?.memo || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePresetSelect = (preset: (typeof POPULAR_SERVICES)[0]) => {
    setServiceName(preset.name);
    setCategory(preset.category);
    setCurrency(preset.currency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!serviceName.trim()) {
      setError("서비스명을 입력해주세요.");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("올바른 금액을 입력해주세요.");
      return;
    }

    const billingDayNum = parseInt(billingDay);
    if (isNaN(billingDayNum) || billingDayNum < 1 || billingDayNum > 31) {
      setError("결제일은 1~31 사이의 숫자여야 합니다.");
      return;
    }

    let billingMonthNum: number | undefined;
    if (billingCycle === "YEARLY") {
      billingMonthNum = parseInt(billingMonth);
      if (isNaN(billingMonthNum) || billingMonthNum < 1 || billingMonthNum > 12) {
        setError("결제월은 1~12 사이의 숫자여야 합니다.");
        return;
      }
    }

    setLoading(true);

    const input: CreateSubscriptionInput = {
      service_name: serviceName.trim(),
      amount: amountNum,
      currency,
      billing_cycle: billingCycle,
      billing_day: billingDayNum,
      billing_month: billingMonthNum,
      category,
      memo: memo.trim() || undefined,
    };

    let result;

    if (isEditing) {
      result = await updateSubscription(subscription.id, input);
    } else {
      result = await createSubscription(input);
    }

    if (!result.success) {
      setError(result.error || "저장에 실패했습니다.");
      toast.error(result.error || "저장에 실패했습니다.");
      setLoading(false);
      return;
    }

    toast.success(
      isEditing
        ? `${serviceName} 구독이 수정되었습니다.`
        : `${serviceName} 구독이 추가되었습니다.`
    );
    router.push("/subscriptions");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Quick Presets */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          빠른 선택
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SERVICES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                serviceName === preset.name
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Service Name */}
      <div>
        <label
          htmlFor="serviceName"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          서비스명 *
        </label>
        <input
          id="serviceName"
          type="text"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="예: Netflix, Spotify"
          required
          className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Amount & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            금액 *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            required
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            통화 *
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {Object.entries(CURRENCIES).map(([key, { label, symbol }]) => (
              <option key={key} value={key}>
                {symbol} {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Billing Cycle & Day */}
      <div className={`grid gap-4 ${billingCycle === "YEARLY" ? "grid-cols-3" : "grid-cols-2"}`}>
        <div>
          <label
            htmlFor="billingCycle"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            결제 주기 *
          </label>
          <select
            id="billingCycle"
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="MONTHLY">월간</option>
            <option value="YEARLY">연간</option>
          </select>
        </div>
        {billingCycle === "YEARLY" && (
          <div>
            <label
              htmlFor="billingMonth"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              결제월 *
            </label>
            <select
              id="billingMonth"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label
            htmlFor="billingDay"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            결제일 *
          </label>
          <input
            id="billingDay"
            type="number"
            min="1"
            max="31"
            value={billingDay}
            onChange={(e) => setBillingDay(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          카테고리 *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
          className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Memo */}
      <div>
        <label
          htmlFor="memo"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          메모 (선택)
        </label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="결제 관련 메모를 입력하세요"
          rows={3}
          className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              저장 중...
            </>
          ) : isEditing ? (
            "수정하기"
          ) : (
            "추가하기"
          )}
        </button>
      </div>
    </form>
  );
}
