"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchExchangeRatesAlternative } from "@/lib/exchange-rate";
import type { Currency } from "@/types/database";

export interface ExchangeRateData {
  rates: Record<Currency, number>;
  updatedAt: string;
  isStale: boolean;
}

/**
 * Supabase에서 캐시된 환율 조회
 */
export async function getExchangeRates(): Promise<ExchangeRateData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("currency, rate, updated_at")
    .order("updated_at", { ascending: false });

  if (error || !data || data.length === 0) {
    // DB에 데이터가 없으면 기본값 반환
    return {
      rates: { KRW: 1, USD: 1350, JPY: 9, EUR: 1450 },
      updatedAt: new Date().toISOString(),
      isStale: true,
    };
  }

  const rates: Record<string, number> = {};
  let latestUpdate = "";

  for (const row of data) {
    rates[row.currency] = Number(row.rate);
    if (!latestUpdate || row.updated_at > latestUpdate) {
      latestUpdate = row.updated_at;
    }
  }

  // 1시간 이상 지났으면 stale 표시
  const updatedTime = new Date(latestUpdate).getTime();
  const now = Date.now();
  const isStale = now - updatedTime > 60 * 60 * 1000;

  return {
    rates: rates as Record<Currency, number>,
    updatedAt: latestUpdate,
    isStale,
  };
}

/**
 * 환율 업데이트 (API 호출 → DB 저장)
 */
export async function updateExchangeRates(): Promise<{
  success: boolean;
  rates?: Record<Currency, number>;
  error?: string;
}> {
  try {
    // 외부 API에서 환율 조회
    const rates = await fetchExchangeRatesAlternative();

    const supabase = await createClient();

    // DB 업데이트
    const updates = Object.entries(rates).map(([currency, rate]) => ({
      currency,
      rate,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("exchange_rates")
        .upsert(update, { onConflict: "currency" });

      if (error) {
        console.error(`Failed to update ${update.currency}:`, error);
      }
    }

    return { success: true, rates };
  } catch (error) {
    console.error("Failed to update exchange rates:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 환율이 오래됐으면 자동 업데이트
 */
export async function getExchangeRatesWithAutoUpdate(): Promise<ExchangeRateData> {
  const data = await getExchangeRates();

  // 1시간 이상 지났으면 백그라운드에서 업데이트
  if (data.isStale) {
    // 비동기로 업데이트 (응답을 기다리지 않음)
    updateExchangeRates().catch(console.error);
  }

  return data;
}
