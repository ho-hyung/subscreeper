import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings, getNotificationHistory } from "@/actions/settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { NotificationHistory } from "@/components/settings/notification-history";
import { ThemeSettings } from "@/components/settings/theme-settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [settings, history] = await Promise.all([
    getUserSettings(),
    getNotificationHistory(10),
  ]);

  if (!settings) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          설정
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          알림 및 계정 설정을 관리하세요
        </p>
      </div>

      <ThemeSettings />

      <SettingsForm settings={settings} />

      <NotificationHistory history={history} />
    </div>
  );
}
