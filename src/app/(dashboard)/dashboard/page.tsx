import Link from "next/link";
import { CreditCard, TrendingUp, Calendar, Plus, Wallet } from "lucide-react";
import { getSubscriptions } from "@/actions/subscriptions";
import { getExchangeRatesWithAutoUpdate } from "@/actions/exchange-rate";
import { formatKRW, getDaysUntilPayment } from "@/lib/utils";
import { convertToKRW } from "@/lib/exchange-rate";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { ExchangeRateCard } from "@/components/dashboard/exchange-rate-card";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart";
import { PaymentCalendar } from "@/components/dashboard/payment-calendar";
import type { Currency } from "@/types/database";

export default async function DashboardPage() {
  const [subscriptions, exchangeData] = await Promise.all([
    getSubscriptions(),
    getExchangeRatesWithAutoUpdate(),
  ]);

  const { rates, updatedAt, isStale } = exchangeData;

  // 이번 달 총 예상 지출 (월간 기준)
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const amountKRW = convertToKRW(sub.amount, sub.currency as Currency, rates);
    return sum + (sub.billing_cycle === "YEARLY" ? amountKRW / 12 : amountKRW);
  }, 0);

  // 외화 결제 금액 (환율 적용)
  const foreignCurrencyTotal = subscriptions
    .filter((sub) => sub.currency !== "KRW")
    .reduce((sum, sub) => {
      const amountKRW = convertToKRW(sub.amount, sub.currency as Currency, rates);
      return sum + (sub.billing_cycle === "YEARLY" ? amountKRW / 12 : amountKRW);
    }, 0);

  // 다가오는 결제 (D-Day 순 정렬)
  const upcomingPayments = subscriptions
    .map((sub) => ({
      subscription: sub,
      daysUntil: getDaysUntilPayment(sub.billing_day, sub.billing_cycle, sub.billing_month),
      amountKRW: convertToKRW(sub.amount, sub.currency as Currency, rates),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  // 이번 주 결제 건수
  const thisWeekPayments = upcomingPayments.filter((p) => p.daysUntil <= 7);

  // 카테고리별 지출
  const categoryMap = subscriptions.reduce(
    (acc, sub) => {
      const amountKRW = convertToKRW(sub.amount, sub.currency as Currency, rates);
      const monthly = sub.billing_cycle === "YEARLY" ? amountKRW / 12 : amountKRW;
      acc[sub.category] = (acc[sub.category] || 0) + monthly;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedCategories = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            대시보드
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            구독 지출 현황을 한눈에 확인하세요
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          구독 추가
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Wallet className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          label="이번 달 예상 지출"
          value={formatKRW(totalMonthly)}
          subValue={
            foreignCurrencyTotal > 0
              ? `외화 결제 ${formatKRW(foreignCurrencyTotal)} 포함`
              : undefined
          }
        />

        <SummaryCard
          icon={<CreditCard className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          label="활성 구독"
          value={`${subscriptions.length}개`}
          subValue={
            subscriptions.filter((s) => s.currency !== "KRW").length > 0
              ? `외화 ${subscriptions.filter((s) => s.currency !== "KRW").length}개 포함`
              : undefined
          }
        />

        <SummaryCard
          icon={<Calendar className="w-6 h-6 text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          label="이번 주 결제"
          value={`${thisWeekPayments.length}건`}
          subValue={
            thisWeekPayments.length > 0
              ? formatKRW(thisWeekPayments.reduce((sum, p) => sum + p.amountKRW, 0))
              : undefined
          }
          subValueColor={thisWeekPayments.length > 0 ? "text-amber-600" : "text-zinc-500"}
        />

        <SummaryCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          label="연간 예상 지출"
          value={formatKRW(totalMonthly * 12)}
          subValue="월 평균 기준"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <CategoryDonutChart
          categories={sortedCategories}
          totalMonthly={totalMonthly}
        />
        <PaymentCalendar
          subscriptions={subscriptions}
          exchangeRates={rates}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingPayments payments={upcomingPayments} />
          <CategoryBreakdown
            categories={sortedCategories}
            totalMonthly={totalMonthly}
          />
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          <ExchangeRateCard
            rates={rates}
            updatedAt={updatedAt}
            isStale={isStale}
          />

          {/* Quick Stats */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              빠른 통계
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">가장 비싼 구독</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {subscriptions.length > 0
                    ? subscriptions.reduce((max, sub) => {
                        const maxKRW = convertToKRW(
                          max.amount,
                          max.currency as Currency,
                          rates
                        );
                        const subKRW = convertToKRW(
                          sub.amount,
                          sub.currency as Currency,
                          rates
                        );
                        return subKRW > maxKRW ? sub : max;
                      }).service_name
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">일 평균 지출</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatKRW(totalMonthly / 30)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">카테고리 수</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {sortedCategories.length}개
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
