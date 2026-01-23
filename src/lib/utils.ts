import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInCalendarDays } from "date-fns";
import { ko } from "date-fns/locale";
import type { Currency } from "@/types/database";
import { CURRENCIES } from "./constants";

// Tailwind 클래스 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 금액 포맷팅
export function formatCurrency(amount: number, currency: Currency): string {
  const { symbol } = CURRENCIES[currency];

  if (currency === "KRW") {
    return `${symbol}${amount.toLocaleString("ko-KR")}`;
  }

  return `${symbol}${amount.toFixed(2)}`;
}

// 원화 환산 금액 포맷팅
export function formatKRW(amount: number): string {
  return `₩${Math.round(amount).toLocaleString("ko-KR")}`;
}

// 결제일까지 남은 일수 계산
export function getDaysUntilPayment(billingDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let paymentDate: Date;

  if (billingDay >= currentDay) {
    // 이번 달 결제일
    paymentDate = new Date(currentYear, currentMonth, billingDay);
  } else {
    // 다음 달 결제일
    paymentDate = new Date(currentYear, currentMonth + 1, billingDay);
  }

  return differenceInCalendarDays(paymentDate, today);
}

// D-Day 포맷팅
export function formatDDay(days: number): string {
  if (days === 0) return "D-Day";
  if (days < 0) return `D+${Math.abs(days)}`;
  return `D-${days}`;
}

// 날짜 포맷팅
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy년 M월 d일", { locale: ko });
}

// 결제일 텍스트
export function formatBillingDay(
  day: number,
  billingCycle: "MONTHLY" | "YEARLY" = "MONTHLY",
  billingMonth?: number | null
): string {
  if (billingCycle === "YEARLY" && billingMonth) {
    return `매년 ${billingMonth}월 ${day}일`;
  }
  if (billingCycle === "YEARLY") {
    return `연간 (${day}일)`;
  }
  return `매월 ${day}일`;
}

// 결제 주기 텍스트
export function formatBillingCycle(cycle: "MONTHLY" | "YEARLY"): string {
  return cycle === "MONTHLY" ? "월간" : "연간";
}
