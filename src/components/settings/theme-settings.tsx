"use client";

import { Palette } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/ui/theme-provider";

export function ThemeSettings() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Palette className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            테마 설정
          </h2>
          <p className="text-sm text-zinc-500">
            화면 테마를 선택하세요
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <ThemeToggle />

        <p className="text-xs text-zinc-500">
          {resolvedTheme === "dark"
            ? "현재 다크 모드가 적용되어 있습니다."
            : "현재 라이트 모드가 적용되어 있습니다."}
        </p>
      </div>
    </div>
  );
}
