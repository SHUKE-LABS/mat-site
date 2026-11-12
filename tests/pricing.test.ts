import { describe, expect, it } from 'vitest';
import { priceCents, priceQuote } from '../src/config/pricing';

const date = (value: string) => new Date(value);

describe('Personal Copy price rule', () => {
  it('keeps the launch price through the first month boundary', () => {
    expect(priceCents(date('2026-11-11T23:59:59.999Z'), '2026-11-12')).toBe(500);
    expect(priceCents(date('2026-11-12T00:00:00.000Z'), '2026-11-12')).toBe(500);
    expect(priceCents(date('2026-12-11T23:59:59.999Z'), '2026-11-12')).toBe(500);
    expect(priceCents(date('2026-12-12T00:00:00.000Z'), '2026-11-12')).toBe(600);
  });

  it('clamps a day-31 anniversary to the last day of shorter months', () => {
    expect(priceCents(date('2027-02-27T23:59:59.999Z'), '2027-01-31')).toBe(500);
    expect(priceCents(date('2027-02-28T00:00:00.000Z'), '2027-01-31')).toBe(600);
    expect(priceCents(date('2027-03-30T23:59:59.999Z'), '2027-01-31')).toBe(600);
    expect(priceCents(date('2027-03-31T00:00:00.000Z'), '2027-01-31')).toBe(700);
  });

  it('uses UTC and caps the price at $99.99', () => {
    expect(priceCents(date('2026-12-11T23:59:59.999Z'), '2026-11-12')).toBe(500);
    expect(priceCents(date('2026-12-11T19:00:00.000-05:00'), '2026-11-12')).toBe(600);

    expect(priceQuote(date('2033-12-31T00:00:00.000Z'), '2026-01-31')).toEqual({
      price_cents: 9999,
      next_price_cents: 9999,
      next_change: null,
    });
  });
});
