package com.capacitor_subscriptions.capacitor;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import org.json.JSONArray;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

public class Subscriptions {

    private Activity activity = null;
    private BillingClientEventEmitter billingClientEventEmitter = null;

    private BillingClient billingClient = null;
    private int billingClientIsConnected = 0;

    private String googleVerifyEndpoint = "";
    private String googleBid = "";


    public Subscriptions(Activity activity,
                         BillingClientEventEmitter billingClientEventEmitter) {

        this.billingClientEventEmitter = billingClientEventEmitter;
        this.billingClient = billingClientEventEmitter.getBillingClient();
        this.activity = activity;
        this.billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    billingClientIsConnected = 1;
                } else {
                    billingClientIsConnected = billingResult.getResponseCode();
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Try to restart the connection on the next request to
                // Google Play by calling the startConnection() method.
            }
        });

    }

    public String echo(String value) {
        Log.i("Echo", value);
        return value;
    }

    public void setGoogleVerificationDetails(String googleVerifyEndpoint,
                                             String bid) {
        this.googleVerifyEndpoint = googleVerifyEndpoint;
        this.googleBid = bid;

        Log.i("SET-VERIFY", "Verification values updated");
    }

    public void getProductDetails(String productIdentifier, PluginCall call) {
        if (billingClientIsConnected == 1) {

            QueryProductDetailsParams.Product productToFind =
                    QueryProductDetailsParams.Product
                    .newBuilder().setProductId(productIdentifier)
                    .setProductType(BillingClient.ProductType.SUBS).build();

            QueryProductDetailsParams queryProductDetailsParams =
                    QueryProductDetailsParams
                    .newBuilder().setProductList(List.of(productToFind))
                    .build();

            billingClient.queryProductDetailsAsync(queryProductDetailsParams,
                    (billingResult, productDetailsList) -> {

                try {

                    ProductDetails productDetails = productDetailsList.get(0);
                    JSObject data = serializeProductDetails(productDetails);

                    call.resolve(data);

                } catch (Exception e) {
                    Log.e("Err", e.toString());
                    call.reject("Could not find a " + "product" + " matching "
                            + "the given " + "productIdentifier",
                            "PRODUCT_NOT_FOUND");
                }
            });
        } else if (billingClientIsConnected == 2) {
            call.reject("Android: BillingClient failed " + "to" + " " +
                    "initialise","BILLING_CLIENT_INIT_FAILED");
        } else {
            call.reject("Android: BillingClient is still " + "initialising",
                    "BILLING_CLIENT_INIT_PENDING");
        }
    }


    public void getLatestTransaction(String productIdentifier,
                                     PluginCall call) {

        JSObject response = new JSObject();

        if (billingClientIsConnected == 1) {

            QueryPurchasesParams queryPurchaseHistoryParams =
                    QueryPurchasesParams
                    .newBuilder().setProductType(BillingClient.ProductType.SUBS)
                    .build();


            billingClient.queryPurchasesAsync(queryPurchaseHistoryParams,
                    (BillingResult billingResult, List<Purchase> list) -> {

                // Try to loop through the list until we find a purchase
                // history record associated with the passed in
                // productIdentifier.
                // If we do, then set found to true to break out of the loop,
                // then compile a response with necessary data.
                // Otherwise compile
                // a response saying that the there were not transactions for
                // the given productIdentifier.
                int i = 0;
                boolean found = false;
                while (list != null && (i < list.size() && !found)) {
                    try {
                        Purchase currentPurchase = list.get(i);
                        if (currentPurchase.getProducts().get(0)
                                .equals(productIdentifier)) {
                            found = true;
                            JSObject data = serializePurchase(currentPurchase);

                            call.resolve(data);
                            return;
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        // This should never really be caught, but compile a
                        // response saying an unknown error occurred anyway.
                    }

                    i++;

                }
                call.reject("No transaction for " + "given" + " " +
                        "productIdentifier, or it could not " + "be" + " " +
                        "verified", "TRANSACTION_NOT_FOUND");
            });

        }

    }

    public void getCurrentEntitlements(PluginCall call) {
        if (billingClientIsConnected != 1) {
            call.reject("Billing client is not connected",
                    "BILLING_CLIENT_NOT_CONNECTED");
            return;
        }

        QueryPurchasesParams queryPurchasesParams = QueryPurchasesParams
                .newBuilder().setProductType(BillingClient.ProductType.SUBS)
                .build();

        billingClient.queryPurchasesAsync(queryPurchasesParams,
                (billingResult, purchaseList) -> {

            try {

                int amountOfPurchases = purchaseList.size();

                JSObject data = new JSObject();
                JSONArray entitlements = new JSONArray();
                data.put("entitlements", entitlements);

                if (amountOfPurchases > 0) {
                    for (int i = 0; i < purchaseList.size(); i++) {
                        Purchase currentPurchase = purchaseList.get(i);
                        entitlements.put(serializePurchase(currentPurchase));
                    }
                }

                call.resolve(data);
            } catch (Exception e) {
                call.reject("Couldn't get current entitlements",
                        "UNKNOWN_ERROR", e);
                Log.e("Error", e.toString());
            }
        });
    }

    public void purchaseProduct(String productIdentifier,
                                String obfuscatedAccountId, PluginCall call) {
        Log.i("SAZTUNES",
                "purchaseProduct" + billingClientIsConnected + " " + productIdentifier);

        if (billingClientIsConnected == 1) {

            QueryProductDetailsParams.Product productToFind =
                    QueryProductDetailsParams.Product
                    .newBuilder().setProductId(productIdentifier)
                    .setProductType(BillingClient.ProductType.SUBS).build();

            QueryProductDetailsParams queryProductDetailsParams =
                    QueryProductDetailsParams
                    .newBuilder().setProductList(List.of(productToFind))
                    .build();

            billingClient.queryProductDetailsAsync(queryProductDetailsParams,
                    (billingResult1, productDetailsList) -> {

                try {
                    ProductDetails productDetails = productDetailsList.get(0);
                    BillingFlowParams billingFlowParams = BillingFlowParams
                            .newBuilder()
                            .setObfuscatedAccountId(obfuscatedAccountId)
                            .setProductDetailsParamsList(List.of(BillingFlowParams.ProductDetailsParams
                                    .newBuilder()
                                    .setProductDetails(productDetails)
                                    .setOfferToken(productDetails
                                            .getSubscriptionOfferDetails()
                                            .get(0).getOfferToken()).build()))
                            .build();


                    billingClientEventEmitter.addExclusiveListenerOnce((billingResult, purchases) -> {
                        Purchase purchase = findPendingPurchase(billingResult
                                , purchases);

                        if (purchase != null) {
                            JSObject data = serializePurchase(purchase);
                            call.resolve(data);
                        } else {
                            call.reject("Billing flow not successful.",
                                    "PURCHASE_CANCELLED");
                        }
                    });

                    billingClient.launchBillingFlow(this.activity,
                            billingFlowParams);

                } catch (Exception e) {
                    e.printStackTrace();
                    call.reject("Could start billing flow.",
                            "PURCHASE_FAILED",e);
                }
            });
        }

    }

    public void acknowledgePurchase(String purchaseToken, PluginCall call) {
        JSObject response = new JSObject();

        if (billingClientIsConnected == 1) {
            AcknowledgePurchaseParams acknowledgePurchaseParams =
                    AcknowledgePurchaseParams
                    .newBuilder().setPurchaseToken(purchaseToken).build();

            billingClient.acknowledgePurchase(acknowledgePurchaseParams,
                    billingResult1 -> {
                response.put("successful", true);
                call.resolve(response);
            });

        } else {
            call.reject("Billing client is not connected",
                    "BILLING_CLIENT_NOT_CONNECTED");
        }
    }

    private String getExpiryDateFromGoogle(String productIdentifier,
                                           String purchaseToken) {

        try {

            // Compile request to verify purchase token
            URL obj =
                    new URL(this.googleVerifyEndpoint + "?bid=" + this.googleBid + "&subId=" + productIdentifier + "&purchaseToken=" + purchaseToken);
            HttpURLConnection con = (HttpURLConnection) obj.openConnection();
            con.setRequestMethod("GET");

            // Try to receive response from server
            try (BufferedReader br =
                         new BufferedReader(new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))) {

                StringBuilder googleResponse = new StringBuilder();
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    googleResponse.append(responseLine.trim());
                    Log.i("Response Line", responseLine);
                }

                // If the response was successful, extract expiryDate and put
                // it in our response data property
                if (con.getResponseCode() == 200) {

                    JSObject postResponseJSON =
                            new JSObject(googleResponse.toString());
                    JSObject googleResponseJSON = new JSObject(postResponseJSON
                            .get("googleResponce")
                            .toString()); // <-- note the typo in response
                    // object from server
                    JSObject payloadJSON = new JSObject(googleResponseJSON
                            .get("payload").toString());

                    String dateFormat =
                            "EEE MMM dd yyyy HH:mm:ss 'GMT'Z '" + "('z')'";
                    SimpleDateFormat simpleDateFormat =
                            new SimpleDateFormat(dateFormat);
                    Calendar calendar = Calendar.getInstance();
                    calendar.setTimeInMillis(Long.parseLong((payloadJSON
                            .get("expiryTimeMillis").toString())));

                    Log.i("EXPIRY",
                            simpleDateFormat.format(calendar.getTime()));

                    return simpleDateFormat.format(calendar.getTime());

                } else {
                    return null;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // If the method manages to each this far before already returning,
        // just return null
        // because something went wrong
        return null;
    }

    public Purchase findPendingPurchase(BillingResult billingResult,
                                        List<Purchase> purchases) {
        if (purchases != null) {
            for (int i = 0; i < purchases.size(); i++) {
                Purchase currentPurchase = purchases.get(i);

                if (!currentPurchase.isAcknowledged() && billingResult.getResponseCode() == 0 && currentPurchase.getPurchaseState() != 2) {
                    return currentPurchase;
                }
            }
        }

        return null;
    }


    @NonNull
    public JSObject serializeProductDetails(ProductDetails productDetails) {

        List<ProductDetails.SubscriptionOfferDetails> subscriptionOfferDetails = productDetails.getSubscriptionOfferDetails();

        String price = subscriptionOfferDetails.get(0).getPricingPhases()
                .getPricingPhaseList().get(0).getFormattedPrice();
        String currency = subscriptionOfferDetails.get(0).getPricingPhases()
                .getPricingPhaseList().get(0).getPriceCurrencyCode();

        return new JSObject()
                .put("productIdentifier", productDetails.getProductId())
                .put("displayName", productDetails.getTitle())
                .put("description", productDetails.getDescription())
                .put("price", price).put("currency", currency);
    }

    @NonNull
    public JSObject serializePurchase(Purchase purchase) {
        String expiryDate = this.getExpiryDateFromGoogle(purchase.getProducts()
                .get(0), purchase.getPurchaseToken());
        String orderId = purchase.getOrderId();

        String dateFormat = "dd-MM-yyyy hh:mm";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat);
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(Long.parseLong((String.valueOf(purchase.getPurchaseTime()))));

        return new JSObject()
                .put("productIdentifier", purchase.getProducts().get(0))
                .put("purchaseToken", purchase.getPurchaseToken())
                .put("isAcknowledged", purchase.isAcknowledged())
                .put("obfuscatedAccountId", purchase.getAccountIdentifiers()
                        .getObfuscatedAccountId()).put("expiryDate", expiryDate)
                .put("originalStartDate",
                        simpleDateFormat.format(calendar.getTime()))
                .put("originalId", orderId).put("transactionId", orderId);
    }
}
