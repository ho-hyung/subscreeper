"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, ArrowUp, ArrowDown } from "lucide-react";
import type { Subscription, SubscriptionCategory, BillingCycle } from "@/types/database";
import { CATEGORIES } from "@/lib/constants";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDaysUntilPayment } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  exchangeRates: Record<string, number>;
}

type CategoryFilter = SubscriptionCategory | "ALL";
type CycleFilter = BillingCycle | "ALL";
type StatusFilter = "ALL" | "ACTIVE" | "PAUSED";
type SortField = "name" | "amount" | "billingDay" | "dDay";
type SortDirection = "asc" | "desc";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "이름순" },
  { value: "amount", label: "금액순" },
  { value: "billingDay", label: "결제일순" },
  { value: "dDay", label: "다가오는 결제순" },
];

export function SubscriptionList({ subscriptions, exchangeRates }: SubscriptionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("dDay");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // 금액을 원화로 계산하는 헬퍼 함수
  const getAmountInKRW = (sub: Subscription) => {
    if (sub.currency === "KRW") return sub.amount;
    return sub.amount * (exchangeRates[sub.currency] || 1);
  };

  const filteredAndSortedSubscriptions = useMemo(() => {
    // 필터링
    let result = subscriptions.filter((sub) => {
      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = sub.service_name.toLowerCase().includes(query);
        const matchesMemo = sub.memo?.toLowerCase().includes(query);
        if (!matchesName && !matchesMemo) return false;
      }

      // 카테고리 필터
      if (categoryFilter !== "ALL" && sub.category !== categoryFilter) {
        return false;
      }

      // 결제 주기 필터
      if (cycleFilter !== "ALL" && sub.billing_cycle !== cycleFilter) {
        return false;
      }

      // 상태 필터
      if (statusFilter === "ACTIVE" && !sub.is_active) {
        return false;
      }
      if (statusFilter === "PAUSED" && sub.is_active) {
        return false;
      }

      return true;
    });

    // 정렬
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.service_name.localeCompare(b.service_name, "ko");
          break;
        case "amount":
          comparison = getAmountInKRW(a) - getAmountInKRW(b);
          break;
        case "billingDay":
          comparison = a.billing_day - b.billing_day;
          break;
        case "dDay":
          comparison = getDaysUntilPayment(a.billing_day, a.billing_cycle, a.billing_month) - getDaysUntilPayment(b.billing_day, b.billing_cycle, b.billing_month);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [subscriptions, searchQuery, categoryFilter, cycleFilter, statusFilter, sortField, sortDirection, exchangeRates]);

  const hasActiveFilters = searchQuery || categoryFilter !== "ALL" || cycleFilter !== "ALL" || statusFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setCycleFilter("ALL");
    setStatusFilter("ALL");
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // 카테고리별 구독 수 계산
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: subscriptions.length };
    subscriptions.forEach((sub) => {
      counts[sub.category] = (counts[sub.category] || 0) + 1;
    });
    return counts;
  }, [subscriptions]);

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <EmptyState
          type="no-subscriptions"
          action={{ label: "첫 구독 추가하기", href: "/subscriptions/new" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 바 */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 검색 입력 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="구독 서비스 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 정렬 */}
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={toggleSortDirection}
              className="flex items-center justify-center w-10 h-10 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title={sortDirection === "asc" ? "오름차순" : "내림차순"}
            >
              {sortDirection === "asc" ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 필터 토글 버튼 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              showFilters || hasActiveFilters
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            )}
          >
            <Filter className="w-4 h-4" />
            필터
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* 확장된 필터 영역 */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-4">
            {/* 카테고리 필터 */}
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">카테고리</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter("ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    categoryFilter === "ALL"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  전체 ({categoryCounts.ALL})
                </button>
                {(Object.keys(CATEGORIES) as SubscriptionCategory[]).map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                        categoryFilter === cat
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      )}
                    >
                      {CATEGORIES[cat].label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 결제 주기 필터 */}
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">결제 주기</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCycleFilter("ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    cycleFilter === "ALL"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  전체
                </button>
                <button
                  onClick={() => setCycleFilter("MONTHLY")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    cycleFilter === "MONTHLY"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  월간
                </button>
                <button
                  onClick={() => setCycleFilter("YEARLY")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    cycleFilter === "YEARLY"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  연간
                </button>
              </div>
            </div>

            {/* 상태 필터 */}
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">상태</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    statusFilter === "ALL"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  전체
                </button>
                <button
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    statusFilter === "ACTIVE"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  활성
                </button>
                <button
                  onClick={() => setStatusFilter("PAUSED")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    statusFilter === "PAUSED"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  일시정지
                </button>
              </div>
            </div>

            {/* 필터 초기화 */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                필터 초기화
              </button>
            )}
          </div>
        )}
      </div>

      {/* 결과 요약 */}
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <p>
          {hasActiveFilters ? (
            <>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {filteredAndSortedSubscriptions.length}개
              </span>
              의 검색 결과
            </>
          ) : (
            <>
              총{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {subscriptions.length}개
              </span>
              의 구독
              {subscriptions.filter(s => !s.is_active).length > 0 && (
                <span className="text-zinc-400 ml-1">
                  (일시정지 {subscriptions.filter(s => !s.is_active).length}개 포함)
                </span>
              )}
            </>
          )}
        </p>
        <p className="text-xs">
          {SORT_OPTIONS.find((o) => o.value === sortField)?.label}{" "}
          {sortDirection === "asc" ? "↑" : "↓"}
        </p>
      </div>

      {/* 구독 목록 */}
      {filteredAndSortedSubscriptions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <EmptyState
            type="no-search-results"
            action={{ label: "필터 초기화", onClick: clearFilters }}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              exchangeRates={exchangeRates}
            />
          ))}
        </div>
      )}
    </div>
  );
}
