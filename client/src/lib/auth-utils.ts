/**
 * Client-side authentication utilities
 * Handles role checking and admin verification
 */

export interface User {
  id?: number;
  userId?: number;
  email: string;
  role?: "admin" | "subscriber";
  plan?: string;
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("appToken");
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin" || false;
}

/**
 * Check if user is subscriber
 */
export function isSubscriber(): boolean {
  const user = getCurrentUser();
  return user?.role === "subscriber" || false;
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("appToken");
}

/**
 * Logout user - Secure sign-out with complete state cleanup
 */
export function logout(): void {
  // Clear all authentication-related data
  localStorage.removeItem("appToken");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  localStorage.removeItem("signupEmail");
  localStorage.removeItem("signupPlanData");
  localStorage.removeItem("activeProfileId");
  localStorage.removeItem("selectedPlan");
  
  // Clear sessionStorage as well
  sessionStorage.clear();
  
  // Reset to login page
  window.location.href = "/login";
}

/**
 * Get user's subscription plan
 */
export function getUserPlan(): string {
  const user = getCurrentUser();
  return user?.plan || "free";
}
