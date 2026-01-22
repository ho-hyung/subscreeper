import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subscreeper - 내 통장을 지켜주는 금융 비서",
  description:
    "매달 나가는 고정 지출을 시각화하고, 결제 전 미리 알려드립니다.",
  keywords: ["구독 관리", "지출 관리", "넷플릭스", "유튜브 프리미엄", "고정 지출"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}
      >
        {children}
      </body>
    </html>
  );
}
