package com.capacitor_subscriptions.capacitor;

import android.content.Context;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.PurchasesUpdatedListener;

import java.util.ArrayList;

public class BillingClientEventEmitter {

    private final ArrayList<PurchasesUpdatedListener> listeners =
            new ArrayList<>();
    private BillingClient billingClient = null;
    private PurchasesUpdatedListener exclusiveListenerOnce = null;

    public BillingClientEventEmitter(Context context) {
        PurchasesUpdatedListener purchasesUpdatedListener = (billingResult,
                                                             purchases) -> {
            if (exclusiveListenerOnce != null) {
                exclusiveListenerOnce.onPurchasesUpdated(billingResult,
                        purchases);
                exclusiveListenerOnce = null;
            } else {
                for (int i = 0; i < listeners.size(); i++) {
                    PurchasesUpdatedListener listener = listeners.get(i);
                    listener.onPurchasesUpdated(billingResult, purchases);
                }
            }
        };
        this.billingClient = BillingClient.newBuilder(context)
                .setListener(purchasesUpdatedListener)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder()
                        .enableOneTimeProducts().build()).build();
    }

    public BillingClient getBillingClient() {
        return billingClient;
    }

    public void addListener(PurchasesUpdatedListener listener) {
        listeners.add(listener);
    }

    public void removeListener(PurchasesUpdatedListener listener) {
        listeners.remove(listener);
    }

    public void addExclusiveListenerOnce(PurchasesUpdatedListener listener) {
        exclusiveListenerOnce = listener;
    }
}
