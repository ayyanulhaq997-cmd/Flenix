import jwt from "jsonwebtoken";
import { type Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "CRITICAL: JWT_SECRET environment variable is not set. " +
    "Please set JWT_SECRET before starting the server. " +
    "Generate a secure secret with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  );
}
const TOKEN_EXPIRY = "7d";

export interface AuthPayload {
  userId: number;
  email: string;
  plan: string;
  role?: "admin" | "subscriber"; // Role-based access control
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Generate JWT token for user
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to check authentication (all authenticated users)
 * Used for subscriber API endpoints and protected routes
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

/**
 * Strict admin middleware for backend security
 * Checks user role in JWT payload - prevents bypassing frontend restrictions
 * Returns 403 Forbidden if user is not admin, even if authenticated
 * 
 * Security Note: This is the primary defense against unauthorized access to admin APIs.
 * Frontend cannot be trusted - users can modify localStorage and bypass UI restrictions.
 * This middleware enforces role restrictions at the server level.
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  // 1. Check if token exists
  if (!token) {
    return res.status(401).json({ error: "No token provided. Admin access required." });
  }

  // 2. Verify token validity
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token. Admin access required." });
  }

  // 3. Attach user to request
  req.user = decoded;

  // 4. Check role - STRICT enforcement
  // User must have admin role, even if they're otherwise authenticated
  if (decoded.role !== "admin") {
    return res.status(403).json({
      error: "Access denied. Admin role required.",
      userRole: decoded.role || "subscriber",
      requiresRole: "admin"
    });
  }

  // All checks passed - user is authenticated admin
  next();
}

// Generate temporary streaming URL (simulated - in production would use a dedicated streaming server)
export function generateStreamingUrl(movieId: number, videoUrl: string): string {
  const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry
  const signatureData = `${movieId}:${expirationTime}`;
  const signature = jwt.sign({ movieId, exp: expirationTime }, JWT_SECRET);
  
  return `/stream/${movieId}?token=${signature}`;
}

// Verify streaming token
export function verifyStreamingToken(movieId: number, token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.movieId === movieId;
  } catch (error) {
    return false;
  }
}
