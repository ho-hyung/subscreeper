import type { Currency } from "@/types/database";

// 기본 환율 (API 실패 시 폴백)
const DEFAULT_RATES: Record<Currency, number> = {
  KRW: 1,
  USD: 1350,
  JPY: 9,
  EUR: 1450,
};

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

/**
 * ExchangeRate-API에서 실시간 환율 조회
 * 무료 플랜: 1,500 요청/월
 * https://www.exchangerate-api.com/
 */
export async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  // API 키가 없으면 기본 환율 반환
  if (!apiKey) {
    console.warn("EXCHANGE_RATE_API_KEY not set, using default rates");
    return DEFAULT_RATES;
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/KRW`,
      { next: { revalidate: 3600 } } // 1시간 캐싱
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ExchangeRateResponse = await response.json();

    if (data.result !== "success") {
      throw new Error("API returned error");
    }

    // KRW 기준 환율로 변환 (1 외화 = X KRW)
    const rates = data.conversion_rates;

    return {
      KRW: 1,
      USD: rates.USD ? Math.round(1 / rates.USD) : DEFAULT_RATES.USD,
      JPY: rates.JPY ? Math.round((1 / rates.JPY) * 100) / 100 : DEFAULT_RATES.JPY,
      EUR: rates.EUR ? Math.round(1 / rates.EUR) : DEFAULT_RATES.EUR,
    };
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return DEFAULT_RATES;
  }
}

/**
 * Open Exchange Rates API (대안)
 * 무료 플랜: 1,000 요청/월
 */
export async function fetchExchangeRatesAlternative(): Promise<Record<Currency, number>> {
  try {
    // 무료 API (frankfurter.app) - API 키 불필요
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
