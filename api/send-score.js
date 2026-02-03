import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/** 발신 주소: Resend 도메인 인증 후 본인 도메인으로 변경 가능. 테스트는 onboarding@resend.dev 사용 */
const FROM_EMAIL = process.env.FROM_EMAIL || '일본어 퀴즈 <onboarding@resend.dev>';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST(request) {
  if (!process.env.RESEND_API_KEY) {
    return json({ error: 'RESEND_API_KEY is not configured' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { name, email, scoreText, message } = body;
  if (!name || !email || !scoreText) {
    return json({ error: 'name, email, scoreText are required' }, 400);
  }

  const html = `
    <h2>일본어 단어 퀴즈 성적 알림</h2>
    <p>안녕하세요, <strong>${escapeHtml(name)}</strong>님.</p>
    <p>일본어 단어 퀴즈 결과입니다.</p>
    <ul>
      <li><strong>점수:</strong> ${escapeHtml(scoreText)}</li>
      <li><strong>메시지:</strong> ${escapeHtml(message || '')}</li>
    </ul>
    <p>즐겁게 공부하세요!</p>
  `;

  const text = `안녕하세요, ${name}님.\n\n일본어 단어 퀴즈 결과입니다.\n\n점수: ${scoreText}\n메시지: ${message || ''}\n\n즐겁게 공부하세요!`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: '일본어 단어 퀴즈 성적 알림',
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return json({ error: error.message || 'Failed to send email' }, 500);
    }

    return json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('Send score email error:', err);
    return json({ error: err.message || 'Server error' }, 500);
  }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
