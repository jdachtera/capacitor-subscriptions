'use strict';

var core = require('@capacitor/core');

const Subscriptions = core.registerPlugin('Subscriptions', {
    web: () => Promise.resolve().then(function () { return web; }).then(m => new m.SubscriptionsWeb()),
});

class SubscriptionsWeb extends core.WebPlugin {
    setGoogleVerificationDetails(options) {
    }
    async echo(options) {
        console.log('ECHO', options);
        return options;
    }
    async getProductDetails(options) {
        throw new Error('Method not implemented.');
    }
    async purchaseProduct(options) {
        throw new Error('Method not implemented.');
    }
    async acknowledgePurchase(options) {
        throw new Error('Method not implemented.');
    }
    async getCurrentEntitlements() {
        throw new Error('Method not implemented.');
    }
    async getLatestTransaction(options) {
        throw new Error('Method not implemented.');
    }
    manageSubscriptions() { }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SubscriptionsWeb: SubscriptionsWeb
});

exports.Subscriptions = Subscriptions;
//# sourceMappingURL=plugin.cjs.js.map
