import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Admin {
  id: string;
  role: string;
  created_at: string;
}

/**
 * 현재 사용자가 관리자인지 확인
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch {
    // 테이블이 없거나 기타 에러 발생 시 false 반환
    return false;
  }
}

/**
 * 현재 로그인한 사용자가 관리자인지 확인
 * 관리자가 아니면 대시보드로 리다이렉트
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isAdmin(user.id);

  if (!admin) {
    redirect("/dashboard");
  }

  return { userId: user.id };
}

/**
 * 현재 로그인한 사용자의 관리자 여부 확인 (리다이렉트 없음)
 */
export async function checkAdminStatus(): Promise<{
  isLoggedIn: boolean;
  isAdmin: boolean;
  userId: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isLoggedIn: false, isAdmin: false, userId: null };
  }

  const admin = await isAdmin(user.id);

  return { isLoggedIn: true, isAdmin: admin, userId: user.id };
}
