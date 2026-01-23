// Service Worker for Push Notifications

self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activated");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  let data = {
    title: "Subscreeper",
    body: "결제 알림이 있습니다.",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    url: "/dashboard",
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error("[SW] Error parsing push data:", e);
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/badge-72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
    },
    actions: [
      {
        action: "open",
        title: "확인하기",
      },
      {
        action: "close",
        title: "닫기",
      },
    ],
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열린 탭이 있으면 포커스
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // 없으면 새 탭 열기
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
