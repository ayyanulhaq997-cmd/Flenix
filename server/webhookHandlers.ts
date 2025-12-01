import { getStripeSync } from "./stripeClient";
import { storage } from "./storage";
import { getUncachableStripeClient } from "./stripeClient";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature, uuid);
  }

  static async handleCustomerSubscriptionUpdated(event: any) {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const email = subscription.metadata?.email;
    
    if (email) {
      try {
        const user = await storage.getAppUserByEmail(email);
        if (user) {
          await storage.updateAppUser(user.id, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            plan: subscription.metadata?.planName?.toLowerCase() || 'free',
          });
        }
      } catch (error) {
        console.error('Error handling subscription update:', error);
      }
    }
  }

  static async handlePaymentIntentSucceeded(event: any) {
    const paymentIntent = event.data.object;
    const email = paymentIntent.metadata?.email;
    const planName = paymentIntent.metadata?.planName;

    if (email) {
      try {
        const user = await storage.getAppUserByEmail(email);
        if (user && !user.stripeCustomerId) {
          await storage.updateAppUser(user.id, {
            stripeCustomerId: paymentIntent.customer,
            plan: planName?.toLowerCase() || 'standard',
          });
        }
      } catch (error) {
        console.error('Error handling payment intent succeeded:', error);
      }
    }
  }
}
