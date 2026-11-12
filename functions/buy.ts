import {
  LEMON_SQUEEZY_STORE_ID,
  LEMON_SQUEEZY_VARIANT_ID,
  SUPPORT_EMAIL,
  priceQuote,
} from '../src/config/pricing';

interface PagesEnvironment {
  LEMON_SQUEEZY_API_KEY?: string;
  PRICE_LAUNCH_DATE?: string;
}

interface BuyRequestContext {
  env: PagesEnvironment;
}

interface CheckoutResponse {
  data?: {
    attributes?: {
      url?: unknown;
    };
  };
}

const CHECKOUT_ENDPOINT = 'https://api.lemonsqueezy.com/v1/checkouts';
const CHECKOUT_LIFETIME_MS = 24 * 60 * 60 * 1000;
const NO_STORE = 'no-store';

function errorResponse(status: number): Response {
  const body = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Checkout unavailable</title></head>
  <body>
    <h1>Checkout unavailable</h1>
    <p>We could not start checkout. Please try again or contact
      <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  </body>
</html>`;

  return new Response(body, {
    status,
    headers: {
      'Cache-Control': NO_STORE,
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

function checkoutUrl(body: unknown): string | null {
  const url = (body as CheckoutResponse)?.data?.attributes?.url;
  if (typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export async function onRequestGet({ env }: BuyRequestContext): Promise<Response> {
  const apiKey = env.LEMON_SQUEEZY_API_KEY?.trim();
  const launchDate = env.PRICE_LAUNCH_DATE?.trim();
  if (!apiKey || !launchDate) {
    return errorResponse(500);
  }

  const now = new Date();
  let quote;
  try {
    quote = priceQuote(now, launchDate);
  } catch {
    return errorResponse(500);
  }

  const payload = {
    data: {
      type: 'checkouts',
      attributes: {
        custom_price: quote.price_cents,
        product_options: {
          enabled_variants: [Number(LEMON_SQUEEZY_VARIANT_ID)],
        },
        expires_at: new Date(now.getTime() + CHECKOUT_LIFETIME_MS).toISOString(),
      },
      relationships: {
        store: {
          data: { type: 'stores', id: LEMON_SQUEEZY_STORE_ID },
        },
        variant: {
          data: { type: 'variants', id: LEMON_SQUEEZY_VARIANT_ID },
        },
      },
    },
  };

  let response: Response;
  try {
    response = await fetch(CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return errorResponse(502);
  }

  if (!response.ok) {
    return errorResponse(502);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return errorResponse(502);
  }

  const url = checkoutUrl(body);
  if (!url) {
    return errorResponse(502);
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Cache-Control': NO_STORE,
      Location: url,
    },
  });
}
