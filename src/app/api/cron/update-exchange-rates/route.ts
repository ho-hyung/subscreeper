import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchExchangeRatesAlternative } from "@/lib/exchange-rate";

// Vercel Cron Job에서 호출됨
// vercel.json에서 설정: "0 * * * *" (매시간)

export async function GET(request: Request) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // CRON_SECRET이 설정되어 있으면 인증 필요
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 환율 조회
    const rates = await fetchExchangeRatesAlternative();

    // Supabase 클라이언트 (서비스 롤 키 사용)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      // 서비스 키가 없으면 일반 키로 시도
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseAnonKey) {
        throw new Error("Supabase credentials not configured");
      }
    }

    const supabase = createClient(
      supabaseUrl!,
      supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
