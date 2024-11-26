import Capacitor
import Foundation
import StoreKit

/// Please read the Capacitor iOS Plugin Development Guide
/// here: https://capacitorjs.com/docs/plugins/ios
@objc(SubscriptionsPlugin)
public class SubscriptionsPlugin: CAPPlugin {
    
    // Allows us to execute the actual code from Subscriptions.swift file
    private let implementation = Subscriptions()
    
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        
        call.resolve([
            "value": value
        ])
    }
    
    @available(iOS 15.0.0, *)
    @objc func getProductDetails(_ call: CAPPluginCall) {
        
        guard let productIdentifier = call.getString("productIdentifier")  else {
            call.reject("Must provide a productID")
            return
        }
        
        Task.init {
            await implementation.getProductDetails(productIdentifier, call: call)
        }
    }
    
    @available(iOS 15.0.0, *)
    @objc func purchaseProduct(_ call: CAPPluginCall) {
        
        guard let productIdentifier = call.getString("productIdentifier")  else {
            call.reject("Must provide a productID")
            return
        }
        
        let appAccountToken = call.getString("appAccountToken") as String?
        
        Task.init {
            await implementation.purchaseProduct(productIdentifier, appAccountToken, call: call)
        }
        
    }
    
    @available(iOS 15.0.0, *)
    @objc func getCurrentEntitlements(_ call: CAPPluginCall) {
        
        Task.init {
            await implementation.getCurrentEntitlements(call)
        }
        
    }
    
    @available(iOS 15.0.0, *)
    @objc func getLatestTransaction(_ call: CAPPluginCall) {
        
        guard let productIdentifier = call.getString("productIdentifier") else {
            call.reject("Must provide a productID")
            return
        }
        
        Task.init {
            await implementation.getLatestTransaction(productIdentifier, call: call)
        }
        
    }
    
    @available(iOS 15.0.0, *)
    @objc func manageSubscriptions(_ call: CAPPluginCall) {
        
        Task.init {
            
            do {
                await implementation.manageSubscriptions()
                call.resolve(["Success": "Opened"])
            } catch {
                print(error.localizedDescription)
                call.reject(error.localizedDescription)
            }
            
        }
        
    }
    
}
