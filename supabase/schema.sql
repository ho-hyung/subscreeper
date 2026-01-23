-- Subscreeper Database Schema
-- Supabase SQL Editor에서 실행하세요

-- 1. 구독 테이블
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',
  billing_cycle VARCHAR(10) NOT NULL DEFAULT 'MONTHLY',
  billing_day INTEGER NOT NULL CHECK (billing_day >= 1 AND billing_day <= 31),
  category VARCHAR(20) NOT NULL DEFAULT 'OTHER',
  memo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 알림 로그 테이블
CREATE TABLE notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  notification_type VARCHAR(10) NOT NULL, -- 'D_3' or 'D_1'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(10) NOT NULL DEFAULT 'SUCCESS' -- 'SUCCESS' or 'FAILED'
);

-- 3. 환율 캐시 테이블 (선택사항)
CREATE TABLE exchange_rates (
  currency VARCHAR(3) PRIMARY KEY,
  rate DECIMAL(12, 4) NOT NULL, -- KRW 기준 환율
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. subscriptions 테이블에 트리거 적용
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS (Row Level Security) 활성화
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- 7. 구독 테이블 정책: 본인 데이터만 접근 가능
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- 8. 알림 로그 정책: 본인 구독의 알림만 조회 가능
CREATE POLICY "Users can view own notification logs"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = notification_logs.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

-- 9. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_billing_day ON subscriptions(billing_day);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_notification_logs_subscription_id ON notification_logs(subscription_id);

-- 10. Push 구독 테이블
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push 구독 테이블 RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Push 구독 인덱스
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- 11. 기본 환율 데이터 (초기값)
INSERT INTO exchange_rates (currency, rate) VALUES
  ('KRW', 1),
  ('USD', 1320),
  ('JPY', 9.5),
  ('EUR', 1450)
ON CONFLICT (currency) DO NOTHING;
