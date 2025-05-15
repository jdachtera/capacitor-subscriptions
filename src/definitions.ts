import type { PluginListenerHandle } from '@capacitor/core';

export interface SubscriptionsPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;

  /**
   * Fetch metadata for a single subscription product by its identifier.
   */
  getProductDetails(options: { productIdentifier: string }): Promise<Product>;

  /**
   * Fetch metadata for multiple subscription products in one batch request.
   */
  getProductDetailsBatch(options: { productIds: string[] }): Promise<{ products: Product[] }>;

  /**
   * Initiate a purchase flow for a subscription product.
   */
  purchaseProduct(options: { productIdentifier: string; appAccountToken?: string }): Promise<AppleTransaction>;
  purchaseProduct(options: {
    productIdentifier: string;
    obfuscatedAccountId?: string;
    offerToken?: string;
  }): Promise<GoogleTransaction>;
  purchaseProduct(options: { productIdentifier: string }): Promise<Transaction>;

  /**
   * Query all active entitlements (non-expired subscriptions).
   */
  getCurrentEntitlements(): Promise<{ entitlements: Transaction[] }>;

  /**
   * Returns the most recent transaction for a given product identifier.
   */
  getLatestTransaction(options: { productIdentifier: string }): Promise<Transaction>;

  /**
   * Opens the platform-native subscription management UI (App Store / Play Store).
   */
  manageSubscriptions(): any;

  /**
   * Acknowledge a Google Play purchase after processing.
   */
  acknowledgePurchase(options: { purchaseToken: string }): Promise<void>;

  /**
   * Required for Google Play purchase validation via a server.
   */
  setGoogleVerificationDetails(options: { googleVerifyEndpoint: string; bid: string }): void;

  addListener(
    eventName: 'ANDROID-PURCHASE-SUCCESS',
    listenerFunc: (response: GoogleTransaction) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  addListener(
    eventName: 'ANDROID-PURCHASE-ERROR',
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
}

export interface Product {
  id: string;
  baseProductId?: string; // Google Play only
  title: string;
  description: string;
  price: number; // raw numeric price
  localizedPrice: string; // formatted, e.g. "€9.99"
  currency?: string; // Stripe/Google only, not on iOS
  type: 'subscription' | 'non-subscription';
  interval?: SubscriptionInterval;
  intervalCount?: number; // e.g. every 3 months

  hasIntroOffer?: boolean;
  introPrice?: number;
  introPriceString?: string;
  introPeriod?: SubscriptionInterval;
  introPeriodCount?: number;

  hasFreeTrial?: boolean;
  trialPeriod?: SubscriptionInterval;
  trialPeriodCount?: number;

  subscriptionGroup?: string;
  isFamilyShareable?: boolean;
  source: 'apple' | 'google' | 'stripe';
  offerToken?: string; // Google Play offer token
}

// Supported billing intervals (mirrors StoreKit and Google BillingClient)
export type SubscriptionInterval = 'day' | 'week' | 'month' | 'year';

// Platform-independent base structure for all transactions
export interface BaseTransaction {
  productIdentifier: string;
  expiryDate: string;
  originalId: string;
  transactionId: string;
  originalStartDate: string;
  isTrial?: boolean;
}

// Apple-specific transaction extension
export interface AppleTransaction extends BaseTransaction {
  appAccountToken: string;
}

// Google-specific transaction extension
export interface GoogleTransaction extends BaseTransaction {
  isAcknowledged: boolean;
  purchaseToken: string;
  obfuscatedAccountId?: string;
}

// Union type for handling transactions generically
export type Transaction = AppleTransaction | GoogleTransaction;

// Purchase result trigger used in listeners
export type AndroidPurchasedTrigger =
  | { successful: true; data: GoogleTransaction }
  | { successful: false; data: never };
