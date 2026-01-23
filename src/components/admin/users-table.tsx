"use client";

import { useState } from "react";
import { User, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import type { UserWithSubscriptions } from "@/actions/admin";

interface UsersTableProps {
  users: UserWithSubscriptions[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500">등록된 사용자가 없습니다.</p>
      </div>
    );
  }

  const toggleExpand = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              사용자
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              구독
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              월 결제액
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              가입일
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              최근 로그인
            </th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <>
              <tr
                key={user.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                onClick={() => user.subscriptionCount > 0 && toggleExpand(user.id)}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {user.name || "이름 없음"}
                      </p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      활성 {user.activeSubscriptionCount}개
                    </span>
                    {user.subscriptionCount > user.activeSubscriptionCount && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        비활성 {user.subscriptionCount - user.activeSubscriptionCount}개
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {user.totalMonthlyKRW > 0
                      ? `${user.totalMonthlyKRW.toLocaleString()}원`
                      : "-"}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-zinc-500">
                  {new Date(user.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="py-4 px-4 text-sm text-zinc-500">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td className="py-4 px-4">
                  {user.subscriptionCount > 0 && (
                    <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                      {expandedUser === user.id ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  )}
                </td>
              </tr>
              {/* 구독 상세 */}
              {expandedUser === user.id && user.subscriptions.length > 0 && (
                <tr key={`${user.id}-detail`}>
                  <td colSpan={6} className="bg-zinc-50 dark:bg-zinc-800/30 px-4 py-3">
                    <div className="pl-12">
                      <p className="text-xs font-medium text-zinc-500 mb-2">구독 목록</p>
                      <div className="grid gap-2">
                        {user.subscriptions.map((sub, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              sub.is_active
                                ? "bg-white dark:bg-zinc-900"
                                : "bg-zinc-100 dark:bg-zinc-800 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-zinc-400" />
                              <span className="text-sm text-zinc-900 dark:text-zinc-100">
                                {sub.service_name}
                              </span>
                              {!sub.is_active && (
                                <span className="text-xs text-zinc-400">(비활성)</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                              {sub.amount.toLocaleString()} {sub.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
