-- =====================================================
-- Subscreeper Database Schema
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- =====================================================
-- 1. 테이블 생성
-- =====================================================

-- 1-1. 구독 테이블
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',  -- KRW, USD, JPY, EUR
  billing_cycle VARCHAR(10) NOT NULL DEFAULT 'MONTHLY',  -- MONTHLY, YEARLY
  billing_day INTEGER NOT NULL CHECK (billing_day >= 1 AND billing_day <= 31),
  billing_month INTEGER CHECK (billing_month >= 1 AND billing_month <= 12),  -- 연간 구독용 (1-12월)
  category VARCHAR(20) NOT NULL DEFAULT 'OTHER',  -- OTT, MUSIC, PRODUCTIVITY, CLOUD, GAMING, SHOPPING, FITNESS, NEWS, OTHER
  memo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1-2. 알림 로그 테이블
CREATE TABLE notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  notification_type VARCHAR(10) NOT NULL,  -- D_3 (3일 전), D_1 (1일 전)
  status VARCHAR(10) NOT NULL DEFAULT 'SUCCESS',  -- SUCCESS, FAILED
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1-3. 환율 캐시 테이블
CREATE TABLE exchange_rates (
  currency VARCHAR(3) PRIMARY KEY,
  rate DECIMAL(12, 4) NOT NULL,  -- KRW 기준 환율
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1-4. Push 구독 테이블
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1-5. 관리자 테이블
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. 함수 및 트리거
-- =====================================================

-- 2-1. updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2-2. subscriptions 테이블 트리거
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2-3. push_subscriptions 테이블 트리거
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. RLS (Row Level Security) 활성화
-- =====================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS 정책 - 일반 사용자
-- =====================================================

-- 4-1. subscriptions: 본인 데이터만 접근
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

-- 4-2. notification_logs: 본인 구독의 알림만 조회
CREATE POLICY "Users can view own notification logs"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = notification_logs.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

-- 4-3. push_subscriptions: 본인 데이터만 접근
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- 4-4. admins: 본인 레코드만 조회
CREATE POLICY "Users can view own admin status"
  ON admins FOR SELECT
  USING (auth.uid() = id);

-- =====================================================
-- 5. RLS 정책 - 관리자
-- =====================================================

-- 5-1. 관리자는 모든 subscriptions 조회 가능
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- 5-2. 관리자는 모든 notification_logs 조회 가능
CREATE POLICY "Admins can view all notification logs"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- 5-3. 관리자는 모든 push_subscriptions 조회 가능
CREATE POLICY "Admins can view all push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- =====================================================
-- 6. 인덱스 (성능 최적화)
-- =====================================================

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_billing_day ON subscriptions(billing_day);
CREATE INDEX idx_subscriptions_billing_month ON subscriptions(billing_month);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_notification_logs_subscription_id ON notification_logs(subscription_id);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_admins_role ON admins(role);

-- =====================================================
-- 7. 초기 데이터
-- =====================================================

-- 기본 환율 데이터
INSERT INTO exchange_rates (currency, rate) VALUES
  ('KRW', 1),
  ('USD', 1350),
  ('JPY', 9),
  ('EUR', 1450)
ON CONFLICT (currency) DO NOTHING;

-- =====================================================
-- 8. 관리자 추가 (선택)
-- =====================================================
-- 아래 쿼리의 'your-user-id'를 실제 user_id로 변경 후 실행
-- INSERT INTO admins (id) VALUES ('your-user-id');
