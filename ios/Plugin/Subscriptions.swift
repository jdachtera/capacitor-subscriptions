import Capacitor
import Foundation
import StoreKit
import UIKit

@objc public class Subscriptions: NSObject {

  override init() {
    super.init()
    if #available(iOS 15.0.0, *) {
      let transactionListener = listenForTransactions()
      let unfinishedListener = finishTransactions()
    } else {
      // Fallback on earlier versions
    }
  }

  // When the subscription renews at the end of the month, a transaction will
  // be queued for when the app is next opened. This listener handles any transactions
  // within the queue and finishes verified purchases to clear the queue and prevent
  // any bugs or performance issues occuring
  @available(iOS 15.0.0, *)
  private func listenForTransactions() -> Task<Void, Error> {
    return Task.detached {

      //Iterate through any transactions that don't come from a direct call to `purchase()`.
      for await verification in Transaction.updates {

        guard
          let transaction: Transaction = self.checkVerified(verification)
            as? Transaction
        else {
          print("checkVerified failed")
          return

        }
        await transaction.finish()
        print("Transaction finished and removed from paymentQueue - Transactions.updates")
      }
    }
  }

  @available(iOS 15.0.0, *)
  private func finishTransactions() -> Task<Void, Error> {
    return Task.detached {

      //Iterate through any transactions that don't come from a direct call to `purchase()`.
      for await verification in Transaction.unfinished {

        guard
          let transaction: Transaction = self.checkVerified(verification)
            as? Transaction
        else {
          print("checkVerified failed")
          return

        }

        await transaction.finish()
        print("Transaction finished and removed from paymentQueue - transactions.unfinished")
      }
    }
  }

  @available(iOS 15.0.0, *)
  public func getProductDetails(_ productIdentifier: String, call: CAPPluginCall) async {

    guard let product: Product = await getProduct(productIdentifier) as? Product else {
      call.reject("Could not find a product matching the given productIdentifier", "PRODUCT_NOT_FOUND")
      return
    }

    call.resolve(formatProduct(product))
  }

  @available(iOS 15.0.0, *)
  @objc public func purchaseProduct(
    _ productIdentifier: String, _ appAccountToken: String?, call: CAPPluginCall
  ) async {

    do {

      guard let product: Product = await getProduct(productIdentifier) as? Product else {
        call.reject("Could not find a product matching the given productIdentifier", "PRODUCT_NOT_FOUND")
        return
      }

      var options: Set<Product.PurchaseOption> = []

      if let appAccountTokenUUID = UUID(uuidString: appAccountToken ?? "") {
        options.insert(.appAccountToken(appAccountTokenUUID))
      }

      let result: Product.PurchaseResult = try await product.purchase(options: options)

      switch result {

      case .success(let verification):
        guard let transaction: Transaction = checkVerified(verification) as? Transaction else {
          call.reject(
            "Product seems to have been purchased but the transaction failed verification", "VALIDATION_FAILED")
          return
        }
        await transaction.finish()
        call.resolve(formatTransaction(transaction))
        return
      case .userCancelled:
        call.reject("User closed the native popover before purchasing", "PURCHASE_CANCELLED")
        return
      case .pending:
        call.reject(
          "Product request made but is currently pending - likely due to parental restrictions", "PURCHASE_PENDING")
        return
      default:
        call.reject("An unknown error occurred whilst in the purchasing process", "UNKNOWN_ERROR")
        return
      }

    } catch {
      print(error.localizedDescription)
      call.reject("An unknown error occured whilst in the purchasing process", "UNKNOWN_ERROR", error)
    }

  }

  @available(iOS 15.0.0, *)
  @objc public func getCurrentEntitlements(_ call: CAPPluginCall) async {

    do {

      var entitlements = JSArray()

      // Loop through each verification result in currentEntitlements, verify the transaction
      // then add it to the transactionDictionary if verified.
      for await verification in Transaction.currentEntitlements {
        if let transaction: Transaction = checkVerified(verification) as? Transaction {
          entitlements.append(formatTransaction(transaction))
        }
      }
      if entitlements.count > 0 {
        call.resolve([
          "entitlements": entitlements
        ])
      } else {
        // Otherwise - no entitlements were found
        call.reject("No entitlements were found", "TRANSACTION_NOT_FOUND")
      }

    } catch {
      print(error.localizedDescription)
      call.reject("Unknown problem trying to retrieve entitlements", "UNKNOWN_ERROR")
    }

  }

  @available(iOS 15.0.0, *)
  @objc public func getLatestTransaction(_ productIdentifier: String, call: CAPPluginCall) async {

    do {
      guard let product: Product = await getProduct(productIdentifier) as? Product else {
        call.reject("Could not find a product matching the given productIdentifier", "PRODUCT_NOT_FOUND")
        return
      }

      guard
        let transaction: Transaction = checkVerified(await product.latestTransaction)
          as? Transaction
      else {
        // The user hasn't purchased this product.
        call.reject("No transaction for given productIdentifier, or it could not be verified", "TRANSACTION_NOT_FOUND")
        return
      }

      print("expiration" + String(decoding: formatDate(transaction.expirationDate)!, as: UTF8.self))
      print("transaction.expirationDate", transaction.expirationDate)
      print("transaction.originalID", transaction.originalID)

      if let appStoreReceiptURL = Bundle.main.appStoreReceiptURL,
        FileManager.default.fileExists(atPath: appStoreReceiptURL.path)
      {

        do {
          let receiptData = try Data(contentsOf: appStoreReceiptURL, options: .alwaysMapped)
          print("Receipt Data: ", receiptData)

          let receiptString = receiptData.base64EncodedString(options: [
            Data.Base64EncodingOptions.endLineWithCarriageReturn
          ])
          print("Receipt String: ", receiptString)

          // Read receiptData.
        } catch { print("Couldn't read receipt data with error: " + error.localizedDescription) }
      }
      call.resolve(formatTransaction(transaction))

    } catch {
      print("Error:" + error.localizedDescription)
      call.reject("Unknown problem trying to retrieve latest transaction", "UNKNOWN_ERROR")
    }

  }

  @available(iOS 15.0.0, *)
  @objc public func manageSubscriptions() async {

    let manageTransactions: UIWindowScene
    await UIApplication.shared.open(URL(string: "https://apps.apple.com/account/subscriptions")!)

  }

  @available(iOS 15.0.0, *)
  @objc private func formatDate(_ date: Date?) -> Data? {

    let df = DateFormatter()
    df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
    return df.string(for: date)?.data(using: String.Encoding.utf8)!

  }

  @available(iOS 15.0.0, *)
  private func formatTransaction(_ transaction: Transaction) -> JSObject {
    return [
      "productIdentifier": transaction.productID,
      "originalStartDate": transaction.originalPurchaseDate,
      "originalId": String(transaction.originalID),
      "transactionId": String(transaction.id),
      "expiryDate": transaction.expirationDate ?? Date(),
      "appAccountToken": transaction.appAccountToken?.uuidString ?? "",
    ]

  }

  @available(iOS 15.0.0, *)
  private func formatProduct(_ product: Product) -> JSObject {
    return [
      "productIdentifier": product.id,
      "displayName": product.displayName,
      "description": product.description,
      "price": (product.price as NSNumber),
    ]
  }

  @available(iOS 15.0.0, *)
  @objc private func updateTrialDate(_ bid: String, _ formattedDate: Data?) {

    let keyChainUpdateParams: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: bid,
    ]

    let keyChainUpdateValue: [String: Any] = [
      kSecValueData as String: formattedDate
    ]

    let updateStatusCode = SecItemUpdate(
      keyChainUpdateParams as CFDictionary, keyChainUpdateValue as CFDictionary)
    let updateStatusMessage = SecCopyErrorMessageString(updateStatusCode, nil)

    print("updateStatusCode in SecItemUpdate", updateStatusCode)
    print("updateStatusMessage in SecItemUpdate", updateStatusMessage)

  }

  @available(iOS 15.0.0, *)
  @objc private func getProduct(_ productIdentifier: String) async -> Any? {

    do {
      let products = try await Product.products(for: [productIdentifier])
      if products.count > 0 {
        let product = products[0]
        return product
      }
      return nil
    } catch {
      return nil
    }

  }

  @available(iOS 15.0.0, *)
  func checkVerified(_ vr: Any?) -> Any? {

    switch vr as? VerificationResult<Transaction> {
    case .verified(let safe):
      return safe
    case .unverified:
      return nil
    default:
      return nil
    }

  }

}
