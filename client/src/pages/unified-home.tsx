import { useEffect } from "react";
import { useLocation } from "wouter";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import TVHome from "./tv-home";
import Home from "./home";

/**
 * Unified home page that adapts to different device types
 * - TV: Shows TV optimized interface with D-pad navigation
 * - Mobile: Shows touch-friendly interface
 * - Desktop: Shows full web interface
 */
export default function UnifiedHome() {
  const deviceType = useDeviceDetection();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("appToken");
    const user = localStorage.getItem("user") || localStorage.getItem("appUser");
    
    // If NOT authenticated, redirect to login
    if (!token || !user) {
      setLocation("/login");
      return;
    }
    
    // If authenticated on admin, redirect to admin dashboard
    try {
      const userData = JSON.parse(user);
      if (userData.role === "admin") {
        setLocation("/admin/dashboard");
        return;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, [setLocation]);

  // Render appropriate interface based on device type
  if (deviceType === 'tv') {
    return <TVHome />;
  }

  return <Home />;
}
