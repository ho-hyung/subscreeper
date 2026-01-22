"use client";

import { useState } from "react";
import { Bell, Mail, User, Loader2, Check, Send } from "lucide-react";
import {
  updateNotificationSettings,
  updateUserName,
  sendTestNotification,
  type UserSettings,
} from "@/actions/settings";

interface SettingsFormProps {
  settings: UserSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [notificationEnabled, setNotificationEnabled] = useState(
    settings.notificationEnabled
  );
  const [name, setName] = useState(settings.name);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleNotificationToggle = async () => {
    const newValue = !notificationEnabled;
    setNotificationEnabled(newValue);

    const result = await updateNotificationSettings(newValue);

    if (result.success) {
      setMessage({
        type: "success",
        text: newValue ? "알림이 활성화되었습니다." : "알림이 비활성화되었습니다.",
      });
    } else {
      setNotificationEnabled(!newValue); // 롤백
      setMessage({ type: "error", text: result.error || "설정 변경에 실패했습니다." });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleNameSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    const result = await updateUserName(name.trim());
    setSaving(false);

    if (result.success) {
      setMessage({ type: "success", text: "이름이 저장되었습니다." });
    } else {
      setMessage({ type: "error", text: result.error || "저장에 실패했습니다." });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleTestEmail = async () => {
    setTestSending(true);
    const result = await sendTestNotification();
    setTestSending(false);

    if (result.success) {
      setMessage({ type: "success", text: "테스트 이메일이 발송되었습니다." });
    } else {
      setMessage({
        type: "error",
        text: result.error || "이메일 발송에 실패했습니다.",
      });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Message Toast */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <User className="w-5 h-5" />
            프로필
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              이메일
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-500">
              <Mail className="w-4 h-4" />
              {settings.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              이름
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="flex-1 px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                onClick={handleNameSave}
                disabled={saving || !name.trim()}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                저장
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 설정
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Notification Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                결제 알림
              </p>
              <p className="text-sm text-zinc-500">
                결제 3일 전, 1일 전에 이메일로 알려드립니다
              </p>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationEnabled
                  ? "bg-emerald-600"
                  : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Test Email */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  테스트 이메일
                </p>
                <p className="text-sm text-zinc-500">
                  알림 이메일이 정상적으로 수신되는지 확인합니다
                </p>
              </div>
              <button
                onClick={handleTestEmail}
                disabled={testSending}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {testSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                테스트 발송
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
