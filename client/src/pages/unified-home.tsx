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
    if (token) {
      // Redirect to appropriate browse page based on device
      if (deviceType === 'tv') {
        setLocation("/tv");
      } else {
        setLocation("/browse");
      }
    }
  }, [deviceType, setLocation]);

  // Render appropriate interface based on device type
  if (deviceType === 'tv') {
    return <TVHome />;
  }

  return <Home />;
}
