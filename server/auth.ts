import jwt from "jsonwebtoken";
import { type Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "fenix-secret-key-change-in-production";
const TOKEN_EXPIRY = "7d";

export interface AuthPayload {
  userId: number;
  email: string;
  plan: string;
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

// Middleware to check authentication
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
