"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from "@/types/database";

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("인증이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("billing_day", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Subscription[];
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("인증이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("is_active", { ascending: false })
    .order("billing_day", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Subscription[];
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("인증이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(error.message);
  }

  return data as Subscription;
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    service_name: input.service_name,
    amount: input.amount,
    currency: input.currency,
    billing_cycle: input.billing_cycle,
    billing_day: input.billing_day,
    category: input.category,
    memo: input.memo || null,
    is_active: true,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");

  return { success: true };
}

export async function updateSubscription(
  id: string,
  input: UpdateSubscriptionInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const { error } = await supabase
    .from("subscriptions")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");
  revalidatePath(`/subscriptions/${id}`);

  return { success: true };
}

export async function deleteSubscription(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증이 필요합니다." };
  }

  // Soft delete
  const { error } = await supabase
    .from("subscriptions")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");

  return { success: true };
}

export async function toggleSubscription(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");

  return { success: true };
}

export async function getExchangeRates(): Promise<
  Record<string, number>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("currency, rate");

  if (error) {
    // 기본 환율 반환
    return { KRW: 1, USD: 1320, JPY: 9.5, EUR: 1450 };
  }

  const rates: Record<string, number> = {};
  for (const row of data) {
    rates[row.currency] = Number(row.rate);
  }

  return rates;
}
