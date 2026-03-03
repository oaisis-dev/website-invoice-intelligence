const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Invoice Intelligence <noreply@invoiceoasis.com>';
const TO = ['agent@openoaisis.com'];
const CC = ['chris@openoaisis.com'];

function cors(res, origin) {
  const allowed = [
    'https://www.invoiceoasis.com',
    'https://invoiceoasis.com',
    'http://localhost:8765',
    'http://localhost:3000',
    'http://127.0.0.1:8765',
    'http://127.0.0.1:3000',
  ];
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  cors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.info('[contact] POST received');
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const name = (body.name || '').trim();
  const businessName = (body.businessName || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const message = (body.message || '').trim();
  const demoRequested = !!body.demoRequested;

  if (!name || !businessName || !email) {
    return res.status(400).json({ error: 'Name, business name, and email are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${pad(now.getUTCMonth() + 1)}/${pad(now.getUTCDate())}/${now.getUTCFullYear()} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())} UTC`;
  const confirmation = demoRequested ? 'Yes, book a demo' : 'Contact only';

  const text = [
    `Name: ${name}`,
    `Business Name: ${businessName}`,
    `Business Email: ${email}`,
    `Message: ${message || '(none)'}`,
    `Demo requested: ${confirmation}`,
    `Submitted: ${timestamp}`,
  ].join('\n');

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO,
    cc: CC,
    replyTo: email,
    subject: 'Invoice Intelligence contact',
    text,
  });

  if (error) {
    console.error('[contact] Resend error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to send message' });
  }

  console.info('[contact] Resend sent id:', data?.id || '(no id)');
  return res.status(200).json({ ok: true, id: data?.id, source: 'contact-api' });
}
