"use client";

import { History, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { EmptyState } from "@/components/ui/empty-state";

interface NotificationLog {
  id: string;
  subscription_id: string;
  service_name: string;
  notification_type: string;
  status: string;
  sent_at: string;
}

interface NotificationHistoryProps {
  history: NotificationLog[];
}

export function NotificationHistory({ history }: NotificationHistoryProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <History className="w-5 h-5" />
          알림 이력
        </h2>
      </div>

      {history.length === 0 ? (
        <EmptyState type="no-notifications" />
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {history.map((log) => (
            <li key={log.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {log.status === "SUCCESS" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {log.service_name}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {log.notification_type === "D_3"
                        ? "결제 3일 전 알림"
                        : "결제 1일 전 알림"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      log.status === "SUCCESS"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {log.status === "SUCCESS" ? "발송 완료" : "발송 실패"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatDistanceToNow(new Date(log.sent_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
