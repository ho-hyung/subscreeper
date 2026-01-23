import Link from "next/link";
import { Users, Bell, ArrowRight } from "lucide-react";
import { getAdminStats, getSubscriptionStats, getAllNotificationLogs } from "@/actions/admin";
import { StatsCards } from "@/components/admin/stats-cards";
import { CATEGORIES } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const [stats, subscriptionStats, recentLogs] = await Promise.all([
    getAdminStats(),
    getSubscriptionStats(),
    getAllNotificationLogs(5),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          관리자 대시보드
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          전체 서비스 현황을 확인하세요
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            카테고리별 구독
          </h2>
          <div className="space-y-3">
            {subscriptionStats.byCategory.length > 0 ? (
              subscriptionStats.byCategory
                .sort((a, b) => b.count - a.count)
                .map((item) => {
                  const categoryInfo = CATEGORIES[item.category as keyof typeof CATEGORIES];
                  return (
                    <div
                      key={item.category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>{categoryInfo?.icon || "📦"}</span>
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {categoryInfo?.label || item.category}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.count}개
                      </span>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-zinc-500">데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* Currency Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            통화별 구독 (활성)
          </h2>
          <div className="space-y-3">
            {subscriptionStats.byCurrency.length > 0 ? (
              subscriptionStats.byCurrency
                .sort((a, b) => b.count - a.count)
                .map((item) => (
                  <div
                    key={item.currency}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {item.currency}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.count}개
                      </span>
                      <span className="text-xs text-zinc-500 ml-2">
                        ({item.totalAmount.toLocaleString()} {item.currency})
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-zinc-500">데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            최근 알림 발송
          </h2>
          <Link
            href="/admin/notifications"
            className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
          >
            전체 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left py-2 text-xs font-medium text-zinc-500">
                    서비스
                  </th>
                  <th className="text-left py-2 text-xs font-medium text-zinc-500">
                    타입
                  </th>
                  <th className="text-left py-2 text-xs font-medium text-zinc-500">
                    상태
                  </th>
                  <th className="text-left py-2 text-xs font-medium text-zinc-500">
                    발송 시간
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="py-3 text-sm text-zinc-900 dark:text-zinc-100">
                      {log.subscription?.service_name || "-"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.notification_type === "D_1"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {log.notification_type === "D_1" ? "D-1" : "D-3"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.status === "SUCCESS"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {log.status === "SUCCESS" ? "성공" : "실패"}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-zinc-500">
                      {new Date(log.sent_at).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">최근 알림이 없습니다.</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
        >
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              사용자 관리
            </h3>
            <p className="text-sm text-zinc-500">
              전체 사용자 목록 및 구독 현황 확인
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-400 ml-auto" />
        </Link>

        <Link
          href="/admin/notifications"
          className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
        >
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <Bell className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              알림 이력
            </h3>
            <p className="text-sm text-zinc-500">
              전체 알림 발송 이력 및 통계
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-400 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
