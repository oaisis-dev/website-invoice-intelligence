const Stripe = require('stripe');
const https = require('https');

// Vercel: disable body parsing so we get the raw body for Stripe signature verification
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Send a Telegram message to Chris.
 * Uses raw https module — no SDK needed (matches meeting_intelligence pattern).
 */
function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHRIS_CHAT_ID || '8431835368';

  if (!token) {
    console.warn('[webhook] TELEGRAM_BOT_TOKEN not set — skipping notification');
    return Promise.resolve();
  }

  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            console.error('[webhook] Telegram API error:', res.statusCode, data);
            reject(new Error(`Telegram ${res.statusCode}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  // Read raw body (body parsing is disabled for signature verification)
  const rawBody = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.info('[webhook] Event received:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerName = session.customer_details?.name || 'Unknown';
        const customerEmail = session.customer_details?.email || '';
        const company = session.metadata?.company || '';

        // Count active subscriptions for founding slot number
        let slotNumber = '?';
        try {
          const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
          slotNumber = subs.data.length;
        } catch (e) {
          console.warn('[webhook] Could not count subscriptions:', e.message);
        }

        const msg =
          `<b>New II Customer</b>\n\n` +
          `${customerName}${company ? ` at ${company}` : ''}\n` +
          `${customerEmail}\n` +
          `$100/month\n\n` +
          `Founding slot <b>${slotNumber}/20</b> filled.`;

        await sendTelegram(msg).catch((e) =>
          console.error('[webhook] Telegram notification failed:', e.message)
        );

        console.info('[webhook] New customer processed:', customerEmail);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        let customerName = 'Unknown';
        let company = '';

        try {
          const customer = await stripe.customers.retrieve(sub.customer);
          customerName = customer.name || 'Unknown';
          company = customer.metadata?.company || '';
        } catch (e) {
          console.warn('[webhook] Could not fetch customer:', e.message);
        }

        const mrrLost = (sub.items?.data || []).reduce(
          (sum, item) => sum + ((item.plan?.amount || 0) * (item.quantity || 1)) / 100,
          0
        );

        const msg =
          `<b>Customer Churned</b>\n\n` +
          `${customerName}${company ? ` at ${company}` : ''}\n` +
          `MRR impact: <b>-$${mrrLost}</b>`;

        await sendTelegram(msg).catch((e) =>
          console.error('[webhook] Telegram notification failed:', e.message)
        );

        console.info('[webhook] Churn processed:', sub.customer);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        let customerName = 'Unknown';
        let company = '';

        try {
          const customer = await stripe.customers.retrieve(invoice.customer);
          customerName = customer.name || 'Unknown';
          company = customer.metadata?.company || '';
        } catch (e) {
          console.warn('[webhook] Could not fetch customer:', e.message);
        }

        const msg =
          `<b>Payment Failed</b>\n\n` +
          `${customerName}${company ? ` at ${company}` : ''}\n` +
          `Amount: $${(invoice.amount_due || 0) / 100}\n\n` +
          `Action needed.`;

        await sendTelegram(msg).catch((e) =>
          console.error('[webhook] Telegram notification failed:', e.message)
        );

        console.info('[webhook] Payment failure processed:', invoice.customer);
        break;
      }

      default:
        console.info('[webhook] Unhandled event type:', event.type);
    }
  } catch (err) {
    console.error('[webhook] Error processing event:', err.message);
    // Still return 200 to prevent Stripe retries for handler errors
  }

  return res.status(200).json({ received: true });
};
