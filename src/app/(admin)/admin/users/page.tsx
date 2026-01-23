import { getAllUsers } from "@/actions/admin";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  const totalMonthly = users.reduce((sum, user) => sum + user.totalMonthlyKRW, 0);

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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">총 사용자</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {users.length.toLocaleString()}명
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">총 구독</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {users.reduce((sum, u) => sum + u.subscriptionCount, 0).toLocaleString()}개
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">총 월 결제액</p>
          <p className="text-2xl font-bold text-emerald-600">
            {totalMonthly.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
