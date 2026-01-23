import { Users, UserCheck, UserX, CreditCard } from "lucide-react";
import { getAllUsers } from "@/actions/admin";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  const totalUsers = users.length;
  const usersWithSubscriptions = users.filter((u) => u.subscriptionCount > 0).length;
  const usersWithoutSubscriptions = users.filter((u) => u.subscriptionCount === 0).length;
  const totalSubscriptions = users.reduce((sum, u) => sum + u.subscriptionCount, 0);
  const activeSubscriptions = users.reduce((sum, u) => sum + u.activeSubscriptionCount, 0);
  const totalMonthly = users.reduce((sum, user) => sum + user.totalMonthlyKRW, 0);

  // 최근 7일 내 가입자
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUsers = users.filter((u) => new Date(u.created_at) >= sevenDaysAgo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          사용자 관리
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          전체 사용자 목록 및 구독 현황
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">전체 사용자</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalUsers}명
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">구독 보유</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {usersWithSubscriptions}명
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <UserX className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">구독 없음</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {usersWithoutSubscriptions}명
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">총 구독</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalSubscriptions}개
              </p>
              <p className="text-xs text-zinc-400">활성 {activeSubscriptions}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">신규 (7일)</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {recentUsers}명
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div>
            <p className="text-xs text-zinc-500">총 월 결제액</p>
            <p className="text-xl font-bold text-emerald-600">
              {totalMonthly.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            사용자 목록
          </h2>
          <p className="text-sm text-zinc-500">
            클릭하여 구독 상세 보기
          </p>
        </div>
        <UsersTable users={users} />
      </div>
    </div>
  );
}
