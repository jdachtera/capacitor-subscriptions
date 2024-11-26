import { WebPlugin } from '@capacitor/core';

import type { AppleTransaction, GoogleTransaction, Product, SubscriptionsPlugin, Transaction } from './definitions';

export class SubscriptionsWeb extends WebPlugin implements SubscriptionsPlugin {
  setGoogleVerificationDetails(options: { googleVerifyEndpoint: string; bid: string }): void {
    options;
  }
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
  async getProductDetails(options: { productIdentifier: string }): Promise<Product> {
    options;
    throw new Error('Method not implemented.');
  }
  purchaseProduct(options: { productIdentifier: string; appAccountToken?: string }): Promise<AppleTransaction>;
  purchaseProduct(options: { productIdentifier: string; obfuscatedAccountId?: string }): Promise<GoogleTransaction>;
  async purchaseProduct(options: { productIdentifier: string }): Promise<Transaction> {
    options;
    throw new Error('Method not implemented.');
  }
  async acknowledgePurchase(options: { purchaseToken: string }): Promise<void> {
    options;
    throw new Error('Method not implemented.');
  }

  async getCurrentEntitlements(): Promise<{ entitlements: Transaction[] }> {
    throw new Error('Method not implemented.');
  }
  async getLatestTransaction(options: { productIdentifier: string }): Promise<Transaction> {
    options;
    throw new Error('Method not implemented.');
  }
  manageSubscriptions(): void {}
}
