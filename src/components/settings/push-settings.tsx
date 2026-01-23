"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Smartphone, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface PushSettingsProps {
  initialEnabled: boolean;
  vapidPublicKey: string;
}

export function PushSettings({ initialEnabled, vapidPublicKey }: PushSettingsProps) {
  const toast = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // 브라우저 지원 여부 확인
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Check subscription error:", error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error("Service worker registration error:", error);
      throw error;
    }
  };

  const subscribe = async () => {
    setIsLoading(true);

    try {
      // 권한 요청
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        toast.error("알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.");
        setIsLoading(false);
        return;
      }

      // Service Worker 등록
      const registration = await registerServiceWorker();

      // Push 구독
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // 서버에 구독 정보 저장
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setIsSubscribed(true);
      toast.success("푸시 알림이 활성화되었습니다.");
    } catch (error) {
      console.error("Subscribe error:", error);
      toast.error("푸시 알림 활성화에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // 서버에서 구독 정보 삭제
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setIsSubscribed(false);
      toast.success("푸시 알림이 비활성화되었습니다.");
    } catch (error) {
      console.error("Unsubscribe error:", error);
      toast.error("푸시 알림 비활성화에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <BellOff className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              푸시 알림
            </h2>
            <p className="text-sm text-zinc-500">
              이 브라우저는 푸시 알림을 지원하지 않습니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isSubscribed
            ? "bg-emerald-100 dark:bg-emerald-900/30"
            : "bg-zinc-100 dark:bg-zinc-800"
        }`}>
          <Smartphone className={`w-5 h-5 ${
            isSubscribed ? "text-emerald-600" : "text-zinc-400"
          }`} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            푸시 알림
          </h2>
          <p className="text-sm text-zinc-500">
            결제일 알림을 모바일로 받아보세요
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {isSubscribed ? "알림 활성화됨" : "알림 비활성화됨"}
            </p>
            {permission === "denied" && (
              <p className="text-xs text-red-500 mt-1">
                브라우저에서 알림이 차단되어 있습니다
              </p>
            )}
          </div>
          <button
            onClick={handleToggle}
            disabled={isLoading || permission === "denied"}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isSubscribed
                ? "bg-emerald-600"
                : "bg-zinc-300 dark:bg-zinc-600"
            } ${(isLoading || permission === "denied") ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </span>
            ) : (
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSubscribed ? "translate-x-6" : "translate-x-1"
                }`}
              />
            )}
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          {isSubscribed
            ? "결제 3일 전, 1일 전에 푸시 알림을 받습니다."
            : "활성화하면 결제일 알림을 모바일에서 받을 수 있습니다."}
        </p>

        {!isSubscribed && permission !== "denied" && (
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-400">
              PWA로 홈 화면에 추가하면 앱처럼 알림을 받을 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// VAPID 키 변환 유틸리티
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer as ArrayBuffer;
}
