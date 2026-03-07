const Stripe = require('stripe');

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

  console.info('[checkout] POST received');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  if (!process.env.STRIPE_PRICE_ID) {
    console.error('STRIPE_PRICE_ID is not set');
    return res.status(500).json({ error: 'Product pricing not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const email = (body.email || '').trim().toLowerCase();
  const name = (body.name || '').trim();
  const company = (body.company || body.businessName || '').trim();

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Check for existing customer by email
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customer;

    if (existing.data.length > 0) {
      customer = existing.data[0];
      // Update name/company if provided
      if (name || company) {
        customer = await stripe.customers.update(customer.id, {
          ...(name && { name }),
          ...(company && { metadata: { ...customer.metadata, company } }),
        });
      }
      console.info('[checkout] Existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email,
        ...(name && { name }),
        metadata: { company: company || '', source: 'ii-landing' },
      });
      console.info('[checkout] New customer created:', customer.id);
    }

    // Determine success/cancel URLs
    const baseUrl = origin || 'https://invoiceoasis.com';

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success.html`,
      cancel_url: `${baseUrl}#pricing`,
      metadata: {
        company: company || '',
        source: 'ii-landing',
      },
    });

    console.info('[checkout] Session created:', session.id);
    return res.status(200).json({ ok: true, url: session.url, source: 'checkout-api' });
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
