"use client";

import { Bell, CheckCircle, XCircle } from "lucide-react";
import type { NotificationLogWithDetails } from "@/actions/admin";

interface NotificationsTableProps {
  logs: NotificationLogWithDetails[];
}

export function NotificationsTable({ logs }: NotificationsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500">알림 발송 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              서비스명
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              알림 타입
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              상태
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              발송 시간
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {log.subscription?.service_name || "알 수 없음"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {log.subscription?.user_id?.substring(0, 8) || "-"}...
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.notification_type === "D_1"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {log.notification_type === "D_1" ? "D-1 (내일 결제)" : "D-3 (3일 후 결제)"}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {log.status === "SUCCESS" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        성공
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">
                        실패
                      </span>
                    </>
                  )}
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-zinc-500">
                {new Date(log.sent_at).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
