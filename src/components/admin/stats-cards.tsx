import { Users, CreditCard, Bell, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import type { AdminStats } from "@/actions/admin";

interface StatsCardsProps {
  stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      name: "총 사용자",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "전체 구독",
      value: stats.totalSubscriptions.toLocaleString(),
      subtext: `활성 ${stats.activeSubscriptions.toLocaleString()}개`,
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      name: "오늘 알림",
      value: stats.todayNotifications.toLocaleString(),
      icon: Bell,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      name: "성공",
      value: stats.successfulNotifications.toLocaleString(),
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      name: "실패",
      value: stats.failedNotifications.toLocaleString(),
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      name: "활성화율",
      value:
        stats.totalSubscriptions > 0
          ? `${Math.round((stats.activeSubscriptions / stats.totalSubscriptions) * 100)}%`
          : "0%",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.name}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {card.name}
              </p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {card.value}
              </p>
              {card.subtext && (
                <p className="text-xs text-zinc-400">{card.subtext}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
