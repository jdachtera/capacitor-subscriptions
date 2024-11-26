import type { PluginListenerHandle } from '@capacitor/core';

export interface SubscriptionsPlugin {
  /**
   * A test method which just returns what is passed in
   */
  echo(options: { value: string }): Promise<{ value: string }>;

  /**
   * Receives a product ID and returns the product details
   */
  getProductDetails(options: { productIdentifier: string }): Promise<Product>;

  /**
   * Receives the product ID which the user wants to purchase and returns the transaction ID
   */
  purchaseProduct(options: { productIdentifier: string; appAccountToken?: string }): Promise<AppleTransaction>;
  purchaseProduct(options: { productIdentifier: string; obfuscatedAccountId?: string }): Promise<GoogleTransaction>;
  purchaseProduct(options: { productIdentifier: string }): Promise<Transaction>;

  getCurrentEntitlements(): Promise<{ entitlements: Transaction[] }>;

  getLatestTransaction(options: { productIdentifier: string }): Promise<Transaction>;

  manageSubscriptions(): any;

  acknowledgePurchase(options: { purchaseToken: string }): Promise<void>;

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

// Response data types

export interface Product {
  productIdentifier: string;
  price: string;
  displayName: string;
  description: string;
}

export type BaseTransaction = {
  productIdentifier: string;
  expiryDate: string;
  originalId: string;
  transactionId: string;
  originalStartDate: string;
  isTrial?: boolean;
};

export type AppleTransaction = BaseTransaction & {
  appAccountToken: string;
};

export type GoogleTransaction = BaseTransaction & {
  isAcknowledged: boolean;
  purchaseToken: string;
  obfuscatedAccountId?: string;
};

export type Transaction = AppleTransaction | GoogleTransaction;

export type AndroidPurchasedTrigger =
  | { successful: true; data: GoogleTransaction }
  | { successful: false; data: never };
