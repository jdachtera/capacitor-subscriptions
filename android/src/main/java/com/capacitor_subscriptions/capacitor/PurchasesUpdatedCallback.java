package com.capacitor_subscriptions.capacitor;

import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.Purchase;

import java.util.List;
@FunctionalInterface
public interface PurchasesUpdatedCallback {
    void call (BillingResult billingResult, List<Purchase> purchases);


}
