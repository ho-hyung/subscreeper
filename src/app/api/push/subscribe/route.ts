import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    // 기존 구독 확인 (같은 endpoint)
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("endpoint", subscription.endpoint)
      .single();

    if (existing) {
      // 기존 구독 업데이트
      const { error } = await supabase
        .from("push_subscriptions")
        .update({
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error("Update subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // 새 구독 생성
      const { error } = await supabase.from("push_subscriptions").insert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });

      if (error) {
        console.error("Insert subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // user_metadata에 push_enabled 업데이트
    await supabase.auth.updateUser({
      data: { push_enabled: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (endpoint) {
      // 특정 구독 삭제
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("endpoint", endpoint);
    } else {
      // 모든 구독 삭제
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id);
    }

    // user_metadata에 push_enabled 업데이트
    await supabase.auth.updateUser({
      data: { push_enabled: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
