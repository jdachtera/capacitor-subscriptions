# Capacitor Subscription

Fork of https://github.com/Craig-Ronald/capacitor-subscriptions with a simplified promise API

---

A capacitor plugin which simplifies subscription handling - implementing StoreKit 2 and Google Billing 5.

## Install

```bash
npm install @jdachtera/capacitor-subscriptions
ionic cap sync
```

## Summary

This plugin is designed to simplify and reduce the workload of a developer when implementing auto-renewing subscriptions for iOS and Android apps.

The plugin primarily uses a promise-based architecture to allow a developer to have greater control over the purchase and validation processes involved when interacting with StoreKit 2 and Google Billing 5.

Examples - Subscriptions

- [Initial Android setup (server validation)](#markdown-header-initial-android-setup-server-validation)
- [Determining if user has an active subscription or not](#markdown-header-determining-if-user-has-an-active-subscription-or-not)
- [Retrieve the most recent transaction in order to provide user feedback on when their subscription expires/expired](#markdown-header-retrieve-the-most-recent-transaction-regardless-of-whether-or-not-it-is-active-useful-for-providing-feedback-on-when-the-subscription-willhas-expired)
- [Retrieving product details e.g. price](#markdown-header-retrieving-product-details-eg-price)
- [Payment initiation and flow (iOS)](#markdown-header-payment-initiation-and-flow-ios)
- [Payment initiation and flow (Android)](#markdown-header-payment-initiation-and-flow-android)

## API Docs

For a more in-depth look into the different parameters for methods, along with the corresponding types. Please look into a breakdown of the API:

[API Documentation](api-docs.md)

## More in-depth review of the plugin

As it stands, the [current plugin listed on the capacitor website](https://ionicframework.com/docs/native/in-app-purchase-2) can be used to achieve a working solution for subscription processing, however after using that plugin myself, I found many of the listener methods to be redundant, and the server-side transaction verifying tedious, and not very well documented.

By changing how the store data is received from listener-based methods to promise-based methods, the overall process of receiving data is a lot more stream-lined - returning only necessary data as opposed to every transaction a user has ever made.

This plugin implements capabilities to allow the developer to:

- No longer have to use server-side technology to verify Apple’s horribly-formatted receipt - transactions are now automatically verified on Apple’s end.
- Retrieve all currently active subscriptions allowing you to determine whether or not the user has access to content with just a single line of code.
- Not have to worry about handling transactions which are made outside of the purchase-flow (e.g. an auto renewed subscription) as this is taken care of on the native side of the plugin.
- Create more responsive IAP processes by awaiting promise calls, making the processes synchronous and predictable.

## Limitations

- Google unfortunately still requires a server-side call to verify a transaction’s purchase token in order to find out the expiry date of a subscription (there is currently no way around this).

- To help make this as painless as can be, a method is available which will perform the request upon passing in your server’s verification endpoint and app bundle details. A guide on how to set up your server to connect to your app can be found [here](#markdown-header-initial-android-setup-server-validation)

- As this library uses StoreKit 2, any users on anything lower than iOS 15 will have to upgrade in order to access the app.

# Examples

## Initial Android setup (server validation)

Before calling any methods on the plugin, it is essential to pass a few parameters into the "setGoogleVerificationDetails(...)" method. In an Ionic app, this would be most appropriate near the top of the App.tsx file - simply pass in the server endpoint for the google verification call, along with the app bid, e.g:

```javascript
useEffect(() => {
  SubscriptionController.setGoogleVerificationDetails(
    'https://YOUR-END-POINT.com/verifyGoogleReceipt',
    'com.*TEAM-NAME*.APP-NAME',
  );

  // start making calls to other plugin methods
}, []);
```

**NOTE** - It is NOT required to specifically check that the device is an Android one before executing this code. If this code is executed on an iOS device, the plugin will just ignore it.

## Determining if user has an active subscription or not

Calling getCurrentEntitlements() will return an array of subscription transactions which are still active - if the array length is greater than one, then the user has an active subscription.

```javascript
const [hasActiveSubscription, setHasActiveSubscription] = useState(false)

SubscriptionController.getCurrentEntitlements().then((entitlements: any) => {
	setHasActiveSubscription(entitlements.length > 0);
});

async getCurrentEntitlements() {

	const response: CurrentEntitlementsResponse = await  Subscriptions.getCurrentEntitlements();
	if(response.responseCode == 0){
		return response.data  as  Transaction[];
	} else {
		return [];
	}
}
```

## Retrieve the most recent transaction regardless of whether or not it is active (useful for providing feedback on when the subscription will/has expired)

Using getLatestTransaction(...) and passing the relevant product identifier (linked to your iOS/Android subscription products), will return the most recent transaction the user has made for that product.

```javascript
productIDs = {
	"ios": {
		"oneMonth": "com.your.subscriptionid.monthly",
		"twelveMonth": "com.your.subscriptionid.yearly",
	},
	"android": {
		"oneMonth":  "com.your.subscriptionid.android.1.month",
		"twelveMonth":  "com.your.subscriptionid.android.12.months"
	}
}

async getLatestTransaction(): Promise<Transaction | undefined> {

	try {

		const  platform = (await  Device.getInfo()).platform;

		const  oneMonthTransaction: Transaction = await Subscriptions.getLatestTransaction({
			productIdentifier: productIDs[platform]["oneMonth"]
		});

		const  twelveMonthTransaction: Transaction = await  Subscriptions.getLatestTransaction({
			productIdentifier: productIDs[platform]["twelveMonth"]
		});

		const [oneMonthTransactionOrNull, twelveMonthTransactionOrNull] = await  Promise.all([
			Subscriptions.getLatestTransaction({
				productIdentifier: productIDs[platform]["oneMonth"]
			}).error(err => null)
			Subscriptions.getLatestTransaction({
				productIdentifier: productIDs[platform]["twelveMonth"]
			}).error(err => null)
		])

		// If user has had both a one month and twelve month subscription in the past
		// we need to check the expiry date of both and return the most recent one.
		if(oneMonthTransactionOrNull && twelveMonthTransactionOrNull) {
			const  oneMonthTransactionExpiry = new  Date(oneMonthTransactionOrNull.expiryDate);
			const  twelveMonthTransactionExpiry = new  Date(twelveMonthTransactionOrNull.expiryDate);

			if(oneMonthTransactionExpiry > twelveMonthTransactionExpiry) { return oneMonthTransactionExpiry }
			else { return  twelveMonthTransactionExpiry }

		} else  if (oneMonthTransactionOrNull) {
			return  oneMonthTransactionOrNull
		} else  if (twelveMonthTransactionOrNull) {
			return  twelveMonthTransactionOrNull
		} else {
			return  undefined;
		}

	} catch(error: any) {

		console.log("Error when attempting to retrieve transaction info", error);
		return undefined;

	}
},
```

## Retrieving product details e.g. price

Passing in the subscription's product identifier to getProductDetails(...) will return a product object containing relevant information about the product.

```javascript
productIDs = {
	"ios": {
		"oneMonth": "com.your.subscriptionid.monthly",
		"twelveMonth": "com.your.subscriptionid.yearly",
	},
	"android": {
		"oneMonth":  "com.your.subscriptionid.android.1.month",
		"twelveMonth":  "com.your.subscriptionid.android.12.months"
	}
}

const [oneMonthPrice, setOneMonthPrice] = useState("Loading...");
const [twelveMonthPrice, settwelveMonthPrice] = useState("Loading...");

async retrieveProductDetails() {

	const platform = (await Device.getInfo()).platform;

	try {
		const oneMonthProduct: Product = await Subscriptions.getProductDetails({
			productIdentifier:  productIDs[platform]["oneMonth"];
		});
		setOneMonthPrice(oneMonthProduct.price);
	} catch(error) {
		setOneMonthPrice(`Failed: ${error.message} (${error.code})`);
	}

	try {
		const twelveMonthProduct: Product = await Subscriptions.getProductDetails({
			productIdentifier:  productIDs[platform]["twelveMonth"];
		});
		setTwelveMonthPrice(oneTwelveProduct.price);
	} catch(error) {
		setTwelveMonthPrice(`Failed: ${error.message} (${error.code})`);
	}

}
```

## Payment initiation and flow (iOS)

Initiating the payment flow (bringing up the native payment popover) is simple on iOS, it just requires awaiting a call to the purchaseProduct(...) method - passing in the necessary product identifier.

```javascript
productIDs = {
	"ios": {
		"oneMonth": "com.your.subscriptionid.monthly",
		"twelveMonth": "com.your.subscriptionid.yearly",
	},
	"android": {
		"oneMonth":  "com.your.subscriptionid.android.1.month",
		"twelveMonth":  "com.your.subscriptionid.android.12.months"
	}
}

async  purchaseProduct(productType: "oneMonth" | "twelveMonth") {

	const platform = (await Device.getInfo()).platform;
	const transaction : AppleTransaction = await Subscriptions.purchaseProduct({
		productIdentifier: productIDs[platform][productType];
		appAccountToken: '1234-5678-9012-3456-7890-1234' // Optional
	})

}
```

In your HTML code, inside a function which is triggered upon clicking a purchase button. You can simply just await a call to the method above, blocking the function until the process has finished (i.e. user finishing paying, or cancelled/closed the popover). The function will then resume, so a call to a validation function can be made to update the app depending on the result of the purchaseProduct(...) call.

```javascript
<div
  className="subscription-btn"
  onClick={async () => {
    setIsInPurchaseProcess(true);
    await purchaseProduct('twelveMonth'); // <-- waits until native popover is closed
    await validateUserAccess(); // <-- Useful to have a easy accessible method which validates user access (either by checking current entitlements or most recent transaction).

    if (isPlatform('ios')) {
      setIsInPurchaseProcess(false);
    }
  }}
>
  <div className="subscription-btn-txt">12 month / {twelveMonthPrice}</div>
</div>
```

## Payment initiation and flow (Android)

Google purchases need to be acknowledged by Google. This is done by calling the acknowledgePurchase(...) method, passing in the purchase token. Alternatively you can acknowledge the purchase on the server side.This is necessary to retrieve certain information about the purchase which will not be returned if the purchase is already acknowledged on the client side.

Additionally you can also listen for the "ANDROID-PURCHASE-SUCCESS" event to be triggered when the purchase is changed by Google. This can be useful for updating the app's state to reflect purchase events that happen through the Google Play Store (e.g. resubscribing to a subscription).

```javascript
useEffect(() => {
	Subscriptions.addListener("ANDROID-PURCHASE-SUCCESS", (transaction: GoogleTransaction) => {
		sendTransactionToServer(transaction);
	});
}, [])

async  purchaseProduct(productType: "oneMonth" | "twelveMonth") {

	const platform = (await Device.getInfo()).platform;
	const transaction : GoogleTransaction = await Subscriptions.purchaseProduct({
		productIdentifier: productIDs[platform][productType];
		obfuscatedAccountId: '1234-5678-9012-3456-7890-1234' // Optional
	})
	// The transaction object will contain the purchaseToken, which is required to acknowledge the ////purchase to Google.
	// This can be done by either calling the acknowledgePurchase(...) method or on the server side using the Google Play Developer API.
	await Subscriptions.acknowledgePurchase({
		purchaseToken: transaction.purchaseToken
	})


}
```
