# Subscreeper

내 통장을 지켜주는 구독 관리 서비스

## 주요 기능

- **구독 관리**: 월간/연간 구독 서비스 등록 및 관리
- **대시보드**: 월별 지출 현황, 카테고리별 분석, 결제 캘린더
- **결제 알림**: D-3, D-1 이메일 및 푸시 알림
- **환율 자동 적용**: USD, JPY, EUR 외화 구독 금액을 원화로 자동 환산
- **PWA 지원**: 모바일 홈 화면 추가 및 푸시 알림

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth)
- **알림**: Resend (이메일), Web Push API (푸시)
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local.example`을 `.env.local`로 복사하고 값을 설정하세요:

```bash
cp .env.local.example .env.local
```

필수 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Cron Job용 Service Role Key
- `RESEND_API_KEY`: Resend API Key (이메일 발송)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: Web Push VAPID Public Key
- `VAPID_PRIVATE_KEY`: Web Push VAPID Private Key

VAPID 키 생성:
```bash
npx web-push generate-vapid-keys
```

### 3. Supabase 설정

`supabase/schema.sql` 파일을 Supabase SQL Editor에서 실행하여 테이블을 생성하세요.

### 4. 개발 서버 실행

```bash
pnpm dev
```

http://localhost:3600 에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── (admin)/          # 관리자 페이지
│   ├── (auth)/           # 로그인/회원가입
│   ├── (dashboard)/      # 대시보드, 구독 관리, 설정
│   └── api/              # API 라우트
│       ├── cron/         # Cron Job (알림 발송)
│       └── push/         # 푸시 알림 구독
├── actions/              # Server Actions
├── components/           # React 컴포넌트
├── lib/                  # 유틸리티 함수
└── types/                # TypeScript 타입 정의
```

## 배포

### Vercel

1. GitHub 저장소 연결
2. 환경 변수 설정
3. Cron Job 설정 (`vercel.json`):
   ```json
   {
     "crons": [{
       "path": "/api/cron/send-notifications",
       "schedule": "0 0 * * *"
     }]
   }
   ```

## 라이선스

MIT
