import type { Currency } from "@/types/database";

// 기본 환율 (API 실패 시 폴백)
const DEFAULT_RATES: Record<Currency, number> = {
  KRW: 1,
  USD: 1350,
  JPY: 9,
  EUR: 1450,
};

interface FreeCurrencyApiResponse {
  date: string;
  usd: Record<string, number>;
}

/**
 * FreeCurrencyAPI에서 실시간 환율 조회
 * API 키 불필요, 매시간 업데이트, 주말에도 작동
 * https://github.com/fawazahmed0/currency-api
 */
export async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  try {
    const response = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      { next: { revalidate: 3600 } } // 1시간 캐싱
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: FreeCurrencyApiResponse = await response.json();
    const rates = data.usd;

    // USD 기준 환율 (1 USD = X KRW)
    const usdToKrw = rates.krw || DEFAULT_RATES.USD;

    return {
      KRW: 1,
      USD: Math.round(usdToKrw),
      JPY: rates.jpy ? Math.round((usdToKrw / rates.jpy) * 100) / 100 : DEFAULT_RATES.JPY,
      EUR: rates.eur ? Math.round(usdToKrw / rates.eur) : DEFAULT_RATES.EUR,
    };
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return DEFAULT_RATES;
  }
}

/**
 * Frankfurter API (폴백용)
 * ECB 기반, 주말 제외 매일 업데이트
 */
export async function fetchExchangeRatesAlternative(): Promise<Record<Currency, number>> {
  try {
    const response = await fetch(
      "https://api.frankfurter.app/latest?from=KRW&to=USD,JPY,EUR",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const rates = data.rates;

    return {
      KRW: 1,
      USD: rates.USD ? Math.round(1 / rates.USD) : DEFAULT_RATES.USD,
      JPY: rates.JPY ? Math.round((1 / rates.JPY) * 100) / 100 : DEFAULT_RATES.JPY,
      EUR: rates.EUR ? Math.round(1 / rates.EUR) : DEFAULT_RATES.EUR,
    };
  } catch (error) {
    console.error("Failed to fetch exchange rates (alternative):", error);
    return DEFAULT_RATES;
  }
}

/**
 * 원화 환산
 */
export function convertToKRW(
  amount: number,
  currency: Currency,
  rates: Record<Currency, number>
): number {
  if (currency === "KRW") return amount;
  return amount * (rates[currency] || DEFAULT_RATES[currency]);
}

/**
 * 환율 변동률 계산
 */
export function calculateRateChange(
  currentRate: number,
  previousRate: number
): { change: number; percentage: number } {
  const change = currentRate - previousRate;
  const percentage = previousRate > 0 ? (change / previousRate) * 100 : 0;
  return { change, percentage };
}
