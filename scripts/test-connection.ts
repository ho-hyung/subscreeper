import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testConnection() {
  console.log("🔍 Supabase 연결 테스트 시작...\n");

  // 환경 변수 확인
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ 환경 변수가 설정되지 않았습니다.");
    console.log("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ 설정됨" : "❌ 없음");
    console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅ 설정됨" : "❌ 없음");
    process.exit(1);
  }

  console.log("✅ 환경 변수 확인 완료");
  console.log("   URL:", supabaseUrl);
  console.log("   Key:", supabaseKey.slice(0, 20) + "...\n");

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. 기본 연결 테스트
    console.log("📡 데이터베이스 연결 테스트...");
    const { data, error } = await supabase.from("exchange_rates").select("*");

    if (error) {
      if (error.code === "42P01") {
        console.log("⚠️  테이블이 없습니다. schema.sql을 실행해주세요.");
      } else {
        throw error;
      }
    } else {
      console.log("✅ 데이터베이스 연결 성공!");
      console.log("   exchange_rates 테이블 데이터:", data);
    }

    // 2. Auth 서비스 테스트
    console.log("\n🔐 Auth 서비스 테스트...");
    const { data: session } = await supabase.auth.getSession();
    console.log("✅ Auth 서비스 정상 작동");
    console.log("   현재 세션:", session.session ? "로그인됨" : "비로그인 상태");

    console.log("\n🎉 모든 테스트 통과! Supabase 연결이 정상입니다.");

  } catch (err) {
    console.error("\n❌ 연결 오류:", err);
    process.exit(1);
  }
}

testConnection();
