"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import type { Subscription, NotificationLog } from "@/types/database";

export interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  todayNotifications: number;
  successfulNotifications: number;
  failedNotifications: number;
}

export interface UserWithSubscriptions {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  subscriptionCount: number;
  activeSubscriptionCount: number;
  totalMonthlyKRW: number;
  subscriptions: {
    service_name: string;
    amount: number;
    currency: string;
    is_active: boolean;
  }[];
}

export interface NotificationLogWithDetails extends NotificationLog {
  subscription?: {
    service_name: string;
    user_id: string;
  };
  user_email?: string;
}

export interface SubscriptionStats {
  totalCount: number;
  activeCount: number;
  byCategory: { category: string; count: number }[];
  byCurrency: { currency: string; count: number; totalAmount: number }[];
}

/**
 * 관리자 통계 조회
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    throw new Error("관리자 권한이 필요합니다.");
  }

  // 전체 구독 수
  const { count: totalSubscriptions } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true });

  // 활성 구독 수
  const { count: activeSubscriptions } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // 오늘 알림 수
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todayLogs } = await supabase
    .from("notification_logs")
    .select("status")
    .gte("sent_at", today.toISOString())
    .lt("sent_at", tomorrow.toISOString());

  const todayNotifications = todayLogs?.length || 0;
  const successfulNotifications =
    todayLogs?.filter((log) => log.status === "SUCCESS").length || 0;
  const failedNotifications =
    todayLogs?.filter((log) => log.status === "FAILED").length || 0;

  // 고유 사용자 수 (구독이 있는)
  const { data: uniqueUsers } = await supabase
    .from("subscriptions")
    .select("user_id");

  const totalUsers = new Set(uniqueUsers?.map((u) => u.user_id)).size;

  return {
    totalUsers,
    totalSubscriptions: totalSubscriptions || 0,
    activeSubscriptions: activeSubscriptions || 0,
    todayNotifications,
    successfulNotifications,
    failedNotifications,
  };
}

/**
 * 전체 사용자 목록 (구독 정보 포함)
 */
export async function getAllUsers(): Promise<UserWithSubscriptions[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    throw new Error("관리자 권한이 필요합니다.");
  }

  // Admin 클라이언트로 전체 사용자 목록 조회
  const adminClient = createAdminClient();
  const { data: authUsers, error: authError } =
    await adminClient.auth.admin.listUsers();

  if (authError) {
    throw new Error(authError.message);
  }

  // 모든 구독 조회
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // 환율 조회
  const { data: ratesData } = await supabase
    .from("exchange_rates")
    .select("currency, rate");

  const rates: Record<string, number> = { KRW: 1 };
  ratesData?.forEach((r) => {
    rates[r.currency] = Number(r.rate);
  });

  // 사용자별 구독 그룹화
  const subscriptionMap = new Map<string, Subscription[]>();
  for (const sub of subscriptions || []) {
    if (!subscriptionMap.has(sub.user_id)) {
      subscriptionMap.set(sub.user_id, []);
    }
    subscriptionMap.get(sub.user_id)!.push(sub as Subscription);
  }

  // 사용자 정보와 구독 정보 결합
  const users: UserWithSubscriptions[] = authUsers.users.map((authUser) => {
    const userSubs = subscriptionMap.get(authUser.id) || [];
    const activeSubs = userSubs.filter((s) => s.is_active);

    // 월별 총액 계산 (KRW 기준)
    let totalMonthlyKRW = 0;
    for (const sub of activeSubs) {
      const rate = rates[sub.currency] || 1;
      let monthlyAmount = Number(sub.amount);
      if (sub.billing_cycle === "YEARLY") {
        monthlyAmount = monthlyAmount / 12;
      }
      totalMonthlyKRW += monthlyAmount * rate;
    }

    return {
      id: authUser.id,
      email: authUser.email || "이메일 없음",
      name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || null,
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at || null,
      subscriptionCount: userSubs.length,
      activeSubscriptionCount: activeSubs.length,
      totalMonthlyKRW: Math.round(totalMonthlyKRW),
      subscriptions: userSubs.map((s) => ({
        service_name: s.service_name,
        amount: Number(s.amount),
        currency: s.currency,
        is_active: s.is_active,
      })),
    };
  });

  // 구독 수 기준 정렬
  return users.sort((a, b) => b.subscriptionCount - a.subscriptionCount);
}

/**
 * 전체 구독 통계
 */
export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    throw new Error("관리자 권한이 필요합니다.");
  }

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  const subs = subscriptions || [];
  const totalCount = subs.length;
  const activeCount = subs.filter((s) => s.is_active).length;

  // 카테고리별 통계
  const categoryMap = new Map<string, number>();
  for (const sub of subs) {
    const count = categoryMap.get(sub.category) || 0;
    categoryMap.set(sub.category, count + 1);
  }
  const byCategory = Array.from(categoryMap.entries()).map(
    ([category, count]) => ({
      category,
      count,
    })
  );

  // 통화별 통계
  const currencyMap = new Map<string, { count: number; totalAmount: number }>();
  for (const sub of subs.filter((s) => s.is_active)) {
    const current = currencyMap.get(sub.currency) || {
      count: 0,
      totalAmount: 0,
    };
    currencyMap.set(sub.currency, {
      count: current.count + 1,
      totalAmount: current.totalAmount + Number(sub.amount),
    });
  }
  const byCurrency = Array.from(currencyMap.entries()).map(
    ([currency, data]) => ({
      currency,
      count: data.count,
      totalAmount: data.totalAmount,
    })
  );

  return {
    totalCount,
    activeCount,
    byCategory,
    byCurrency,
  };
}

/**
 * 전체 알림 발송 이력
 */
export async function getAllNotificationLogs(
  limit = 100
): Promise<NotificationLogWithDetails[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    throw new Error("관리자 권한이 필요합니다.");
  }

  const { data: logs, error } = await supabase
    .from("notification_logs")
    .select(
      `
      *,
      subscription:subscriptions(service_name, user_id)
    `
    )
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (logs || []).map((log) => ({
    ...log,
    subscription: log.subscription
      ? {
          service_name: log.subscription.service_name,
          user_id: log.subscription.user_id,
        }
      : undefined,
  })) as NotificationLogWithDetails[];
}

/**
 * 전체 구독 목록 (관리자용)
 */
export async function getAllSubscriptionsAdmin(): Promise<Subscription[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    throw new Error("관리자 권한이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Subscription[];
}
