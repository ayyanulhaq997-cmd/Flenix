import { appUsers } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { generateToken } from "./auth";
import bcrypt from "bcryptjs";

/**
 * Stripe Storage Methods
 * Handles Stripe-related database operations and token generation
 */

export async function getStripeCustomerByEmail(email: string) {
  try {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.email, email));
    return user?.stripeCustomerId ? { id: user.stripeCustomerId } : null;
  } catch (error) {
    console.error("Error getting Stripe customer:", error);
    return null;
  }
}

export async function generateAuthToken(user: any) {
  return generateToken({
    userId: user.id,
    email: user.email,
    plan: user.plan,
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
