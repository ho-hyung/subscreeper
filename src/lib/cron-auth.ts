import { NextResponse } from "next/server";

export interface CronAuthResult {
  authorized: boolean;
  error?: NextResponse;
}

/**
 * Vercel Cron Job 인증 검증
 *
 * 보안 검증:
 * 1. CRON_SECRET 환경변수 필수 (미설정 시 거부)
 * 2. Authorization 헤더 검증
 * 3. Vercel Cron 헤더 확인 (프로덕션)
 */
export function verifyCronAuth(request: Request): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET;

  // CRON_SECRET이 설정되지 않은 경우 - 보안상 거부
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return {
      authorized: false,
      error: NextResponse.json(
        { error: "Cron authentication not configured" },
        { status: 500 }
      ),
    };
  }

  // Vercel Cron 요청 확인 (Vercel은 이 헤더를 자동으로 추가)
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  // Authorization 헤더 검증
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${cronSecret}`;

  if (authHeader !== expectedAuth) {
    // 개발 환경에서 디버깅용 로그
    if (process.env.NODE_ENV === "development") {
      console.log("Cron auth failed:", {
        isVercelCron,
        hasAuthHeader: !!authHeader,
        headerMatch: authHeader === expectedAuth,
      });
    }

    return {
      authorized: false,
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { authorized: true };
}

/**
 * Supabase Service Role 키 검증
 */
export function verifySupabaseServiceKey(): {
  valid: boolean;
  url?: string;
  serviceKey?: string;
  error?: NextResponse;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: "Supabase service credentials not configured" },
        { status: 500 }
      ),
    };
  }

  return {
    valid: true,
    url: supabaseUrl,
    serviceKey: supabaseServiceKey,
  };
}
