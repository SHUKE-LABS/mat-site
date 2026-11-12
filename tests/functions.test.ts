import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestGet as buy } from '../functions/buy';
import { onRequestGet as price } from '../functions/price';

const env = {
  LEMON_SQUEEZY_API_KEY: 'test-api-key',
  PRICE_LAUNCH_DATE: '2026-11-12',
};

describe('Pages Functions', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T00:00:00.000Z'));
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('returns the live quote without allowing it to be cached', async () => {
    const response = await price({ env });

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      price_cents: 500,
      next_price_cents: 600,
      next_change: '2026-12-12T00:00:00.000Z',
    });
  });

  it('creates a custom-price checkout and redirects without caching it', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { attributes: { url: 'https://checkout.example/personal-copy' } } }),
        { status: 201 },
      ),
    );

    const response = await buy({ env });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://checkout.example/personal-copy');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe('https://api.lemonsqueezy.com/v1/checkouts');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Accept: 'application/vnd.api+json',
      Authorization: 'Bearer test-api-key',
      'Content-Type': 'application/vnd.api+json',
    });

    const payload = JSON.parse(String(init.body));
    expect(payload.data.attributes).toEqual({
      custom_price: 500,
      product_options: { enabled_variants: [2064235] },
      expires_at: '2026-11-13T00:00:00.000Z',
    });
    expect(payload.data.relationships).toEqual({
      store: { data: { type: 'stores', id: '428237' } },
      variant: { data: { type: 'variants', id: '2064235' } },
    });
  });

  it('shows the support page and makes no request when the API key is missing', async () => {
    const response = await buy({ env: { PRICE_LAUNCH_DATE: env.PRICE_LAUNCH_DATE } });

    expect(response.status).toBe(500);
    expect(await response.text()).toContain('support@shukelabs.com');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows the support page when Lemon Squeezy rejects the checkout', async () => {
    fetchMock.mockResolvedValue(new Response('upstream failure', { status: 500 }));

    const response = await buy({ env });

    expect(response.status).toBe(502);
    expect(await response.text()).toContain('support@shukelabs.com');
  });
});
