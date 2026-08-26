import Stripe from 'stripe';
import { User, type SubscriptionStatus, type UserPlan } from '../../app/db/schemas/user.schema.js';
import { config } from '../../config.js';
import { getUsageStatus } from './freemium.js';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!config.stripeSecretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripeSecretKey);
  }
  return stripeClient;
}

export function isBillingConfigured(): boolean {
  return Boolean(
    config.stripeSecretKey &&
      isStripePriceId(config.stripePriceMonthly) &&
      isStripePriceId(config.stripePriceYearly),
  );
}

export type BillingInterval = 'month' | 'year';

export type BillingPrices = {
  monthly: { amount: number; currency: string; interval: 'month' };
  yearly: { amount: number; currency: string; interval: 'year'; savePercent: number };
};

function isStripePriceId(value: string): boolean {
  return value.startsWith('price_');
}

function savePercent(monthly: number, yearly: number): number {
  const annualAtMonthly = monthly * 12;
  if (annualAtMonthly <= 0) return 0;
  return Math.max(0, Math.round((1 - yearly / annualAtMonthly) * 100));
}

let cachedStripePrices: { fetchedAt: number; prices: BillingPrices } | null = null;
const STRIPE_PRICE_CACHE_MS = 5 * 60 * 1000;

async function fetchStripeDisplayPrices(): Promise<BillingPrices | null> {
  const stripe = getStripe();
  const monthlyId = config.stripePriceMonthly;
  const yearlyId = config.stripePriceYearly;
  if (!stripe || !isStripePriceId(monthlyId) || !isStripePriceId(yearlyId)) {
    return null;
  }

  if (cachedStripePrices && Date.now() - cachedStripePrices.fetchedAt < STRIPE_PRICE_CACHE_MS) {
    return cachedStripePrices.prices;
  }

  const [monthlyPrice, yearlyPrice] = await Promise.all([
    stripe.prices.retrieve(monthlyId),
    stripe.prices.retrieve(yearlyId),
  ]);

  const monthlyAmount =
    monthlyPrice.unit_amount != null ? monthlyPrice.unit_amount / 100 : config.billingPriceMonthly;
  const yearlyAmount =
    yearlyPrice.unit_amount != null ? yearlyPrice.unit_amount / 100 : config.billingPriceYearly;
  const currency = (monthlyPrice.currency || config.billingPriceCurrency).toLowerCase();

  const prices: BillingPrices = {
    monthly: { amount: monthlyAmount, currency, interval: 'month' },
    yearly: {
      amount: yearlyAmount,
      currency,
      interval: 'year',
      savePercent: savePercent(monthlyAmount, yearlyAmount),
    },
  };

  cachedStripePrices = { fetchedAt: Date.now(), prices };
  return prices;
}

export async function getBillingPrices(): Promise<{
  prices: BillingPrices;
  limits: { readingSessionsPerDay: number; writingSessionsPerDay: number };
}> {
  const fromStripe = await fetchStripeDisplayPrices();
  if (fromStripe) {
    return {
      prices: fromStripe,
      limits: {
        readingSessionsPerDay: config.freemiumReadingPerDay,
        writingSessionsPerDay: config.freemiumWritingPerDay,
      },
    };
  }

  const monthly = config.billingPriceMonthly;
  const yearly = config.billingPriceYearly;
  const currency = config.billingPriceCurrency;

  return {
    prices: {
      monthly: { amount: monthly, currency, interval: 'month' },
      yearly: {
        amount: yearly,
        currency,
        interval: 'year',
        savePercent: savePercent(monthly, yearly),
      },
    },
    limits: {
      readingSessionsPerDay: config.freemiumReadingPerDay,
      writingSessionsPerDay: config.freemiumWritingPerDay,
    },
  };
}

function accessPeriodEnd(interval: BillingInterval): Date {
  const days =
    interval === 'year' ? config.billingAccessDaysYearly : config.billingAccessDaysMonthly;
  const end = new Date();
  end.setDate(end.getDate() + days);
  return end;
}

async function assertOneTimePrice(priceId: string, interval: BillingInterval): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  const price = await stripe.prices.retrieve(priceId);
  if (price.type !== 'one_time') {
    throw new Error(
      `Stripe price for ${interval}ly plan must be one-time (not recurring). ` +
        'In Stripe Dashboard create a product with a One time price.',
    );
  }
}

export async function createCheckoutSession(userId: string, interval: BillingInterval) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Billing is not configured');
  }

  const priceId = interval === 'year' ? config.stripePriceYearly : config.stripePriceMonthly;
  if (!priceId || !isStripePriceId(priceId)) {
    throw new Error(`Missing Stripe price ID for ${interval}ly plan`);
  }

  await assertOneTimePrice(priceId, interval);

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user._id.toString() },
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    user.updatedAt = new Date();
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.clientUrl}/learn?billing=success`,
    cancel_url: `${config.clientUrl}/learn?billing=cancel`,
    metadata: {
      userId: user._id.toString(),
      interval,
    },
  });

  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(_userId: string) {
  throw new Error('Billing portal is not available for one-time purchases');
}

async function applyOneTimePurchase(userId: string, interval: BillingInterval): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $set: {
      plan: 'pro' as UserPlan,
      subscriptionStatus: 'active' as SubscriptionStatus,
      stripeSubscriptionId: null,
      subscriptionInterval: interval,
      currentPeriodEnd: accessPeriodEnd(interval),
      updatedAt: new Date(),
    },
  });
}

export async function handleStripeWebhook(
  rawBody: Buffer | string,
  signature: string | undefined
) {
  const stripe = getStripe();
  if (!stripe || !config.stripeWebhookSecret) {
    throw new Error('Stripe webhook not configured');
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature ?? '', config.stripeWebhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || session.mode !== 'payment' || session.payment_status !== 'paid') {
        break;
      }
      const interval: BillingInterval =
        session.metadata?.interval === 'year' ? 'year' : 'month';
      await applyOneTimePurchase(userId, interval);
      break;
    }
    default:
      break;
  }

  return { received: true as const };
}

export async function getBillingStatus(userId: string) {
  const usage = await getUsageStatus(userId);
  const { prices } = await getBillingPrices();
  return {
    ...usage,
    billingConfigured: isBillingConfigured(),
    prices,
  };
}
