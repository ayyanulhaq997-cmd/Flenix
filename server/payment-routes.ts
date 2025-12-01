import type { Express } from "express";
import { storage } from "./storage";
import { authMiddleware, adminMiddleware } from "./auth";
import axios from "axios";

// Stripe integration for payment processing
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";

export function registerPaymentRoutes(app: Express) {
  // Get subscription plans with pricing
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
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

      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // In production, would create Stripe payment intent
      const paymentIntentData = {
        planId,
        userId,
        amount: plan.price * 100, // Convert to cents
        currency: "usd",
        metadata: {
          userId,
          planId,
          planName: plan.name,
        },
      };

      // Mock response - in production call Stripe API
      const clientSecret = `pi_${Date.now()}_secret`;

      res.json({
        clientSecret,
        amount: plan.price * 100,
        currency: "usd",
        planId,
        planName: plan.name,
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

      // In production, would verify payment with Stripe
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // Update user subscription
      await storage.updateUserSubscription(userId, planId);

      // Create billing record
      const billing = await storage.createBillingRecord({
        userId,
        planId,
        amount: plan.price,
        status: "paid",
        paymentMethod: "stripe",
        transactionId: paymentIntentId,
      });

      res.json({
        success: true,
        billing,
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
