import { WebPlugin } from '@capacitor/core';
import type { AppleTransaction, GoogleTransaction, Product, SubscriptionsPlugin, Transaction } from './definitions';
export declare class SubscriptionsWeb extends WebPlugin implements SubscriptionsPlugin {
    setGoogleVerificationDetails(options: {
        googleVerifyEndpoint: string;
        bid: string;
    }): void;
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    getProductDetails(options: {
        productIdentifier: string;
    }): Promise<Product>;
    purchaseProduct(options: {
        productIdentifier: string;
        appAccountToken?: string;
    }): Promise<AppleTransaction>;
    purchaseProduct(options: {
        productIdentifier: string;
        obfuscatedAccountId?: string;
    }): Promise<GoogleTransaction>;
    acknowledgePurchase(options: {
        purchaseToken: string;
    }): Promise<void>;
    getCurrentEntitlements(): Promise<{
        entitlements: Transaction[];
    }>;
    getLatestTransaction(options: {
        productIdentifier: string;
    }): Promise<Transaction>;
    manageSubscriptions(): void;
}
