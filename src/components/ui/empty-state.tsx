"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

type EmptyStateType =
  | "no-subscriptions"
  | "no-data"
  | "no-search-results"
  | "no-notifications"
  | "no-payments";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// SVG 일러스트레이션들
function NoSubscriptionsIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-40"
    >
      {/* 배경 원 */}
      <circle cx="100" cy="80" r="60" className="fill-emerald-50 dark:fill-emerald-900/20" />

      {/* 카드 스택 */}
      <rect
        x="55"
        y="55"
        width="90"
        height="60"
        rx="8"
        className="fill-zinc-200 dark:fill-zinc-700"
        transform="rotate(-6 100 85)"
      />
      <rect
        x="55"
        y="55"
        width="90"
        height="60"
        rx="8"
        className="fill-zinc-100 dark:fill-zinc-800"
        transform="rotate(3 100 85)"
      />
      <rect
        x="55"
        y="55"
        width="90"
        height="60"
        rx="8"
        className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth="2"
      />

      {/* 카드 내용 (줄) */}
      <rect x="65" y="70" width="40" height="6" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="65" y="82" width="60" height="4" rx="2" className="fill-zinc-100 dark:fill-zinc-800" />
      <rect x="65" y="92" width="50" height="4" rx="2" className="fill-zinc-100 dark:fill-zinc-800" />

      {/* 플러스 버튼 */}
      <circle cx="150" cy="50" r="18" className="fill-emerald-500" />
      <path
        d="M150 42V58M142 50H158"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* 점선 화살표 */}
      <path
        d="M130 65L140 55"
        className="stroke-emerald-400"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NoDataIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-40"
    >
      {/* 배경 원 */}
      <circle cx="100" cy="80" r="60" className="fill-blue-50 dark:fill-blue-900/20" />

      {/* 차트 베이스 */}
      <rect
        x="50"
        y="50"
        width="100"
        height="70"
        rx="8"
        className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth="2"
      />

      {/* 빈 바 차트 */}
      <rect x="65" y="95" width="15" height="15" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="85" y="85" width="15" height="25" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="105" y="90" width="15" height="20" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
      <rect x="125" y="100" width="15" height="10" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

      {/* 물음표 */}
      <circle cx="100" cy="70" r="12" className="fill-zinc-100 dark:fill-zinc-800" />
      <text
        x="100"
        y="75"
        textAnchor="middle"
        className="fill-zinc-400 dark:fill-zinc-500 text-sm font-bold"
        fontSize="16"
      >
        ?
      </text>
    </svg>
  );
}

function NoSearchResultsIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-40"
    >
      {/* 배경 원 */}
      <circle cx="100" cy="80" r="60" className="fill-amber-50 dark:fill-amber-900/20" />

      {/* 돋보기 */}
      <circle
        cx="90"
        cy="75"
        r="30"
        className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth="4"
      />
      <line
        x1="112"
        y1="97"
        x2="135"
        y2="120"
        className="stroke-zinc-400 dark:stroke-zinc-500"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* X 표시 */}
      <path
        d="M80 65L100 85M100 65L80 85"
        className="stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NoNotificationsIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-40"
    >
      {/* 배경 원 */}
      <circle cx="100" cy="80" r="60" className="fill-purple-50 dark:fill-purple-900/20" />

      {/* 종 */}
      <path
        d="M100 45C100 45 75 55 75 80V95H125V80C125 55 100 45 100 45Z"
        className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth="3"
      />
      <rect
        x="70"
        y="95"
        width="60"
        height="8"
        rx="4"
        className="fill-zinc-200 dark:fill-zinc-700"
      />
      <circle cx="100" cy="110" r="8" className="fill-zinc-300 dark:fill-zinc-600" />

      {/* 줄 */}
      <line
        x1="100"
        y1="35"
        x2="100"
        y2="45"
        className="stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Zzz */}
      <text
        x="135"
        y="55"
        className="fill-zinc-400 dark:fill-zinc-500 font-bold"
        fontSize="14"
      >
        z
      </text>
      <text
        x="145"
        y="45"
        className="fill-zinc-300 dark:fill-zinc-600 font-bold"
        fontSize="12"
      >
        z
      </text>
      <text
        x="152"
        y="38"
        className="fill-zinc-200 dark:fill-zinc-700 font-bold"
        fontSize="10"
      >
        z
      </text>
    </svg>
  );
}

function NoPaymentsIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-40"
    >
      {/* 배경 원 */}
      <circle cx="100" cy="80" r="60" className="fill-emerald-50 dark:fill-emerald-900/20" />

      {/* 달력 */}
      <rect
        x="55"
        y="45"
        width="90"
        height="80"
        rx="8"
        className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth="2"
      />
      <rect
        x="55"
        y="45"
        width="90"
        height="25"
        rx="8"
        className="fill-emerald-500"
      />
      <rect x="55" y="62" width="90" height="8" className="fill-emerald-500" />

      {/* 달력 고리 */}
      <rect x="75" y="40" width="8" height="15" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x="117" y="40" width="8" height="15" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />

      {/* 달력 날짜 그리드 */}
      <circle cx="75" cy="90" r="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <circle cx="95" cy="90" r="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <circle cx="115" cy="90" r="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <circle cx="135" cy="90" r="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <circle cx="75" cy="108" r="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <circle cx="95" cy="108" r="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <circle cx="115" cy="108" r="4" className="fill-zinc-200 dark:fill-zinc-700" />
      <circle cx="135" cy="108" r="4" className="fill-zinc-200 dark:fill-zinc-700" />

      {/* 체크마크 */}
      <circle cx="155" cy="115" r="16" className="fill-emerald-500" />
      <path
        d="M148 115L153 120L163 110"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const illustrations: Record<EmptyStateType, () => React.ReactNode> = {
  "no-subscriptions": NoSubscriptionsIllustration,
  "no-data": NoDataIllustration,
  "no-search-results": NoSearchResultsIllustration,
  "no-notifications": NoNotificationsIllustration,
  "no-payments": NoPaymentsIllustration,
};

const defaultContent: Record<EmptyStateType, { title: string; description: string }> = {
  "no-subscriptions": {
    title: "등록된 구독이 없습니다",
    description: "첫 번째 구독을 추가하고 지출을 관리해보세요",
  },
  "no-data": {
    title: "데이터가 없습니다",
    description: "구독을 추가하면 통계를 확인할 수 있어요",
  },
  "no-search-results": {
    title: "검색 결과가 없습니다",
    description: "다른 검색어로 다시 시도해보세요",
  },
  "no-notifications": {
    title: "알림 이력이 없습니다",
    description: "결제 알림이 발송되면 여기에 표시됩니다",
  },
  "no-payments": {
    title: "예정된 결제가 없습니다",
    description: "모든 결제가 완료되었습니다",
  },
};

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const Illustration = illustrations[type];
  const content = defaultContent[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Illustration />
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title || content.title}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 text-center max-w-xs">
        {description || content.description}
      </p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
