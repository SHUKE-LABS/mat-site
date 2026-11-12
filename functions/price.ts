import { priceQuote } from '../src/config/pricing';

interface PagesEnvironment {
  PRICE_LAUNCH_DATE?: string;
}

interface PriceRequestContext {
  env: PagesEnvironment;
}

const JSON_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

export async function onRequestGet({ env }: PriceRequestContext): Promise<Response> {
  if (!env.PRICE_LAUNCH_DATE) {
    return new Response(JSON.stringify({ error: 'Price configuration is unavailable.' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  try {
    const quote = priceQuote(new Date(), env.PRICE_LAUNCH_DATE);
    return new Response(JSON.stringify(quote), { headers: JSON_HEADERS });
  } catch {
    return new Response(JSON.stringify({ error: 'Price configuration is unavailable.' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
}
