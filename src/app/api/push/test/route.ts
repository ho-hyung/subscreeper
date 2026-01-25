import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushNotification, type PushSubscription, type PushPayload } from "@/lib/push";

// 테스트용 푸시 알림 발송 API
export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자의 푸시 구독 조회
    const { data: pushSubscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id);

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    if (!pushSubscriptions || pushSubscriptions.length === 0) {
      return NextResponse.json({ error: "No push subscriptions found" }, { status: 404 });
    }

    const results = [];

    for (const pushSub of pushSubscriptions) {
      const subscription: PushSubscription = {
        endpoint: pushSub.endpoint,
        keys: {
          p256dh: pushSub.p256dh,
          auth: pushSub.auth,
        },
      };

      const payload: PushPayload = {
        title: "테스트 알림",
        body: "푸시 알림이 정상적으로 작동합니다! 🎉",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        data: {
          url: "/dashboard",
        },
      };

      const result = await sendPushNotification(subscription, payload);
      results.push({
        endpoint: pushSub.endpoint.slice(0, 50) + "...",
        ...result,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      vapidConfigured: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY,
    });
  } catch (error) {
    console.error("Test push error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
