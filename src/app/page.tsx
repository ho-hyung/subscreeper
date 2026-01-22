import Link from "next/link";
import {
  CreditCard,
  Bell,
  TrendingUp,
  ArrowRight,
  Wallet,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-600" />
            <span className="text-xl font-bold">Subscreeper</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              시작하기
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">
            내 통장을 지켜주는
            <br />
            <span className="text-emerald-600">금융 비서</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            매달 나가는 고정 지출을 시각화하고, 결제 전 미리 알려드립니다.
            <br />
            넷플릭스, 유튜브 프리미엄부터 각종 구독 서비스까지 한눈에 관리하세요.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">구독 관리</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              모든 구독 서비스를 한 곳에서 관리하세요. 금액, 결제일, 카테고리별로
              정리됩니다.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">스마트 환율</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              달러, 엔화 결제도 걱정 없이! 실시간 환율을 적용해 원화 예상 금액을
              보여드립니다.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">결제 알림</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              결제 3일 전, 1일 전 이메일로 미리 알려드려요. 잊고 있던 구독도 놓치지
              마세요.
            </p>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">이번 달 예상 지출</h2>
            <p className="text-4xl font-bold text-emerald-600">₩156,000</p>
            <p className="text-sm text-zinc-500 mt-1">
              환율 변동 +₩12,000 반영
            </p>
          </div>

          <div className="space-y-3">
            {[
              { name: "Netflix", dday: 3, amount: "₩17,000", category: "OTT" },
              {
                name: "Spotify",
                dday: 7,
                amount: "$10.99 → ₩14,500",
                category: "Music",
              },
              { name: "iCloud+", dday: 12, amount: "₩1,100", category: "Cloud" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-zinc-500">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.amount}</p>
                  <p className="text-sm text-amber-600">D-{item.dday}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-zinc-500">
          <p>Subscreeper - 내 통장을 지켜주는 금융 비서</p>
        </div>
      </footer>
    </div>
  );
}
