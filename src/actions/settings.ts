"use server";

import { createClient } from "@/lib/supabase/server";
import { sendTestEmail } from "@/lib/email";

export interface UserSettings {
  notificationEnabled: boolean;
  email: string;
  name: string;
}

/**
 * 사용자 설정 조회
 */
export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    notificationEnabled: user.user_metadata?.notification_enabled !== false,
    email: user.email || "",
    name: user.user_metadata?.name || "",
  };
}

/**
 * 알림 설정 업데이트
 */
export async function updateNotificationSettings(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: {
      notification_enabled: enabled,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 사용자 이름 업데이트
 */
export async function updateUserName(
  name: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: {
      name,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 테스트 이메일 발송
 */
export async function sendTestNotification(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: "이메일 주소를 찾을 수 없습니다." };
  }

  return sendTestEmail(user.email);
}

/**
 * 알림 이력 조회
 */
export async function getNotificationHistory(limit = 10) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // 사용자의 구독 ID 조회
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id, service_name")
    .eq("user_id", user.id);

  if (!subscriptions || subscriptions.length === 0) {
    return [];
  }

  const subscriptionIds = subscriptions.map((s) => s.id);
  const subscriptionMap = new Map(subscriptions.map((s) => [s.id, s.service_name]));

  // 알림 로그 조회
  const { data: logs } = await supabase
    .from("notification_logs")
    .select("*")
    .in("subscription_id", subscriptionIds)
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (!logs) {
    return [];
  }

  return logs.map((log) => ({
    ...log,
    service_name: subscriptionMap.get(log.subscription_id) || "Unknown",
  }));
}
