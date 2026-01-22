import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchExchangeRatesAlternative } from "@/lib/exchange-rate";
import { verifyCronAuth, verifySupabaseServiceKey } from "@/lib/cron-auth";

// Vercel Cron Job에서 호출됨
// 현재 Hobby 플랜 제한으로 vercel.json에서 제외됨

export async function GET(request: Request) {
  // Cron 인증 검증
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  // Supabase 서비스 키 검증
  const supabaseResult = verifySupabaseServiceKey();
  if (!supabaseResult.valid) {
    return supabaseResult.error;
  }

  try {
    // 환율 조회
    const rates = await fetchExchangeRatesAlternative();

    const supabase = createClient(supabaseResult.url!, supabaseResult.serviceKey!);

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

    return NextResponse.json({
      success: true,
      rates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
