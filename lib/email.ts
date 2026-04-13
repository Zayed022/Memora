// Email service using Resend (https://resend.com)
// Alternatively swap the fetch call for Nodemailer / SendGrid

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'Memora <hello@memora.app>'

interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('[email] no RESEND_API_KEY — skipping send to', payload.to)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from: FROM, ...payload }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[email] send failed:', err)
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Welcome to Memora — your AI second brain is ready',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'DM Sans', Georgia, sans-serif; background: #f7f6f2; margin: 0; padding: 40px 20px; }
  .card { max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; border: 1px solid #eeecea; }
  .logo { font-size: 24px; font-weight: 600; margin-bottom: 32px; }
  .logo span { color: #7340f5; }
  h1 { font-size: 28px; color: #1a1714; margin: 0 0 16px; font-weight: 500; }
  p { color: #5a5449; line-height: 1.7; margin: 0 0 16px; }
  .btn { display: inline-block; padding: 14px 28px; background: #1a1714; color: white; border-radius: 12px; text-decoration: none; font-weight: 500; margin: 24px 0; }
  .tip { background: #f3f0ff; border-radius: 12px; padding: 16px 20px; margin: 24px 0; }
  .tip-title { font-weight: 600; color: #361784; margin-bottom: 6px; }
  .tip p { color: #534AB7; margin: 0; font-size: 14px; }
  .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #eeecea; font-size: 12px; color: #928c82; }
</style></head>
<body>
  <div class="card">
    <div class="logo">mem<span>ora</span></div>
    <h1>Welcome, ${name || 'there'} 👋</h1>
    <p>Your AI second brain is ready. Every article, note, voice memo, or PDF you save will be automatically summarised, tagged, and connected to your existing knowledge.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Open your knowledge base →</a>
    <div class="tip">
      <div class="tip-title">💡 Quick start tip</div>
      <p>Save your first item in under 30 seconds — paste any URL into the "Add item" box and Memora will do the rest. Then ask the AI a question about it.</p>
    </div>
    <p>On the free plan you can save up to 50 items. <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="color:#7340f5">Upgrade to Pro</a> for unlimited access.</p>
    <div class="footer">
      <p>You're receiving this because you signed up at memora.app.<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#928c82">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
    text: `Welcome to Memora, ${name || 'there'}! Your AI second brain is ready at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
}

export async function sendWeeklyDigestEmail(
  email: string,
  name: string,
  digestContent: string,
  itemCount: number
): Promise<void> {
  const weekLabel = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(new Date())

  await sendEmail({
    to: email,
    subject: `Your Memora weekly digest — ${weekLabel}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'DM Sans', Georgia, sans-serif; background: #f7f6f2; margin: 0; padding: 40px 20px; }
  .card { max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; border: 1px solid #eeecea; }
  .logo { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
  .logo span { color: #7340f5; }
  .week { font-size: 12px; color: #928c82; margin-bottom: 32px; }
  h1 { font-size: 24px; color: #1a1714; margin: 0 0 24px; font-weight: 500; }
  .digest { background: #f7f6f2; border-radius: 12px; padding: 20px 24px; color: #47413a; line-height: 1.8; margin-bottom: 28px; }
  .stat { display: inline-block; background: #f3f0ff; color: #3C3489; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500; margin-bottom: 28px; }
  .btn { display: inline-block; padding: 12px 24px; background: #1a1714; color: white; border-radius: 10px; text-decoration: none; font-weight: 500; }
  .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #eeecea; font-size: 12px; color: #928c82; }
</style></head>
<body>
  <div class="card">
    <div class="logo">mem<span>ora</span></div>
    <div class="week">Weekly digest · ${weekLabel}</div>
    <h1>Here's what you learned this week</h1>
    <span class="stat">✦ ${itemCount} items saved</span>
    <div class="digest">${digestContent.replace(/\n/g, '<br>')}</div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Open your knowledge base →</a>
    <div class="footer">
      <p>You're on the Memora Pro plan.<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color:#928c82">Manage digest settings</a> · 
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#928c82">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
    text: `Your Memora weekly digest (${weekLabel})\n\n${digestContent}\n\nOpen your knowledge base: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
}

export async function sendUpgradeConfirmationEmail(email: string, name: string, plan: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: `You're now on Memora ${plan} 🎉`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'DM Sans', Georgia, sans-serif; background: #f7f6f2; margin: 0; padding: 40px 20px; }
  .card { max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; border: 1px solid #eeecea; }
  .logo { font-size: 22px; font-weight: 600; margin-bottom: 32px; }
  .logo span { color: #7340f5; }
  h1 { font-size: 26px; color: #1a1714; margin: 0 0 16px; }
  p { color: #5a5449; line-height: 1.7; margin: 0 0 16px; }
  .btn { display: inline-block; padding: 14px 28px; background: #7340f5; color: white; border-radius: 12px; text-decoration: none; font-weight: 500; margin: 16px 0; }
  .features li { color: #47413a; line-height: 2; }
</style></head>
<body>
  <div class="card">
    <div class="logo">mem<span>ora</span></div>
    <h1>You're on ${plan} 🎉</h1>
    <p>Thanks ${name || 'there'} — you now have full access to everything Memora offers.</p>
    <ul class="features">
      <li>✦ Unlimited items saved</li>
      <li>✦ Unlimited AI questions</li>
      <li>✦ Weekly digest emails</li>
      <li>✦ AI connection discovery</li>
      <li>✦ Browser extension</li>
      <li>✦ Voice memo transcription</li>
    </ul>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to your knowledge base →</a>
    <p>Manage your subscription anytime from <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color:#7340f5">Settings</a>.</p>
  </div>
</body>
</html>`,
  })
}
