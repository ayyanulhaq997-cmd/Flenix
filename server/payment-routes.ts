import type { Express } from "express";
import { storage } from "./storage";
import { authMiddleware, adminMiddleware } from "./auth";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";

export function registerPaymentRoutes(app: Express) {
  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create payment intent for new subscription (signup)
  app.post("/api/payments/create-intent", async (req, res) => {
    try {
      const { email, planId, name } = req.body;

      if (!email || !planId) {
        return res.status(400).json({ error: "Missing email or planId" });
      }

      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // Create or get customer
      let customer = await storage.getStripeCustomerByEmail(email);
      if (!customer) {
        customer = await stripeService.createCustomer(email, 0, name);
      }

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent(
        customer.id,
        plan.price / 100, // Convert from cents
        email,
        plan.name
      );

      res.json({
        clientSecret: paymentIntent.client_secret,
        intentId: paymentIntent.id,
        publishableKey: await getStripePublishableKey(),
      });
    } catch (error: any) {
      console.error("Payment intent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Confirm payment and create account
  app.post("/api/payments/confirm-and-register", async (req, res) => {
    try {
      const { paymentIntentId, planId, email, password, name } = req.body;

      if (!paymentIntentId || !planId || !email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await storage.getAppUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Verify payment intent succeeded
      const paymentIntent = await stripeService.confirmPaymentIntent(paymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not confirmed" });
      }

      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // Create user account with Stripe info
      const user = await storage.createAppUser({
        name,
        email,
        passwordHash: password,
        plan: plan.name.toLowerCase(),
        emailVerified: true,
        stripeCustomerId: paymentIntent.customer,
      });

      // Generate token
      const token = await storage.generateAuthToken(user);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create payment intent for subscription upgrade
  app.post("/api/payments/intent", authMiddleware, async (req, res) => {
    try {
      const { planId } = req.body;
      const userId = req.user?.userId;

      if (!userId || !planId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getAppUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent(
        user.stripeCustomerId || "",
        plan.price / 100,
        user.email,
        plan.name
      );

      res.json({
        clientSecret: paymentIntent.client_secret,
        intentId: paymentIntent.id,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Confirm payment and upgrade subscription
  app.post("/api/payments/confirm", authMiddleware, async (req, res) => {
    try {
      const { paymentIntentId, planId } = req.body;
      const userId = req.user?.userId;

      if (!userId || !paymentIntentId || !planId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripeService.confirmPaymentIntent(paymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not confirmed" });
      }

      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // Update user subscription
      await storage.updateAppUser(userId, {
        plan: plan.name.toLowerCase(),
      });

      res.json({
        success: true,
        message: "Subscription updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's billing history
  app.get("/api/billing/history", authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const history = await storage.getBillingHistory(userId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get all transactions
  app.get("/api/admin/transactions", adminMiddleware, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Simple payment processor for development/testing
  app.post("/api/payments/process", async (req, res) => {
    try {
      const { planId, amount, email, cardToken } = req.body;

      if (!planId || !amount || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // In production, this would be replaced with real Stripe integration
      // For now, simulate successful payment processing
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // Simulate payment success
      res.json({
        success: true,
        transactionId: `tx_${Date.now()}`,
        amount,
        planId,
        email,
        message: "Payment processed successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook for Stripe payment events
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const event = req.body;

      switch (event.type) {
        case "payment_intent.succeeded":
          console.log("[payment] Payment succeeded:", event.data.object.id);
          // Handle successful payment
          break;
        case "payment_intent.payment_failed":
          console.log("[payment] Payment failed:", event.data.object.id);
          // Handle failed payment
          break;
        case "customer.subscription.updated":
          console.log("[payment] Subscription updated");
          // Handle subscription updates
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
