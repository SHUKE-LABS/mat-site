export const DEFAULT_PRICE_LAUNCH_DATE = '2026-11-12';
export const PRICE_START_CENTS = 500;
export const PRICE_STEP_CENTS = 100;
export const PRICE_CAP_CENTS = 9999;

export const LEMON_SQUEEZY_STORE_ID = '428237';
export const LEMON_SQUEEZY_VARIANT_ID = '2064235';
export const SUPPORT_EMAIL = 'support@shukelabs.com';

export interface PriceQuote {
  price_cents: number;
  next_price_cents: number;
  next_change: string | null;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addCalendarMonths(date: Date, months: number): Date {
  const month = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(month / 12);
  const targetMonth = ((month % 12) + 12) % 12;
  const day = Math.min(date.getUTCDate(), daysInMonth(year, targetMonth));

  return new Date(
    Date.UTC(
      year,
      targetMonth,
      day,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

export function parseLaunchDate(value: string): Date {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error('PRICE_LAUNCH_DATE must be an ISO date (YYYY-MM-DD).');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error('PRICE_LAUNCH_DATE is not a valid calendar date.');
  }

  return date;
}

function wholeMonthsElapsed(now: Date, launch: Date): number {
  if (!Number.isFinite(now.getTime()) || now < launch) {
    return 0;
  }

  const candidate =
    (now.getUTCFullYear() - launch.getUTCFullYear()) * 12 +
    now.getUTCMonth() -
    launch.getUTCMonth();

  return now >= addCalendarMonths(launch, candidate) ? candidate : candidate - 1;
}

export function priceCents(now: Date, launchDate: string | Date): number {
  return priceQuote(now, launchDate).price_cents;
}

export function priceQuote(now: Date, launchDate: string | Date): PriceQuote {
  const launch =
    typeof launchDate === 'string' ? parseLaunchDate(launchDate) : launchDate;
  const elapsed = wholeMonthsElapsed(now, launch);
  const price = Math.min(PRICE_START_CENTS + elapsed * PRICE_STEP_CENTS, PRICE_CAP_CENTS);
  const atCap = price >= PRICE_CAP_CENTS;
  const nextChange = atCap ? null : addCalendarMonths(launch, elapsed + 1).toISOString();

  return {
    price_cents: price,
    next_price_cents: Math.min(price + PRICE_STEP_CENTS, PRICE_CAP_CENTS),
    next_change: nextChange,
  };
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatUtcDate(value: string | null): string {
  if (!value) {
    return 'the price cap';
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}
