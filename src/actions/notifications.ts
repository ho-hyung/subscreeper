"use server";

import { createClient } from "@/lib/supabase/server";
import { sendPaymentReminder, type PaymentReminderData } from "@/lib/email";
import { getExchangeRates } from "@/actions/exchange-rate";
import { convertToKRW } from "@/lib/exchange-rate";
import { formatKRW, formatCurrency, getDaysUntilPayment } from "@/lib/utils";
import { CATEGORIES, CURRENCIES } from "@/lib/constants";
import type { Currency, NotificationType, Subscription } from "@/types/database";

interface NotificationResult {
  subscriptionId: string;
  serviceName: string;
  type: NotificationType;
  success: boolean;
  error?: string;
}

/**
 * D-3, D-1 결제 예정 구독 조회
 */
export async function getUpcomingPaymentSubscriptions(): Promise<{
  d3: Subscription[];
  d1: Subscription[];
}> {
  const supabase = await createClient();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*, users:user_id(email, raw_user_meta_data)")
    .eq("is_active", true);

  if (error || !subscriptions) {
    console.error("Failed to fetch subscriptions:", error);
    return { d3: [], d1: [] };
  }

  const d3: Subscription[] = [];
  const d1: Subscription[] = [];

  for (const sub of subscriptions) {
    const daysUntil = getDaysUntilPayment(sub.billing_day);

    if (daysUntil === 3) {
      d3.push(sub as Subscription);
    } else if (daysUntil === 1) {
      d1.push(sub as Subscription);
    }
  }

  return { d3, d1 };
}

/**
 * 이미 발송된 알림인지 확인
 */
export async function hasNotificationBeenSent(
  subscriptionId: string,
  type: NotificationType,
  date: Date = new Date()
): Promise<boolean> {
  const supabase = await createClient();

  // 오늘 날짜의 시작과 끝
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("notification_logs")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .eq("notification_type", type)
    .eq("status", "SUCCESS")
    .gte("sent_at", startOfDay.toISOString())
    .lte("sent_at", endOfDay.toISOString())
    .limit(1);

  if (error) {
    console.error("Failed to check notification log:", error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * 알림 로그 저장
 */
export async function saveNotificationLog(
  subscriptionId: string,
  type: NotificationType,
  status: "SUCCESS" | "FAILED"
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("notification_logs").insert({
    subscription_id: subscriptionId,
    notification_type: type,
    status,
    sent_at: new Date().toISOString(),
  });
}

/**
 * 단일 구독에 대한 알림 발송
 */
export async function sendSubscriptionNotification(
  subscription: Subscription & { users?: { email: string; raw_user_meta_data?: { name?: string } } },
  type: NotificationType,
  rates: Record<Currency, number>
): Promise<NotificationResult> {
  const result: NotificationResult = {
    subscriptionId: subscription.id,
    serviceName: subscription.service_name,
    type,
    success: false,
  };

  try {
    // 이미 발송된 알림인지 확인
    const alreadySent = await hasNotificationBeenSent(subscription.id, type);
    if (alreadySent) {
      result.success = true;
      result.error = "Already sent today";
      return result;
    }

    // 사용자 정보
    const userEmail = subscription.users?.email;
    if (!userEmail) {
      result.error = "User email not found";
      await saveNotificationLog(subscription.id, type, "FAILED");
      return result;
    }

    const userName = subscription.users?.raw_user_meta_data?.name || userEmail.split("@")[0];

    // 금액 계산
    const currency = subscription.currency as Currency;
    const amountKRW = convertToKRW(subscription.amount, currency, rates);
    const daysUntil = getDaysUntilPayment(subscription.billing_day);

    const categoryInfo = CATEGORIES[subscription.category as keyof typeof CATEGORIES];

    const emailData: PaymentReminderData = {
      userName,
      userEmail,
      serviceName: subscription.service_name,
      amount:
        currency === "KRW"
          ? formatKRW(subscription.amount)
          : formatCurrency(subscription.amount, currency),
      amountKRW: formatKRW(amountKRW),
      billingDay: subscription.billing_day,
      daysUntil,
      category: categoryInfo?.label || subscription.category,
    };

    // 이메일 발송
    const sendResult = await sendPaymentReminder(emailData);

    if (sendResult.success) {
      await saveNotificationLog(subscription.id, type, "SUCCESS");
      result.success = true;
    } else {
      await saveNotificationLog(subscription.id, type, "FAILED");
      result.error = sendResult.error;
    }

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Unknown error";
    await saveNotificationLog(subscription.id, type, "FAILED");
    return result;
  }
}

/**
 * 모든 예정 알림 발송 (Cron Job에서 호출)
 */
export async function processAllNotifications(): Promise<{
  processed: number;
  success: number;
  failed: number;
  results: NotificationResult[];
}> {
  const results: NotificationResult[] = [];
  let success = 0;
  let failed = 0;

  // 환율 조회
  const exchangeData = await getExchangeRates();
  const rates = exchangeData.rates;

  // Supabase 클라이언트 (사용자 정보 포함 조회)
  const supabase = await createClient();

  // 모든 활성 구독 조회 (사용자 정보 포함)
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("is_active", true);

  if (error || !subscriptions) {
    console.error("Failed to fetch subscriptions:", error);
    return { processed: 0, success: 0, failed: 0, results: [] };
  }

  // 각 구독에 대해 D-3, D-1 확인 및 알림 발송
  for (const sub of subscriptions) {
    const daysUntil = getDaysUntilPayment(sub.billing_day);

    // 사용자 정보 별도 조회
    const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id);

    const subscriptionWithUser = {
      ...sub,
      users: userData?.user
        ? {
            email: userData.user.email!,
            raw_user_meta_data: userData.user.user_metadata,
          }
        : undefined,
    };

    if (daysUntil === 3) {
      const result = await sendSubscriptionNotification(
        subscriptionWithUser as Subscription & { users?: { email: string; raw_user_meta_data?: { name?: string } } },
        "D_3",
        rates
      );
      results.push(result);
      if (result.success) success++;
      else failed++;
    }

    if (daysUntil === 1) {
      const result = await sendSubscriptionNotification(
        subscriptionWithUser as Subscription & { users?: { email: string; raw_user_meta_data?: { name?: string } } },
        "D_1",
        rates
      );
      results.push(result);
      if (result.success) success++;
      else failed++;
    }
  }

  return {
    processed: results.length,
    success,
    failed,
    results,
  };
}
