import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 발신자 이메일 (Resend에서 인증된 도메인 필요, 또는 onboarding@resend.dev 사용)
const FROM_EMAIL = process.env.FROM_EMAIL || "Subscreeper <onboarding@resend.dev>";

export interface PaymentReminderData {
  userName: string;
  userEmail: string;
  serviceName: string;
  amount: string;
  amountKRW: string;
  billingDay: number;
  daysUntil: number;
  category: string;
}

/**
 * 결제 알림 이메일 발송
 */
export async function sendPaymentReminder(
  data: PaymentReminderData
): Promise<{ success: boolean; error?: string }> {
  const { userEmail, userName, serviceName, amount, amountKRW, billingDay, daysUntil, category } = data;

  const subject =
    daysUntil === 0
      ? `[Subscreeper] 오늘 ${serviceName} 결제일입니다`
      : daysUntil === 1
        ? `[Subscreeper] 내일 ${serviceName} 결제 예정`
        : `[Subscreeper] ${daysUntil}일 후 ${serviceName} 결제 예정`;

  const html = generatePaymentReminderHtml(data);

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * 결제 알림 이메일 HTML 생성
 */
function generatePaymentReminderHtml(data: PaymentReminderData): string {
  const { userName, serviceName, amount, amountKRW, billingDay, daysUntil, category } = data;

  const urgencyColor = daysUntil <= 1 ? "#EF4444" : daysUntil <= 3 ? "#F59E0B" : "#10B981";
  const urgencyText =
    daysUntil === 0
      ? "오늘"
      : daysUntil === 1
        ? "내일"
        : `${daysUntil}일 후`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>결제 알림</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #10B981; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                💳 Subscreeper
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px;">
                안녕하세요, ${userName}님
              </p>

              <h2 style="margin: 0 0 24px; color: #18181b; font-size: 20px; font-weight: 600;">
                결제 예정 알림
              </h2>

              <!-- Service Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase;">
                            ${category}
                          </p>
                          <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: 600;">
                            ${serviceName}
                          </p>
                        </td>
                        <td align="right">
                          <p style="margin: 0 0 4px; color: ${urgencyColor}; font-size: 14px; font-weight: 600;">
                            ${urgencyText}
                          </p>
                          <p style="margin: 0; color: #71717a; font-size: 12px;">
                            매월 ${billingDay}일
                          </p>
                        </td>
                      </tr>
                    </table>

                    <hr style="margin: 16px 0; border: none; border-top: 1px solid #e4e4e7;">

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #71717a; font-size: 14px;">
                            결제 예정 금액
                          </p>
                        </td>
                        <td align="right">
                          <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: bold;">
                            ${amountKRW}
                          </p>
                          ${amount !== amountKRW ? `<p style="margin: 4px 0 0; color: #71717a; font-size: 12px;">${amount}</p>` : ""}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://subscreeper.vercel.app"}/dashboard"
                       style="display: inline-block; padding: 12px 32px; background-color: #10B981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      대시보드 확인하기
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #fafafa; text-align: center;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 12px;">
                이 이메일은 Subscreeper 결제 알림 서비스에서 발송되었습니다.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                알림 설정은 대시보드 설정에서 변경할 수 있습니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * 테스트 이메일 발송
 */
export async function sendTestEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "[Subscreeper] 테스트 이메일",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>🎉 테스트 성공!</h1>
          <p>Subscreeper 이메일 알림이 정상적으로 설정되었습니다.</p>
        </div>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
