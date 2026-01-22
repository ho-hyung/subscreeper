import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSubscription } from "@/actions/subscriptions";
import { SubscriptionForm } from "@/components/subscription/subscription-form";

interface EditSubscriptionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSubscriptionPage({
  params,
}: EditSubscriptionPageProps) {
  const { id } = await params;
  const subscription = await getSubscription(id);

  if (!subscription) {
    notFound();
  }

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
          구독 수정
        </h1>
        <p className="text-zinc-500 mt-1">
          {subscription.service_name} 구독 정보를 수정하세요
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <SubscriptionForm subscription={subscription} />
      </div>
    </div>
  );
}
