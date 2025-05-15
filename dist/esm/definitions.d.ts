import type { PluginListenerHandle } from '@capacitor/core';
export interface SubscriptionsPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    /**
     * Fetch metadata for a single subscription product by its identifier.
     */
    getProductDetails(options: {
        productIdentifier: string;
    }): Promise<Product>;
    /**
     * Fetch metadata for multiple subscription products in one batch request.
     */
    getProductDetailsBatch(options: {
        productIds: string[];
    }): Promise<{
        products: Product[];
    }>;
    /**
     * Initiate a purchase flow for a subscription product.
     */
    purchaseProduct(options: {
        productIdentifier: string;
        appAccountToken?: string;
    }): Promise<AppleTransaction>;
    purchaseProduct(options: {
        productIdentifier: string;
        obfuscatedAccountId?: string;
        offerToken?: string;
    }): Promise<GoogleTransaction>;
    purchaseProduct(options: {
        productIdentifier: string;
    }): Promise<Transaction>;
    /**
     * Query all active entitlements (non-expired subscriptions).
     */
    getCurrentEntitlements(): Promise<{
        entitlements: Transaction[];
    }>;
    /**
     * Returns the most recent transaction for a given product identifier.
     */
    getLatestTransaction(options: {
        productIdentifier: string;
    }): Promise<Transaction>;
    /**
     * Opens the platform-native subscription management UI (App Store / Play Store).
     */
    manageSubscriptions(): any;
    /**
     * Acknowledge a Google Play purchase after processing.
     */
    acknowledgePurchase(options: {
        purchaseToken: string;
    }): Promise<void>;
    /**
     * Required for Google Play purchase validation via a server.
     */
    setGoogleVerificationDetails(options: {
        googleVerifyEndpoint: string;
        bid: string;
    }): void;
    addListener(eventName: 'ANDROID-PURCHASE-SUCCESS', listenerFunc: (response: GoogleTransaction) => void): Promise<PluginListenerHandle> & PluginListenerHandle;
    addListener(eventName: 'ANDROID-PURCHASE-ERROR', listenerFunc: () => void): Promise<PluginListenerHandle> & PluginListenerHandle;
}
export interface Product {
    id: string;
    baseProductId?: string;
    title: string;
    description: string;
    price: number;
    localizedPrice: string;
    currency?: string;
    type: 'subscription' | 'non-subscription';
    interval?: SubscriptionInterval;
    intervalCount?: number;
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
    offerToken?: string;
}
export type SubscriptionInterval = 'day' | 'week' | 'month' | 'year';
export interface BaseTransaction {
    productIdentifier: string;
    expiryDate: string;
    originalId: string;
    transactionId: string;
    originalStartDate: string;
    isTrial?: boolean;
}
export interface AppleTransaction extends BaseTransaction {
    appAccountToken: string;
}
export interface GoogleTransaction extends BaseTransaction {
    isAcknowledged: boolean;
    purchaseToken: string;
    obfuscatedAccountId?: string;
}
export type Transaction = AppleTransaction | GoogleTransaction;
export type AndroidPurchasedTrigger = {
    successful: true;
    data: GoogleTransaction;
} | {
    successful: false;
    data: never;
};
