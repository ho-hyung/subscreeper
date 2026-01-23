// 구독 카테고리
export type SubscriptionCategory =
  | "OTT"
  | "MUSIC"
  | "PRODUCTIVITY"
  | "CLOUD"
  | "GAMING"
  | "SHOPPING"
  | "FITNESS"
  | "NEWS"
  | "OTHER";

// 결제 주기
export type BillingCycle = "MONTHLY" | "YEARLY";

// 통화
export type Currency = "KRW" | "USD" | "JPY" | "EUR";

// 알림 타입
export type NotificationType = "D_3" | "D_1";

// 알림 상태
export type NotificationStatus = "SUCCESS" | "FAILED";

// 구독 테이블 타입
export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  billing_day: number;
  billing_month: number | null; // 연간 구독용 (1-12)
  category: SubscriptionCategory;
  memo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 구독 생성 시 필요한 데이터
export interface CreateSubscriptionInput {
  service_name: string;
  amount: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  billing_day: number;
  billing_month?: number; // 연간 구독용
  category: SubscriptionCategory;
  memo?: string;
}

// 구독 수정 시 필요한 데이터
export interface UpdateSubscriptionInput {
  service_name?: string;
  amount?: number;
  currency?: Currency;
  billing_cycle?: BillingCycle;
  billing_day?: number;
  billing_month?: number | null; // 연간 구독용
  category?: SubscriptionCategory;
  memo?: string | null;
  is_active?: boolean;
}

// 환율 정보
export interface ExchangeRate {
  currency: Currency;
  rate: number; // KRW 기준
  updated_at: string;
}

// 알림 로그
export interface NotificationLog {
  id: string;
  subscription_id: string;
  notification_type: NotificationType;
  sent_at: string;
  status: NotificationStatus;
}

// 대시보드 요약 데이터
export interface DashboardSummary {
  total_monthly_krw: number;
  upcoming_payments: UpcomingPayment[];
  category_breakdown: CategoryBreakdown[];
}

export interface UpcomingPayment {
  subscription: Subscription;
  days_until: number;
  amount_krw: number;
}

export interface CategoryBreakdown {
  category: SubscriptionCategory;
  total_krw: number;
  count: number;
}

// Supabase Database 타입 (자동 생성 대체용)
export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscription, "id" | "created_at">>;
      };
      notification_logs: {
        Row: NotificationLog;
        Insert: Omit<NotificationLog, "id">;
        Update: Partial<Omit<NotificationLog, "id">>;
      };
    };
  };
}
