'use strict';

var core = require('@capacitor/core');

const Subscriptions = core.registerPlugin('Subscriptions', {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.SubscriptionsWeb()),
});

class SubscriptionsWeb extends core.WebPlugin {
    setGoogleVerificationDetails(options) {
        console.warn('setGoogleVerificationDetails is not supported on web');
    }
    async echo(options) {
        console.log('ECHO', options);
        return options;
    }
    async getProductDetails(options) {
        throw new Error('Subscriptions: getProductDetails is not available on web.');
    }
    async getProductDetailsBatch(options) {
        throw new Error('Subscriptions: getProductDetailsBatch is not available on web.');
    }
    async purchaseProduct(options) {
        throw new Error('Subscriptions: purchaseProduct is not available on web.');
    }
    async getCurrentEntitlements() {
        return { entitlements: [] };
    }
    async getLatestTransaction(options) {
        throw new Error('Subscriptions: getLatestTransaction is not available on web.');
    }
    manageSubscriptions() {
        console.warn('Subscriptions: manageSubscriptions is not available on web.');
    }
    async acknowledgePurchase(options) {
        throw new Error('Subscriptions: acknowledgePurchase is not available on web.');
    }
    addListener(eventName, _listenerFunc) {
        console.warn(`Subscriptions: addListener(${eventName}) is not supported on web`);
        return Promise.resolve({ remove: () => { } });
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SubscriptionsWeb: SubscriptionsWeb
});

exports.Subscriptions = Subscriptions;
//# sourceMappingURL=plugin.cjs.js.map
