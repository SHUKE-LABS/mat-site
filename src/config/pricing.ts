// Single source of truth for My AI Team's live plans and LemonSqueezy
// checkout. The shukelabs.com site mirrors this file by hand, so the two
// surfaces can drift between syncs. Pages render from these constants so
// prices, device caps, and links stay in step.

export interface Plan {
  label: string;
  price: string;
  period: string;
  deviceLimit: number;
  checkoutUrl: string;
}

export const LEMONSQUEEZY_CHECKOUT =
  'https://shukelabs.lemonsqueezy.com/checkout/buy/bf6b12fb-ac4f-4d08-a22c-977c191b1361';

export const plans: Plan[] = [
  {
    label: 'Personal',
    price: '$99.99',
    period: '/ year (USD)',
    deviceLimit: 3,
    checkoutUrl: LEMONSQUEEZY_CHECKOUT,
  },
  {
    label: 'Team',
    price: '$249.99',
    period: '/ year (USD)',
    deviceLimit: 10,
    checkoutUrl: LEMONSQUEEZY_CHECKOUT,
  },
  {
    label: 'Business',
    price: '$499.99',
    period: '/ year (USD)',
    deviceLimit: 25,
    checkoutUrl: LEMONSQUEEZY_CHECKOUT,
  },
];
