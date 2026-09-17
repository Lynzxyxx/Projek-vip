// Vercel Serverless Function
// Endpoint: /api/notify
//
// Menerima { text } dari frontend, lalu meneruskannya ke Telegram bot admin.
// Bot token disimpan di Environment Variable (tidak pernah dikirim ke browser).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const { text } = req.body || {};

    if (!botToken || !chatId) {
      res.status(200).json({ status: 'skipped', reason: 'TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID belum diisi di env' });
      return;
    }
    if (!text) {
      res.status(400).json({ error: 'text kosong' });
      return;
    }

    const tgRes = await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🔔 SoraPay\n' + text
      })
    });

    const tgJson = await tgRes.json();
    res.status(200).json({ status: 'sent', telegram: tgJson.ok });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
