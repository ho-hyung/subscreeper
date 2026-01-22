import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPaymentReminder, type PaymentReminderData } from "@/lib/email";
import { fetchExchangeRatesAlternative, convertToKRW } from "@/lib/exchange-rate";
import { formatKRW, formatCurrency, getDaysUntilPayment } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { verifyCronAuth, verifySupabaseServiceKey } from "@/lib/cron-auth";
import type { Currency, NotificationType } from "@/types/database";

// Vercel Cron Job에서 매일 오전 9시(KST)에 호출
// vercel.json: "0 0 * * *" (UTC 00:00 = KST 09:00)

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

  const supabase = createClient(supabaseResult.url!, supabaseResult.serviceKey!);

  try {
    // 환율 조회
    const rates = await fetchExchangeRatesAlternative();

    // 모든 활성 구독 조회
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("is_active", true);

    if (subError || !subscriptions) {
      throw new Error("Failed to fetch subscriptions");
    }

    const results: Array<{
      subscriptionId: string;
      serviceName: string;
      type: NotificationType;
      success: boolean;
      error?: string;
    }> = [];

    let success = 0;
    let failed = 0;

    // 각 구독 처리
    for (const sub of subscriptions) {
      const daysUntil = getDaysUntilPayment(sub.billing_day);

      // D-3 또는 D-1인 경우에만 처리
      if (daysUntil !== 3 && daysUntil !== 1) continue;

      const notificationType: NotificationType = daysUntil === 3 ? "D_3" : "D_1";

      // 오늘 이미 발송했는지 확인
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: existingLog } = await supabase
        .from("notification_logs")
        .select("id")
        .eq("subscription_id", sub.id)
        .eq("notification_type", notificationType)
        .eq("status", "SUCCESS")
        .gte("sent_at", startOfDay)
        .lte("sent_at", endOfDay)
        .limit(1);

      if (existingLog && existingLog.length > 0) {
        results.push({
          subscriptionId: sub.id,
          serviceName: sub.service_name,
          type: notificationType,
          success: true,
          error: "Already sent today",
        });
        continue;
      }

      // 사용자 정보 조회
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        sub.user_id
      );

      if (userError || !userData?.user?.email) {
        results.push({
          subscriptionId: sub.id,
          serviceName: sub.service_name,
          type: notificationType,
          success: false,
          error: "User not found",
        });
        failed++;

        // 실패 로그 저장
        await supabase.from("notification_logs").insert({
          subscription_id: sub.id,
          notification_type: notificationType,
          status: "FAILED",
          sent_at: new Date().toISOString(),
        });

        continue;
      }

      const userEmail = userData.user.email;
      const userName = userData.user.user_metadata?.name || userEmail.split("@")[0];

      // 금액 계산
      const currency = sub.currency as Currency;
      const amountKRW = convertToKRW(sub.amount, currency, rates);
      const categoryInfo = CATEGORIES[sub.category as keyof typeof CATEGORIES];

      const emailData: PaymentReminderData = {
        userName,
        userEmail,
        serviceName: sub.service_name,
        amount:
          currency === "KRW"
            ? formatKRW(sub.amount)
            : formatCurrency(sub.amount, currency),
        amountKRW: formatKRW(amountKRW),
        billingDay: sub.billing_day,
        daysUntil,
        category: categoryInfo?.label || sub.category,
      };

      // 이메일 발송
      const sendResult = await sendPaymentReminder(emailData);

      // 로그 저장
      await supabase.from("notification_logs").insert({
        subscription_id: sub.id,
        notification_type: notificationType,
        status: sendResult.success ? "SUCCESS" : "FAILED",
        sent_at: new Date().toISOString(),
      });

      results.push({
        subscriptionId: sub.id,
        serviceName: sub.service_name,
        type: notificationType,
        success: sendResult.success,
        error: sendResult.error,
      });

      if (sendResult.success) {
        success++;
      } else {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      sent: success,
      failed,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Notification cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
