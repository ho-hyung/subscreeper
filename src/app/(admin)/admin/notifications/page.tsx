import { getAllNotificationLogs } from "@/actions/admin";
import { NotificationsTable } from "@/components/admin/notifications-table";

export default async function AdminNotificationsPage() {
  const logs = await getAllNotificationLogs(200);

  const successCount = logs.filter((log) => log.status === "SUCCESS").length;
  const failedCount = logs.filter((log) => log.status === "FAILED").length;
  const d1Count = logs.filter((log) => log.notification_type === "D_1").length;
  const d3Count = logs.filter((log) => log.notification_type === "D_3").length;

  // 오늘 발송된 알림
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter((log) => new Date(log.sent_at) >= today);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          알림 이력
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          전체 알림 발송 이력 및 통계
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">전체 알림</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {logs.length.toLocaleString()}건
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">오늘 발송</p>
          <p className="text-2xl font-bold text-amber-600">
            {todayLogs.length.toLocaleString()}건
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">성공</p>
          <p className="text-2xl font-bold text-green-600">
            {successCount.toLocaleString()}건
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">실패</p>
          <p className="text-2xl font-bold text-red-600">
            {failedCount.toLocaleString()}건
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">성공률</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {logs.length > 0
              ? `${Math.round((successCount / logs.length) * 100)}%`
              : "0%"}
          </p>
        </div>
      </div>

      {/* Type Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">D-3 알림</p>
              <p className="text-xl font-bold text-amber-600">
                {d3Count.toLocaleString()}건
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
              3일 전 알림
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">D-1 알림</p>
              <p className="text-xl font-bold text-red-600">
                {d1Count.toLocaleString()}건
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
              1일 전 알림
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            최근 알림 발송 이력
          </h2>
        </div>
        <NotificationsTable logs={logs} />
      </div>
    </div>
  );
}
