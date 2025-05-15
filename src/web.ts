import { PluginListenerHandle, WebPlugin } from '@capacitor/core';

import type { AppleTransaction, GoogleTransaction, Product, SubscriptionsPlugin, Transaction } from './definitions';

export class SubscriptionsWeb extends WebPlugin implements SubscriptionsPlugin {
  setGoogleVerificationDetails(options: { googleVerifyEndpoint: string; bid: string }): void {
    options;
    console.warn('setGoogleVerificationDetails is not supported on web');
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async getProductDetails(options: { productIdentifier: string }): Promise<Product> {
    options;
    throw new Error('Subscriptions: getProductDetails is not available on web.');
  }

  async getProductDetailsBatch(options: { productIds: string[] }): Promise<{ products: Product[] }> {
    options;
    throw new Error('Subscriptions: getProductDetailsBatch is not available on web.');
  }

  purchaseProduct(options: { productIdentifier: string; appAccountToken?: string }): Promise<AppleTransaction>;
  purchaseProduct(options: { productIdentifier: string; obfuscatedAccountId?: string }): Promise<GoogleTransaction>;
  async purchaseProduct(options: { productIdentifier: string }): Promise<Transaction> {
    options;
    throw new Error('Subscriptions: purchaseProduct is not available on web.');
  }

  async getCurrentEntitlements(): Promise<{ entitlements: Transaction[] }> {
    return { entitlements: [] };
  }

  async getLatestTransaction(options: { productIdentifier: string }): Promise<Transaction> {
    options;
    throw new Error('Subscriptions: getLatestTransaction is not available on web.');
  }

  manageSubscriptions(): void {
    console.warn('Subscriptions: manageSubscriptions is not available on web.');
  }

  async acknowledgePurchase(options: { purchaseToken: string }): Promise<void> {
    options;
    throw new Error('Subscriptions: acknowledgePurchase is not available on web.');
  }

  addListener(
    eventName: 'ANDROID-PURCHASE-SUCCESS',
    listenerFunc: (response: GoogleTransaction) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  addListener(
    eventName: 'ANDROID-PURCHASE-ERROR',
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  addListener(
    eventName: string,
    _listenerFunc: (...args: any[]) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    console.warn(`Subscriptions: addListener(${eventName}) is not supported on web`);
    return Promise.resolve({ remove: () => {} }) as any;
  }
}
