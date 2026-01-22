import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubscriptionForm } from "@/components/subscription/subscription-form";

export default function NewSubscriptionPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          구독 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          새 구독 추가
        </h1>
        <p className="text-zinc-500 mt-1">
          새로운 구독 서비스를 등록하세요
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <SubscriptionForm />
      </div>
    </div>
  );
}
