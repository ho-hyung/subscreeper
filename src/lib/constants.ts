import type { SubscriptionCategory, Currency } from "@/types/database";

// 카테고리 정보
export const CATEGORIES: Record<
  SubscriptionCategory,
  { label: string; icon: string; color: string }
> = {
  OTT: { label: "OTT/영상", icon: "tv", color: "#E50914" },
  MUSIC: { label: "음악", icon: "music", color: "#1DB954" },
  PRODUCTIVITY: { label: "생산성", icon: "briefcase", color: "#0066FF" },
  CLOUD: { label: "클라우드", icon: "cloud", color: "#5856D6" },
  GAMING: { label: "게임", icon: "gamepad-2", color: "#107C10" },
  SHOPPING: { label: "쇼핑", icon: "shopping-bag", color: "#FF9500" },
  FITNESS: { label: "피트니스", icon: "dumbbell", color: "#FF2D55" },
  NEWS: { label: "뉴스/미디어", icon: "newspaper", color: "#007AFF" },
  OTHER: { label: "기타", icon: "circle-dot", color: "#8E8E93" },
};

// 통화 정보
export const CURRENCIES: Record<Currency, { label: string; symbol: string }> = {
  KRW: { label: "원화", symbol: "₩" },
  USD: { label: "달러", symbol: "$" },
  JPY: { label: "엔화", symbol: "¥" },
  EUR: { label: "유로", symbol: "€" },
};

// 서비스 아이콘 맵
export const SERVICE_ICONS: Record<string, string> = {
  "Netflix": "/icons/services/netflix.svg",
  "YouTube Premium": "/icons/services/youtube.svg",
  "Spotify": "/icons/services/spotify.svg",
  "Apple Music": "/icons/services/apple-music.svg",
  "iCloud+": "/icons/services/icloud.svg",
  "Google One": "/icons/services/google.svg",
  "Notion": "/icons/services/notion.svg",
  "ChatGPT Plus": "/icons/services/openai.svg",
  "Disney+": "/icons/services/disney-plus.svg",
  "Watcha": "/icons/services/watcha.svg",
  "Coupang Play": "/icons/services/coupang.svg",
  "Xbox Game Pass": "/icons/services/xbox.svg",
  "TVING": "/icons/services/tving.svg",
  "Wavve": "/icons/services/wavve.svg",
  "네이버플러스 멤버십": "/icons/services/naver.svg",
  "밀리의서재": "/icons/services/millie.svg",
  "쿠팡 와우 멤버십": "/icons/services/coupang-wow.svg",
};

// 인기 구독 서비스 프리셋 (금액 포함)
export const POPULAR_SERVICES = [
  // OTT
  { name: "Netflix", category: "OTT" as const, currency: "KRW" as const, amount: 17000, popular: true },
  { name: "YouTube Premium", category: "OTT" as const, currency: "KRW" as const, amount: 14900, popular: true },
  { name: "Disney+", category: "OTT" as const, currency: "KRW" as const, amount: 9900, popular: true },
  { name: "TVING", category: "OTT" as const, currency: "KRW" as const, amount: 10900 },
  { name: "Wavve", category: "OTT" as const, currency: "KRW" as const, amount: 10900 },
  { name: "Watcha", category: "OTT" as const, currency: "KRW" as const, amount: 7900 },
  { name: "Coupang Play", category: "OTT" as const, currency: "KRW" as const, amount: 7890 },
  // 음악
  { name: "Spotify", category: "MUSIC" as const, currency: "KRW" as const, amount: 10900, popular: true },
  { name: "Apple Music", category: "MUSIC" as const, currency: "KRW" as const, amount: 10900 },
  // 생산성
  { name: "ChatGPT Plus", category: "PRODUCTIVITY" as const, currency: "USD" as const, amount: 20, popular: true },
  { name: "Notion", category: "PRODUCTIVITY" as const, currency: "USD" as const, amount: 10 },
  { name: "Claude Pro", category: "PRODUCTIVITY" as const, currency: "USD" as const, amount: 20 },
  // 클라우드
  { name: "iCloud+ 50GB", category: "CLOUD" as const, currency: "KRW" as const, amount: 1100 },
  { name: "iCloud+ 200GB", category: "CLOUD" as const, currency: "KRW" as const, amount: 3900 },
  { name: "Google One 100GB", category: "CLOUD" as const, currency: "KRW" as const, amount: 2400 },
  // 쇼핑
  { name: "쿠팡 와우 멤버십", category: "SHOPPING" as const, currency: "KRW" as const, amount: 7890, popular: true },
  { name: "네이버플러스 멤버십", category: "SHOPPING" as const, currency: "KRW" as const, amount: 4900 },
  // 기타
  { name: "밀리의서재", category: "NEWS" as const, currency: "KRW" as const, amount: 9900 },
  { name: "Xbox Game Pass", category: "GAMING" as const, currency: "KRW" as const, amount: 14800 },
];
