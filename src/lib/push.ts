import webPush from "web-push";

// VAPID 설정
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    "mailto:subscreeper@example.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: {
    url?: string;
    subscriptionId?: string;
    [key: string]: unknown;
  };
}

/**
 * Push 알림 발송
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: "VAPID keys not configured" };
  }

  try {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
      {
        TTL: 60 * 60, // 1시간
        urgency: "high",
      }
    );

    return { success: true };
  } catch (err: unknown) {
    console.error("Push notification error:", err);

    // 구독이 만료되었거나 유효하지 않은 경우
    if (err && typeof err === "object" && "statusCode" in err) {
      const statusCode = (err as { statusCode: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        return { success: false, error: "subscription_expired" };
      }
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * VAPID Public Key 반환 (클라이언트용)
 */
export function getVapidPublicKey(): string {
  return vapidPublicKey;
}
