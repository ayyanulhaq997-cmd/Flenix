import { storage } from "./storage";
import { getUncachableStripeClient } from "./stripeClient";

export class StripeService {
  async createCustomer(email: string, userId: number, name?: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      name,
      metadata: { userId: userId.toString() },
    });
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'auto',
    });
  }

  async createPaymentIntent(customerId: string, amount: number, email: string, planName: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.paymentIntents.create({
      customer: customerId,
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        email,
        planName,
      },
    });
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getProduct(productId: string) {
    return await storage.getProduct(productId);
  }

  async getPrice(priceId: string) {
    return await storage.getPrice(priceId);
  }

  async listProducts(limit = 20, offset = 0) {
    return await storage.listProducts(true, limit, offset);
  }

  async listPrices(productId: string) {
    return await storage.getPricesForProduct(productId);
  }
}

export const stripeService = new StripeService();
