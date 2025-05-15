import { WebPlugin } from '@capacitor/core';
export class SubscriptionsWeb extends WebPlugin {
    setGoogleVerificationDetails(options) {
        options;
        console.warn('setGoogleVerificationDetails is not supported on web');
    }
    async echo(options) {
        console.log('ECHO', options);
        return options;
    }
    async getProductDetails(options) {
        options;
        throw new Error('Subscriptions: getProductDetails is not available on web.');
    }
    async getProductDetailsBatch(options) {
        options;
        throw new Error('Subscriptions: getProductDetailsBatch is not available on web.');
    }
    async purchaseProduct(options) {
        options;
        throw new Error('Subscriptions: purchaseProduct is not available on web.');
    }
    async getCurrentEntitlements() {
        return { entitlements: [] };
    }
    async getLatestTransaction(options) {
        options;
        throw new Error('Subscriptions: getLatestTransaction is not available on web.');
    }
    manageSubscriptions() {
        console.warn('Subscriptions: manageSubscriptions is not available on web.');
    }
    async acknowledgePurchase(options) {
        options;
        throw new Error('Subscriptions: acknowledgePurchase is not available on web.');
    }
    addListener(eventName, _listenerFunc) {
        console.warn(`Subscriptions: addListener(${eventName}) is not supported on web`);
        return Promise.resolve({ remove: () => { } });
    }
}
//# sourceMappingURL=web.js.map