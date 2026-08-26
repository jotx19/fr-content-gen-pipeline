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

function mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'none';
  }
}

function isActiveSubscription(status: Stripe.Subscription.Status): boolean {
  return status === 'active' || status === 'trialing';
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const end =
    subscription.items.data[0]?.current_period_end ??
    (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  return end ? new Date(end * 1000) : null;
}

function subscriptionInterval(subscription: Stripe.Subscription): BillingInterval {
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  return interval === 'year' ? 'year' : 'month';
}

async function syncUserFromSubscription(
  userId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const pro = isActiveSubscription(subscription.status);

  await User.findByIdAndUpdate(userId, {
    $set: {
      plan: pro ? ('pro' as UserPlan) : ('free' as UserPlan),
      subscriptionStatus: mapSubscriptionStatus(subscription.status),
      stripeSubscriptionId: pro ? subscription.id : null,
      subscriptionInterval: pro ? subscriptionInterval(subscription) : null,
      currentPeriodEnd: pro ? subscriptionPeriodEnd(subscription) : null,
      updatedAt: new Date(),
    },
  });
}

async function findUserIdForSubscription(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) return null;

  const user = await User.findOne({
    $or: [{ stripeCustomerId: customerId }, { stripeSubscriptionId: subscription.id }],
  });
  return user?._id.toString() ?? null;
}

async function assertRecurringPrice(priceId: string, interval: BillingInterval): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  const price = await stripe.prices.retrieve(priceId);
  if (price.type !== 'recurring') {
    throw new Error(
      `Stripe price for ${interval}ly plan must be recurring. ` +
        'In Stripe Dashboard create a product with a Recurring price (monthly or yearly).',
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

  await assertRecurringPrice(priceId, interval);

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
    mode: 'subscription',
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

export async function createBillingPortalSession(userId: string) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Billing is not configured');
  }

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (!user.stripeCustomerId) {
    throw new Error('No billing account found. Subscribe to Pro first.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${config.clientUrl}/dashboard`,
  });

  return { url: session.url };
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
  signature: string | undefined,
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
      if (!userId) break;

      if (session.mode === 'subscription' && session.subscription) {
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncUserFromSubscription(userId, subscription);
        break;
      }

      if (session.mode === 'payment' && session.payment_status === 'paid') {
        const interval: BillingInterval =
          session.metadata?.interval === 'year' ? 'year' : 'month';
        await applyOneTimePurchase(userId, interval);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = await findUserIdForSubscription(subscription);
      if (userId) await syncUserFromSubscription(userId, subscription);
      break;
    }
    default:
      break;
  }

  return { received: true as const };
}

export async function getBillingStatus(userId: string) {
  const user = await User.findById(userId);
  const usage = await getUsageStatus(userId);
  const { prices } = await getBillingPrices();
  const billingConfigured = isBillingConfigured();

  return {
    ...usage,
    billingConfigured,
    canManageBilling: Boolean(billingConfigured && user?.stripeCustomerId),
    prices,
  };
}
