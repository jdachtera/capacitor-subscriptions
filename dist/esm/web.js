import { WebPlugin } from '@capacitor/core';
export class SubscriptionsWeb extends WebPlugin {
    setGoogleVerificationDetails(options) {
        options;
    }
    async echo(options) {
        console.log('ECHO', options);
        return options;
    }
    async getProductDetails(options) {
        options;
        throw new Error('Method not implemented.');
    }
    async purchaseProduct(options) {
        options;
        throw new Error('Method not implemented.');
    }
    async acknowledgePurchase(options) {
        options;
        throw new Error('Method not implemented.');
    }
    async getCurrentEntitlements() {
        throw new Error('Method not implemented.');
    }
    async getLatestTransaction(options) {
        options;
        throw new Error('Method not implemented.');
    }
    manageSubscriptions() { }
}
//# sourceMappingURL=web.js.map