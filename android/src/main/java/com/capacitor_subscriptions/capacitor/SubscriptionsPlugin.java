package com.capacitor_subscriptions.capacitor;

import android.content.Intent;
import android.net.Uri;

import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Subscriptions")
public class SubscriptionsPlugin extends Plugin {

    private Subscriptions implementation;
    // This listener is fired upon completing the billing flow, it is vital
    // to call the acknowledgePurchase
    // method on the billingClient, with the purchase token otherwise Google
    // will automatically cancel the subscription
    // shortly after the purchase
    private final PurchasesUpdatedListener purchasesUpdatedListener
            = (billingResult, purchases) -> {

                Purchase purchase = implementation.findPendingPurchase(billingResult,
                        purchases);

                JSObject response = new JSObject();

                if (purchase != null) {
                    JSObject data = implementation.serializePurchase(purchase);
                    notifyListeners("ANDROID-PURCHASE-SUCCESS", response);
                    return;
                }

                notifyListeners("ANDROID-PURCHASE-SUCCESS", response);

            };

    public SubscriptionsPlugin() {

    }

    @Override
    public void load() {

        BillingClientEventEmitter billingClientEventEmitter
                = new BillingClientEventEmitter(getContext());

        billingClientEventEmitter.addListener(this.purchasesUpdatedListener);
        implementation = new Subscriptions(this.getActivity(),
                billingClientEventEmitter);

    }

    @PluginMethod
    public void setGoogleVerificationDetails(PluginCall call) {
        String googleVerifyEndpoint = call.getString("googleVerifyEndpoint");
        String bid = call.getString("bid");

        if (googleVerifyEndpoint != null && bid != null) {
            implementation.setGoogleVerificationDetails(googleVerifyEndpoint,
                    bid);
        } else {
            call.reject("Missing required parameters");
        }
    }

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", implementation.echo(value));
        call.resolve(ret);
    }

    @PluginMethod
    public void getProductDetails(PluginCall call) {

        String productIdentifier = call.getString("productIdentifier");

        if (productIdentifier == null) {
            call.reject("Must provide a productID");
        }

        implementation.getProductDetails(productIdentifier, call);

    }

    @PluginMethod
    public void purchaseProduct(PluginCall call) {

        String productIdentifier = call.getString("productIdentifier");
        String obfuscatedAccountId = call.getString("obfuscatedAccountId");

        if (productIdentifier == null) {
            call.reject("Must provide a productID");
        }

        implementation.purchaseProduct(productIdentifier, obfuscatedAccountId,
                 call);

    }

    @PluginMethod
    public void acknowledgePurchase(PluginCall call) {

        String purchaseToken = call.getString("purchaseToken");

        if (purchaseToken == null) {
            call.reject("Must provide a purchaseToken");
        }

        implementation.acknowledgePurchase(purchaseToken, call);

    }

    @PluginMethod
    public void getLatestTransaction(PluginCall call) {

        String productIdentifier = call.getString("productIdentifier");

        if (productIdentifier == null) {
            call.reject("Must provide a productID");
        }

        implementation.getLatestTransaction(productIdentifier, call);

    }

    @PluginMethod
    public void getCurrentEntitlements(PluginCall call) {

        implementation.getCurrentEntitlements(call);

    }

    @PluginMethod
    public void manageSubscriptions(PluginCall call) {

        String productIdentifier = call.getString("productIdentifier");
        String bid = call.getString("bid");

        if (productIdentifier == null) {
            call.reject("Must provide a productID");
        }

        if (bid == null) {
            call.reject("Must provide a bundleID");
        }

        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(
                "https://play.google" + ".com/store/account/subscriptions?sku"
                + "=" + productIdentifier + "&package=" + bid));
        getActivity().startActivity(browserIntent);
    }

}
